import fs from 'fs';

export const createProjectFolder = (projectName) => {
  if (!fs.existsSync(projectName)) {
    fs.mkdirSync(projectName);
  }
    // TODO handle error
};
