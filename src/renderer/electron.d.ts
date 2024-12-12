// src/electron.d.ts
declare global {
    interface Window {
      electronAPI: {
        saveFile: (content: string) => Promise<string>;
        readFile: () => Promise<string>;
      };
    }
  }
  
  // 这个文件必须有一个 export 语句来让 TypeScript 识别为模块
  export {};
  