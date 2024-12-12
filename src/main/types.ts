
// src/types.ts
export type ParseList = {
    id: string; // 歌曲 ID
    name: string; // 歌曲名称，格式为 "歌曲名 - 艺术家"
  };

  export interface Lrc {
    lyric: string;
  }