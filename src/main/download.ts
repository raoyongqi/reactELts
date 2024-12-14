import axios from 'axios';
import fs from 'fs';
import path from 'path';

export async function downloadFile(url: string, downloadDir: string, name: string) {
  const res = await axios({
    method: 'GET',
    url,
    responseType: 'stream', // 将响应设置为流
  });

  // 将下载内容写入本地文件
  const writer = res.data.pipe(fs.createWriteStream(path.join(downloadDir, `${name}.mp3`)));

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve); // 文件保存完成
    writer.on('error', reject);   // 发生错误
  });
}

