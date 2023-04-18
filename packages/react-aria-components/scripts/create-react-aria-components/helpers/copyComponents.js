import {createDirectory} from './createDirectory.js';
import {downloadFile} from './downloadFile.js';
import got from 'got';

export const copyComponents = async (
  components,
  template,
  destination,
  includedFeatures
) => {
  createDirectory(`${destination}/`);
  createDirectory(`${destination}/components/`);
  let downloadPromises = [];

  await Promise.all(components.map(async (component) => {
    const destDir = `${destination}/components/${component}`;
    createDirectory(destDir);

    let res = await got(`https://api.github.com/repositories/208362715/contents/packages/react-aria-components/scripts/create-react-aria-components/templates/${template}/components/${component}?ref=create-react-aria-components`).catch((e) => e);
    let files = JSON.parse(res.body).filter(file => file.type === 'file');
    files = files.filter(file => {
      if (file.name.endsWith('.test.tsx') && !includedFeatures.includes('Tests')) {
        return false;
      }
      if (file.name.endsWith('.stories.tsx') && !includedFeatures.includes('Stories')) {
        return false;
      }
      if (file.name.endsWith('.mdx') && !includedFeatures.includes('Docs')) {
        return false;
      }
      return true;
    });
    downloadPromises.push(...files.map(file => downloadFile(file.download_url, `${destDir}/${file.name}`)));
  }));
  await Promise.all(downloadPromises);
  console.log('All components downloaded successfully!');
};
