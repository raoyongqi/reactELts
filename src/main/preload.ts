import { contextBridge, ipcRenderer } from 'electron';

// Define the types for the parameters in fetchPlaylistTracks
contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (content: string) => ipcRenderer.invoke('save-file', content),
  readFile: () => ipcRenderer.invoke('read-file'),
  fetchPlaylistTracks: (listId: string, cookie: string) =>
    ipcRenderer.invoke('fetch-playlist-tracks', listId, cookie),
  saveTrackInfo: (trackID: string, trackName: string,trackLyrics: string) => {
    return ipcRenderer.invoke('saveTrackInfo',trackID, trackName, trackLyrics);
  },
  
  downloadTrackFromUrl: async (trackName: string, url: string) => {
    // 调用主进程的 downloadTrackFromUrl 方法
    return await ipcRenderer.invoke('downloadTrackFromUrl',trackName, url);
  }
});
