import https from 'https';
import fs from 'fs';




// 为函数的参数添加类型注解
function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
      } else {
        reject(new Error(`Failed to download file, status code: ${response.statusCode}`));
      }

      file.on('finish', () => {
        file.close(() => resolve()); // 确保在文件关闭时解析 Promise
      });

      file.on('error', (err: NodeJS.ErrnoException) => {
        fs.unlink(destPath, () => reject(err)); // 删除文件
      });
    });
  });
}

