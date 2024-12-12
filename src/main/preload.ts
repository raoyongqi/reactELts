import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    saveFile: (content: string) => ipcRenderer.invoke('save-file', content),
    readFile: () => ipcRenderer.invoke('read-file'),
});
