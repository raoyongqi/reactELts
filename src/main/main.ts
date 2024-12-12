import { app, BrowserWindow ,dialog} from 'electron';
import * as path from 'path';
import process from 'process';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer';
import { initBridge } from './bridge';
import { configureLog4js, reportCrash } from './log';
async function main() {
  await app.whenReady();
  initBridge();
  const  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        preload: path.join(__dirname, '..', 'main', 'preload.js'),  // 指定 preload 文件
        contextIsolation: true,  // 启用上下文隔离
        nodeIntegration: false,  // 禁用 Node.js 集成
    },
    frame: false,
});

win.removeMenu();

if (app.requestSingleInstanceLock()) {
    app.on('second-instance', () => {
      if (win.isMinimized()) {
        win.restore();
      }
      win.focus();
    });
  } else {
    // 第二个实例，退出。
    app.quit();
    return;
  }

  win.once('ready-to-show', () => win.show());
  
  if (process.env.NODE_ENV === 'development') {
    await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS]).then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
    win.once('show', () => win.webContents.openDevTools());
    // 开发环境加载开发服务器 URL
    await win.loadURL('http://localhost:5173');
  } else {
    await win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  }

  app.on('window-all-closed', () => app.quit());
}



async function crash(err: Error) {
const crashFilePath = await reportCrash({
name: err.name,
message: err.message,
stack: err.stack,
});
dialog.showErrorBox(
'程序出现了错误',
`${err.message}\n崩溃报告位置：${crashFilePath}`
);
process.exit(-1);
}


main().catch(crash);

process.on('uncaughtException', crash);
