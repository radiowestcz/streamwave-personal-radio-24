import jsmediatags from 'jsmediatags';

export interface ID3Data {
  title?: string;
  artist?: string;
  album?: string;
  coverBlob?: Blob;
}

export const readID3Tags = (file: File): Promise<ID3Data> => {
  return new Promise((resolve) => {
    jsmediatags.read(file, {
      onSuccess: (tag) => {
        const result: ID3Data = {
          title: tag.tags.title,
          artist: tag.tags.artist,
          album: tag.tags.album,
        };

        const picture = tag.tags.picture;
        if (picture) {
          const { data, format } = picture;
          const byteArray = new Uint8Array(data);
          result.coverBlob = new Blob([byteArray], { type: format });
        }

        resolve(result);
      },
      onError: () => {
        resolve({});
      },
    });
  });
};

export const searchMusicBrainzCover = async (artist: string, title: string): Promise<string | null> => {
  try {
    // Search for recording
    const query = encodeURIComponent(`recording:"${title}" AND artist:"${artist}"`);
    const searchRes = await fetch(
      `https://musicbrainz.org/ws/2/recording?query=${query}&limit=1&fmt=json`,
      { headers: { 'User-Agent': 'StreamWaveRadio/1.0 (contact@streamwave.app)' } }
    );
    const searchData = await searchRes.json();
    
    if (!searchData.recordings?.length) return null;

    // Get release ID from first recording
    const releases = searchData.recordings[0].releases;
    if (!releases?.length) return null;
    const releaseId = releases[0].id;

    // Get cover art from Cover Art Archive
    const coverUrl = `https://coverartarchive.org/release/${releaseId}/front-250`;
    const coverRes = await fetch(coverUrl, { method: 'HEAD' });
    if (coverRes.ok) return coverUrl;

    return null;
  } catch {
    return null;
  }
};
