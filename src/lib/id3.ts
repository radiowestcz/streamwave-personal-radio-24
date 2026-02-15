export interface ID3Data {
  title?: string;
  artist?: string;
  album?: string;
  coverBlob?: Blob;
}

/**
 * Reads ID3v2 tags from an audio file using raw ArrayBuffer parsing.
 * Supports ID3v2.3 and ID3v2.4 APIC (cover art), TIT2, TPE1, TALB frames.
 */
export const readID3Tags = (file: File): Promise<ID3Data> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const buffer = reader.result as ArrayBuffer;
        const view = new DataView(buffer);
        const result: ID3Data = {};

        // Check for ID3v2 header
        if (
          view.getUint8(0) !== 0x49 || // 'I'
          view.getUint8(1) !== 0x44 || // 'D'
          view.getUint8(2) !== 0x33    // '3'
        ) {
          resolve(result);
          return;
        }

        const version = view.getUint8(3); // 3 or 4
        const tagSize = decodeSynchsafe(view, 6);
        let offset = 10;
        const end = Math.min(10 + tagSize, buffer.byteLength);

        while (offset < end - 10) {
          const frameId = String.fromCharCode(
            view.getUint8(offset), view.getUint8(offset + 1),
            view.getUint8(offset + 2), view.getUint8(offset + 3)
          );

          if (frameId.charAt(0) === '\0') break;

          const frameSize = version === 4
            ? decodeSynchsafe(view, offset + 4)
            : view.getUint32(offset + 4);

          const frameData = offset + 10;

          if (frameId === 'TIT2') {
            result.title = readTextFrame(buffer, frameData, frameSize);
          } else if (frameId === 'TPE1') {
            result.artist = readTextFrame(buffer, frameData, frameSize);
          } else if (frameId === 'TALB') {
            result.album = readTextFrame(buffer, frameData, frameSize);
          } else if (frameId === 'APIC') {
            result.coverBlob = readAPICFrame(buffer, frameData, frameSize);
          }

          offset += 10 + frameSize;
        }

        resolve(result);
      } catch {
        resolve({});
      }
    };
    reader.onerror = () => resolve({});
    // Read first 512KB for tags
    reader.readAsArrayBuffer(file.slice(0, 524288));
  });
};

function decodeSynchsafe(view: DataView, offset: number): number {
  return (
    ((view.getUint8(offset) & 0x7f) << 21) |
    ((view.getUint8(offset + 1) & 0x7f) << 14) |
    ((view.getUint8(offset + 2) & 0x7f) << 7) |
    (view.getUint8(offset + 3) & 0x7f)
  );
}

function readTextFrame(buffer: ArrayBuffer, offset: number, size: number): string {
  const encoding = new Uint8Array(buffer)[offset];
  const textBytes = new Uint8Array(buffer, offset + 1, size - 1);

  if (encoding === 0 || encoding === 3) {
    // ISO-8859-1 or UTF-8
    return new TextDecoder(encoding === 3 ? 'utf-8' : 'iso-8859-1').decode(textBytes);
  } else if (encoding === 1 || encoding === 2) {
    // UTF-16 with or without BOM
    return new TextDecoder('utf-16').decode(textBytes);
  }
  return new TextDecoder().decode(textBytes);
}

function readAPICFrame(buffer: ArrayBuffer, offset: number, size: number): Blob | undefined {
  const bytes = new Uint8Array(buffer, offset, size);
  const encoding = bytes[0];
  let pos = 1;

  // Read MIME type (null-terminated ASCII)
  let mime = '';
  while (pos < size && bytes[pos] !== 0) {
    mime += String.fromCharCode(bytes[pos]);
    pos++;
  }
  pos++; // skip null

  // Picture type byte
  pos++;

  // Description (null-terminated)
  if (encoding === 0 || encoding === 3) {
    while (pos < size && bytes[pos] !== 0) pos++;
    pos++;
  } else {
    // UTF-16: look for double null
    while (pos < size - 1 && !(bytes[pos] === 0 && bytes[pos + 1] === 0)) pos += 2;
    pos += 2;
  }

  if (pos >= size) return undefined;

  const imageData = new Uint8Array(buffer, offset + pos, size - pos);
  return new Blob([imageData], { type: mime || 'image/jpeg' });
}

export const searchMusicBrainzCover = async (artist: string, title: string): Promise<string | null> => {
  try {
    const query = encodeURIComponent(`recording:"${title}" AND artist:"${artist}"`);
    const searchRes = await fetch(
      `https://musicbrainz.org/ws/2/recording?query=${query}&limit=1&fmt=json`,
      { headers: { 'User-Agent': 'StreamWaveRadio/1.0 (contact@streamwave.app)' } }
    );
    const searchData = await searchRes.json();

    if (!searchData.recordings?.length) return null;

    const releases = searchData.recordings[0].releases;
    if (!releases?.length) return null;
    const releaseId = releases[0].id;

    const coverUrl = `https://coverartarchive.org/release/${releaseId}/front-250`;
    const coverRes = await fetch(coverUrl, { method: 'HEAD' });
    if (coverRes.ok) return coverUrl;

    return null;
  } catch {
    return null;
  }
};
