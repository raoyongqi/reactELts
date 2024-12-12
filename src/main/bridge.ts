import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
});}
