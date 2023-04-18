import fs from 'fs';

export const copyPackageJson = (template, destination, includedFeatures) => {
  // TODO, fetch from github API
  const packageJson = JSON.parse(fs.read(`templates/${template}/package.json`));
  packageJson.name = destination;
  if (!includedFeatures.includes('Tests')) {
    delete packageJson.dependencies['jest'];
    delete packageJson.dependencies['react-testing-library'];
  }
  if (!includedFeatures.includes('Stories')) {
    delete packageJson.dependencies['@storybook/react'];
  }
  if (!includedFeatures.includes('Docs')) {
    delete packageJson.dependencies['@storybook/addon-docs'];
  }

  fs.write(`${destination}/package.json`, JSON.stringify(packageJson, null, 2));
};
