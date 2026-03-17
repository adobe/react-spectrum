#!/usr/bin/env bash

port=4000
registry="http://localhost:$port"
output="output.out"

set -e

echo "Building icons with verdaccio"

# Wait for verdaccio to start
grep -q 'http address' <(tail -f $output)

if curl -sI http://localhost:4000/ >/dev/null; then
    echo "Verdaccio is running on port 4000."
else
    echo "Verdaccio is NOT running on port 4000."
fi

# Rename the dist folder from dist/production/docs to verdaccio_dist/COMMIT_HASH_BEFORE_PUBLISH/verdaccio/docs
# This is so we can have verdaccio build in a separate stream from deploy and deploy_prod
verdaccio_path=verdaccio_dist/`git rev-parse HEAD~0`/verdaccio
mkdir -p $verdaccio_path

yarn config set npmPublishRegistry --home $registry
yarn config set npmRegistryServer --home $registry
yarn config set npmAlwaysAuth --home false
yarn config set npmAuthToken --home abc
yarn config set unsafeHttpWhitelist --home localhost
npm set registry $registry

# Rename the dist folder from dist/production/docs to verdaccio_dist/COMMIT_HASH_BEFORE_PUBLISH/verdaccio/docs
# This is so we can have verdaccio build in a separate stream from deploy and deploy_prod
verdaccio_path=verdaccio_dist/`git rev-parse HEAD~0`/verdaccio
mkdir -p $verdaccio_path

echo 'test icon builder'
cd examples/s2-webpack-5-example
mkdir icon-test

npm cache clean --force
cp ../../packages/@react-spectrum/s2/s2wf-icons/S2_Icon_3D_20_N.svg icon-test/S2_Icon_3D_20_N.svg
npm_config_registry=$registry npx @react-spectrum/s2-icon-builder@latest -i ./icon-test/S2_Icon_3D_20_N.svg -o ./icon-dist
cp ../../packages/@react-spectrum/s2/spectrum-illustrations/linear/S2_lin_3D_48.svg icon-test/S2_lin_3D_48.svg
npm_config_registry=$registry npx @react-spectrum/s2-icon-builder@latest --type illustration -i ./icon-test/S2_lin_3D_48.svg -o ./icon-dist
echo 'concluded icon builder'

echo 'testing icon builder library'
mkdir icon-library-test
touch icon-library-test/package.json
cat > icon-library-test/package.json << EOF
{
  "name": "@react-spectrum/icon-library-test",
  "version": "1.0.0",
  "license": "Apache-2.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/adobe/react-spectrum"
  },
  "exports": {
    "./*": {
      "types": "./*.d.ts",
      "module": "./*.mjs",
      "import": "./*.mjs",
      "require": "./*.cjs"
    }
  },
  "peerDependencies": {
    "@react-spectrum/s2": ">=0.8.0",
    "react": "^19.0.0-rc.1",
    "react-dom": "^19.0.0-rc.1"
  },
  "devDependencies": {
    "@react-spectrum/s2-icon-builder": "latest",
    "@react-spectrum/s2": "latest",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
EOF

mkdir icon-library-test/src
mkdir icon-library-test/src/illustrations
touch icon-library-test/yarn.lock
cp ../../packages/@react-spectrum/s2/s2wf-icons/S2_Icon_3D_20_N.svg icon-library-test/src/S2_Icon_3D_20_N.svg
cp ../../packages/@react-spectrum/s2/s2wf-icons/S2_Icon_AlignRight_20_N.svg icon-library-test/src/S2_Icon_AlignRight_20_N.svg
cp ../../packages/@react-spectrum/s2/spectrum-illustrations/linear/S2_lin_3D_48.svg icon-library-test/src/illustrations/S2_lin_3D_48.svg
cd icon-library-test
echo "Installing and building icon library"
yarn install --no-immutable
# no lockfile, no need to forcibly update anything
yarn transform-icons -i './src/*.svg' -o ./ --isLibrary
yarn transform-icons --type illustration -i './src/illustrations/*.svg' -o ./ --isLibrary

ls .

yarn config set npmPublishRegistry $registry
yarn config set npmRegistryServer $registry
yarn config set npmAlwaysAuth false
yarn config set npmAuthToken abc
yarn config set unsafeHttpWhitelist localhost
npm set registry $registry

git config --global user.email octobot@github.com
git config --global user.name GitHub Actions

# Publish icon package to verdaccio
echo "Publishing icon package to verdaccio"
yarn npm publish --tag latest

echo "Building icon builder fixture"
cd ../../../scripts/icon-builder-fixture
yarn install --no-immutable
yarn up @react-spectrum/s2
yarn tsc
yarn build --public-url ./

echo "Moving icon builder fixture to verdaccio"
mv dist ../../$verdaccio_path/icon-builder-fixture


netstat -tpln | awk -F'[[:space:]/:]+' '$5 == 4000 {print $(NF-2)}' | xargs kill
