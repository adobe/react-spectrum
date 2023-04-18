import chalk from 'chalk';
import {copyComponents} from './helpers/copyComponents.js';
import {copyPackageJson} from './helpers/copyPackageJson.js';
import {createProjectFolder} from './helpers/createProjectFolder.js';
import {exec} from 'child_process';
import fs from 'fs';
import prompts from 'prompts';
import {readComponents} from './helpers/readComponents.js';
import {readTemplates} from './helpers/readTemplates.js';

async function main() {
  const {action} = await prompts({
    type: 'select',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      {
        title: 'Create a new component library',
        value: 'Create a new library'
      },
      {
        title: 'Add component(s) to an existing project',
        value: 'Add components'
      }
    ]
  });

  const templates = await readTemplates();
  const {template} = await prompts({
    type: 'select',
    name: 'template',
    message: 'Select a template',
    choices: templates.map((t) => ({title: t, value: t}))
  });

  let projectName;
  if (action === 'Create a new library') {
    const response = await prompts({
      type: 'text',
      name: 'projectName',
      message: 'What is your project named?',
      initial: 'my-component-library'
    });
    projectName = response.projectName;
    createProjectFolder(projectName);
  } else {
    projectName = '.';
  }

  const components = await readComponents(template);
  const {selectedComponents} = await prompts({
    type: 'multiselect',
    name: 'selectedComponents',
    message: 'Select the components you want to include',
    choices: [
      {title: 'All (Default)', value: 'All', selected: true},
      ...components.map((c) => ({title: c, value: c}))
    ]
  });

  let features = [
    {title: 'Tests (with Jest + React Testing Library)', value: 'Tests'},
    {title: 'Stories (with Storybook)', value: 'Stories'},
    {title: 'Docs (with Storybook addon)', value: 'Docs'}
  ];
  const {includedFeatures} = await prompts({
    type: 'multiselect',
    name: 'includedFeatures',
    message: 'Select the features you want to include',
    choices: [
      {title: 'All (Default)', value: 'All', selected: true},
      ...features
    ]
  });

  copyComponents(selectedComponents, template, projectName, includedFeatures);

  if (action === 'Create a new library') {
    copyPackageJson(template, projectName, includedFeatures);
    let packageJson = JSON.parse(fs.get(`${projectName}/package.json`));
    let dependencies = packageJson.dependencies;
    let devDependencies = packageJson.devDependencies;
    console.log(
      `Creating a new component library in ${__dirname}/${projectName}.`
    );
    console.log('Using npm.');
    console.log(`Initializing project with template: ${template}`);
    console.log('Installing dependencies:');

    for (let dependency in [...dependencies, ...devDependencies]) {
      console.log(`- ${dependency}`);
    }

    const {stdout, stderr} = await exec(`cd ${projectName} && npm install`);
    console.log(stdout);
    console.log(stderr);
    console.log(
      chalk.green(
        `Success! Created ${projectName} at ${__dirname}/${projectName}`
      )
    );
  } else {
    console.log(chalk.green('Components successfully added!'));
  }

  console.log(
    chalk.green(
      'You can access the docs here: https://react-spectrum.adobe.com/react-aria/react-aria-components.html'
    )
  );
}

main();
