
declare global {
  interface Window {
    electronAPI: {
      saveFile: (content: string) => Promise<string>;
      readFile: () => Promise<string>;
      fetchPlaylistTracks: (listId: string, cookie: string) => Promise<{ [key: string]: any }>;
      saveTrackInfo: (trackName: string,trackID : string,trackLyrics: string) => Promise<string>;
      downloadTrackFromUrl: (url: string, downloadPath: string) => Promise<string>;
    };
  }
}

// 这个文件必须有一个 export 语句来让 TypeScript 识别为模块
export {};
