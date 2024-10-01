const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

export const testApps = [
  {
    name: 'rsp-cra-18',
    buildCmd: 'yarn build',
    dist: 'build'
  },
  {
    name: 'rsp-webpack-4',
    buildCmd: 'yarn build',
    dist: 'dist'
  },
  {
    name: 'rsp-next-ts',
    buildCmd: 'yarn build && yarn export',
    dist: 'out'
  },
  {
    name: 'rac-tailwind',
    buildCmd: 'yarn build --public-url ./',
    dist: 'dist'
  },
  {
    name: 'rac-spectrum-tailwind',
    buildCmd: 'yarn build --public-url ./',
    dist: 'dist'
  },
  {
    name: 's2-parcel-example',
    buildCmd: 'yarn build --public-url ./',
    dist: 'dist'
  },
  {
    name: 's2-webpack-5-example',
    buildCmd: 'yarn build',
    dist: 'dist'
  }
];

const tmpDir = path.join(__dirname, 'tmp');

function cleanTmpDir() {
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, {recursive: true, force: true});
    console.log(`Removed existing temporary directory: ${tmpDir}`);
  }
  fs.mkdirSync(tmpDir, {recursive: true});
  console.log(`Created temporary directory: ${tmpDir}`);
}

function buildTestApps() {
  testApps.forEach((app) => {
    const appPath = path.join(__dirname, 'examples', app.name);
    console.log(`\nBuilding ${app.name}...`);

    process.chdir(appPath);

    try {
      execSync(app.buildCmd, {stdio: 'inherit'});
      console.log(`Successfully built ${app.name}`);
    } catch (error) {
      console.error(`Error building ${app.name}:`, error);
      process.exit(1);
    }

    const buildOutputPath = path.join(appPath, app.dist);

    if (!fs.existsSync(buildOutputPath)) {
      console.error(
        `Build output not found for ${app.name} at ${buildOutputPath}`
      );
      process.exit(1);
    }

    const destPath = path.join(tmpDir, app.name);

    fs.cpSync(buildOutputPath, destPath, {recursive: true});
    console.log(`Copied build output to ${destPath}`);

    process.chdir(__dirname);
  });
}

function main() {
  console.log('Starting build process for test apps...');
  cleanTmpDir();
  buildTestApps();
  console.log('\nAll test apps have been built and copied to the tmp directory.');
}

main();
