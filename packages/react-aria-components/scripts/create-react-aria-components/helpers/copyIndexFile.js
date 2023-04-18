import fs from 'fs';
import got from 'got';

export const copyIndexFile = async (template, destination, components, includesAll = false) => {
  // Copy index file from github, then filter out components that aren't selected
  // TODO: Before merging, update to https://api.github.com/repos/adobe/react-spectrum/contents/packages/react-aria-components/scripts/create-react-aria-components/templates
  let res = await got(`https://raw.githubusercontent.com/adobe/react-spectrum/create-react-aria-components/packages/react-aria-components/scripts/create-react-aria-components/templates/${template}/index.ts`).catch((e) => e);
  let indexFile = res.body;
  if (!includesAll) {
    // Remove any exports that aren't a selected component
    indexFile = indexFile.split('\n').filter(line => {
      if (line.startsWith('export {')) {
        let componentName = line.split(' ')[1];
        return components.includes(componentName);
      }
      return true;
    }).join('\n');
  }
  fs.writeFileSync(`${destination}/index.ts`, indexFile);
};
