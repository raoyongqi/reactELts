import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import process from 'process';

function createWindow(): void {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // 在 Vite 开发模式下加载 Vite 提供的开发服务器地址
  win.loadURL('http://localhost:5173/');
}

// 应用启动时创建窗口
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // macOS 中点击 Dock 图标时，如果没有窗口打开，则重新创建窗口
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时退出应用（除 macOS 外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
