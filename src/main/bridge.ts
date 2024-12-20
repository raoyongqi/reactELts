import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os';
import Music from 'NeteaseCloudMusicApi';
import { ParseList,Lrc } from './types';
import {downloadFile} from './download';
import { clear, log } from 'node:console'

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

// 在主进程中处理 Electron 渲染进程的 IPC 调用

});


ipcMain.handle('downloadTrackFromUrl', async (event, trackName: string, url: string) => {
  
    const safeTrackName = trackName.replace(/[\\\/:*?"<>|]/g, ''); // 去掉不合法的字符
    const saveDir = path.join(os.homedir(), 'Music', 'lyrics', safeTrackName); // Path to save the lyrics folder
  try {
    await downloadFile(url,saveDir, trackName); // 调用下载函数
    return trackName; // 返回下载路径
  } catch (error) {
    // 将 error 转换为 Error 类型
    const err = error instanceof Error ? error : new Error(String(error));
    throw new Error(`Failed to download track: ${err.message}`);
  }
});




ipcMain.handle('saveTrackInfo', async (event,trackID, trackName, trackLyrics) => {
  const safeTrackName = trackName.replace(/[\\\/:*?"<>|]/g, ''); // 去掉不合法的字符
  const saveDir = path.join(os.homedir(), 'Music', 'lyrics', safeTrackName); // Path to save the lyrics folder
  const savePath = path.join(saveDir, `${trackName}.txt`); // Full path to the file
  const saveIDPath = path.join(saveDir, `id.txt`); // Full path to the file

  const content = `Track Name: ${trackName}\n\nLyrics:\n${trackLyrics}`;

  // Ensure the directory exists; if not, create it
  try {
    // Create the directory if it doesn't exist (recursive option ensures all parent dirs are created)
    fs.mkdirSync(saveDir, { recursive: true });

    // Write the content to the file
    fs.writeFileSync(savePath, content, 'utf-8');
    fs.writeFileSync(saveIDPath, trackID.toString(), 'utf-8');

    return savePath; // Return the saved file path
  } catch (error) {
    console.error('Error saving file:', error);
    throw error; // If saving fails, throw an error
  }
});

  ipcMain.handle('fetch-playlist-tracks', async (_, listId, cookie) => {
      return getPlaylistTracks(listId, cookie);

    });

    };


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
      let firstDownloadUrl =null;
      let firstSong = null; // 记录找到的最后一首有效歌曲
      
      let count = 0; // 初始化计数器
      const startFrom = 105; // 从第 105 首歌曲开始查找，索引从 0 开始
      
      for (let i = startFrom; i < songs.length; i++) {
        const song = songs[i];
        count++; // 每遍历一首歌计数器加1
        log(`正在处理第 ${count + startFrom} 首歌曲: ${song.name || '未知'}`); // 计算真实歌曲编号
        
        const trackId = song.id;
        const downloadUrl = await getDownloadUrl(trackId, cookie);
        
        if (downloadUrl) { // 检查 downloadUrl 是否有效
          firstDownloadUrl = downloadUrl;
          firstTrackLyrics = await getLyrics(trackId); // 获取歌词
          firstSong = song;  // 记录当前歌曲名称
          log(`找到有效的歌曲链接，第 ${count + startFrom} 首: ${song.name || '未知'}`);
          break; // 找到后立即退出循环
        }
      }
      
      
      if (!firstDownloadUrl) {
        console.log('No valid download URL found in the provided songs.');
      }
      
      return { song: firstSong, lyric: firstTrackLyrics, url: firstDownloadUrl };
      
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

// Function to get the download URL of a song
async function getDownloadUrl(songId: string, cookie: string): Promise<string | null> {
  try {
    // Fetch the download URL using the songId and cookie
    const res = await Music.song_download_url({ id: songId, cookie });

    // Extract the download URL from the response
    const downloadUrl = (res.body.data as any).url;
    if (downloadUrl) {
      return downloadUrl; // Return the download URL if available
    } else {
      return null; // Return null if downloadUrl is not available
    }
  } catch (error) {
    console.error('Error fetching download URL:', error);
    throw error;
  }
}