import { contextBridge, ipcRenderer } from 'electron';

// Define the types for the parameters in fetchPlaylistTracks
contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (content: string) => ipcRenderer.invoke('save-file', content),
  readFile: () => ipcRenderer.invoke('read-file'),
  fetchPlaylistTracks: (listId: string, cookie: string) =>
    ipcRenderer.invoke('fetch-playlist-tracks', listId, cookie),
});
