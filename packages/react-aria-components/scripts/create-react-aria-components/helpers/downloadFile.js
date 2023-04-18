import fs from 'fs';
import got from 'got';

export const downloadFile = (url, destination) => {
  return new Promise((resolve, reject) => {
    const stream = got.stream(url);
    const file = fs.createWriteStream(destination);
    stream.pipe(file);
    file.on('finish', () => {
      file.close();
      resolve();
    });
    stream.on('error', error => {
      reject(`Failed to download ${url} - ${error}`);
    });
  });
};
