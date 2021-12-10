#!/bin/bash

# Grab current commit hash
git config --global user.email octobot@github.com
git config --global user.name GitHub Actions
commit_hash=`git rev-parse HEAD`
docs_diff_path=docs_diff_dist/`git rev-parse HEAD`/dashboard
mkdir -p $docs_diff_path

# Clone docs differ repo and run differ
cd ../
git clone https://$GITHUB_TOKEN@github.com/ktabors/docs-differ.git
cd docs-differ
yarn add pngquant
yarn install
# yarn run-differ -b https://react-spectrum.adobe.com/ -c https://reactspectrum.blob.core.windows.net/reactspectrum/$commit_hash/verdaccio/docs/index.html
yarn run-differ -b https://react-spectrum.adobe.com/react-stately/useColorFieldState.html -c https://reactspectrum.blob.core.windows.net/reactspectrum/26aec8ae9a2c36f8f91da1d628dd58deee7b180c/verdaccio/docs/react-stately/useColorFieldState.html

# TODO: (install in script for now) compress diff png and remove baseline and current
./node_modules/.bin/pngquant src/docs-differ/diff/*.png --skip-if-larger --ext=.png --force
rm -rf src/docs-differ/baseline src/docs-differ/current

# build the dashboard and move it to the dist
yarn build
du -sh build
mv build ../react-spectrum/$docs_diff_path
