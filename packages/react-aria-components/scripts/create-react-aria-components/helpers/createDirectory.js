import fs from 'fs';

export const createDirectory = (projectName) => {
  if (!fs.existsSync(projectName)) {
    fs.mkdirSync(projectName);
  }
};
