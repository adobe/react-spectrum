import chalk from 'chalk';
import fs from 'fs';
import prompts from 'prompts';
var exec =  require('child_process').exec;

const readTemplates = () => fs.readdirSync('./templates');
const readComponents = (template) =>
  fs
    .readdirSync(`./templates/${template}`)
    .filter((file) =>
      fs.lstatSync(`./templates/${template}/${file}`).isDirectory()
    );

const createProjectFolder = (projectName) => {
  if (!fs.existsSync(projectName)) {
    fs.mkdirSync(projectName);
  }
};

const copyPackageJson = (template, destination, includedFeatures) => {
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

const copyComponents = (
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

  const templates = readTemplates();
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

  const components = readComponents(template);
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
