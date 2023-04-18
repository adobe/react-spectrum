import fs from 'fs';
import {readComponents} from './readComponents.js';

export const copyComponents = (
  components,
  template,
  destination,
  includedFeatures
) => {
  if (components.includes('All')) {
    components = readComponents(template);
  }
  components.forEach((component) => {
    const sourceDir = `./templates/${template}/${component}`;
    const destDir = `${destination}/${component}`;

    // TODO, fetch from github API

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir);
    }

    fs.copyFileSync(
      `${sourceDir}/${component}.tsx`,
      `${destDir}/${component}.tsx`
    );

    if (includedFeatures.includes('Tests')) {
      fs.copyFileSync(
        `${sourceDir}/${component}.test.tsx`,
        `${destDir}/${component}.test.tsx`
      );
    }

    if (includedFeatures.includes('Stories')) {
      fs.copyFileSync(
        `${sourceDir}/${component}.stories.tsx`,
        `${destDir}/${component}.stories.tsx`
      );
    }
  });
};
