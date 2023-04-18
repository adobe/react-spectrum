import fs from 'fs';
import got from 'got';

export const copyPackageJson = async (template, destination, includedFeatures) => {
  // TODO: Before merging, update to https://api.github.com/repos/adobe/react-spectrum/contents/packages/react-aria-components/scripts/create-react-aria-components/templates
  let res = await got(`https://raw.githubusercontent.com/adobe/react-spectrum/create-react-aria-components/packages/react-aria-components/scripts/create-react-aria-components/templates/${template}/package.json`).catch((e) => e);
  let packageJson = JSON.parse(res.body);
  packageJson.name = destination;
  if (!includedFeatures.includes('Tests')) {
    delete packageJson.dependencies['jest'];
    delete packageJson.dependencies['react-testing-library'];
  }
  if (!includedFeatures.includes('Stories') && !includedFeatures.includes('Docs')) {
    delete packageJson.dependencies['@storybook/react'];
  }

  fs.writeFileSync(`${destination}/package.json`, JSON.stringify(packageJson, null, 2));
};
