import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os';
import Music from 'NeteaseCloudMusicApi';
import { ParseList,Lrc } from './types';

export function initBridge() {
    ipcMain.handle('save-file', (event, content) => {
        const userRoamingPath = path.join(os.homedir(), 'AppData', 'Roaming', 'recipe-saver');  // 指定保存路径
        const filePath = path.join(userRoamingPath, 'saved.txt');  // 设置保存文件名为 saved.txt

        // 确保目标文件夹存在
        if (!fs.existsSync(userRoamingPath)) {
            fs.mkdirSync(userRoamingPath, { recursive: true });
        }

        // 使用 fs 模块将文本内容写入文件
        fs.writeFileSync(filePath, content, 'utf8');
        return `文件已保存到：${filePath}`;
    });

    // 监听文件读取请求
    ipcMain.handle('read-file', (event) => {
        const userRoamingPath = path.join(os.homedir(), 'AppData', 'Roaming', 'recipe-saver');  // 指定保存路径
        const filePath = path.join(userRoamingPath, 'saved.txt');  // 文件路径

        // 检查文件是否存在
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            return fileContent;  // 返回文件内容
        } else {
            throw new Error('文件不存在');
        }


});

ipcMain.handle('fetch-playlist-tracks', async (_, listId, cookie) => {
    return getPlaylistTracks(listId, cookie);
    });

  }
  async function getPlaylistTracks(listId: string, cookie: string):  Promise<{ [key: string]: any }> {
    try {
      // 获取播放列表中的歌曲
      const songs = await Music.playlist_track_all({ id: listId, cookie })
        .then((res) => {
          // console.log(`Response from API:`, res.body);  // 打印响应内容，看看返回的数据
          return res.body.songs as Record<string, any>[];
        })
        .then((songs) =>
          songs.map(({ name, ar, id }) => ({
            id,
            name: `${name} - ${(ar?.[0]?.name || 'Unknown Artist')}`,
          }))
        );
      
      // 获取第一首歌的歌词
      let firstTrackLyrics = '';
      if (songs.length > 0) {
        const firstTrackId = songs[0].id;
        firstTrackLyrics = await getLyrics(firstTrackId); // 获取歌词
      }

      return { name: songs[0], lyric:firstTrackLyrics };
    } catch (error) {
      return { tracks: [], firstTrackLyrics: 'Failed to fetch lyrics.' };
    }
  }

  
  async function getLyrics(songId: string): Promise<string> {
    try {
      // 调用 API 获取歌词
      const res = await Music.lyric({ id: songId });
      // 使用类型保护判断 res.body.lrc 是否符合 Lrc 接口
      if (res.body && res.body.lrc && typeof res.body.lrc === "object") {
        const lrc = res.body.lrc as Lrc;  // 使用类型断言，将 lrc 强制转换为 Lrc 类型
  
        if (lrc.lyric) {
          return lrc.lyric;
        } else {
          throw new Error("Lyric not found");
        }
      } else {
        throw new Error("No lyrics available or empty lrc object");
      }
    } catch (error) {
      // console.error(error);
      return "Error fetching lyrics";
    }
  }