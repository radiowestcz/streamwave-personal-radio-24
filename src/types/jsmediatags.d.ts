declare module 'jsmediatags' {
  interface PictureData {
    data: number[];
    format: string;
    type: string;
  }

  interface Tags {
    title?: string;
    artist?: string;
    album?: string;
    year?: string;
    genre?: string;
    picture?: PictureData;
  }

  interface TagResult {
    type: string;
    tags: Tags;
  }

  interface Callbacks {
    onSuccess: (result: TagResult) => void;
    onError: (error: { type: string; info: string }) => void;
  }

  function read(file: File | string | Blob, callbacks: Callbacks): void;

  export default { read };
}
