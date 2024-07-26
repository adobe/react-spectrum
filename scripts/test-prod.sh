#!/usr/bin/env bash

port=4873
original_registry=`npm get registry`
registry="http://localhost:$port"
output="output.out"
commit_to_revert="HEAD"
test_app='rsp-cra-18'

# Generate dists for the packages
yarn parcel build packages/@adobe/react-spectrum/ packages/@react-{spectrum,aria,stately}/*/ packages/@internationalized/*/ --no-optimize --log-level error

# Start verdaccio and send it to the background
yarn verdaccio --config "./.verdaccio-ci.config.yml" --listen $port &>${output}&

# Wait for verdaccio to start
grep -q 'http address' <(tail -f $output)

# Login as test user
yarn config set npmPublishRegistry $registry
yarn config set npmRegistryServer $registry
yarn config set npmAlwaysAuth true
yarn config set npmAuthIdent abc
yarn config set npmAuthToken blah

# Bump all package versions (allow publish from current branch but don't push tags or commit)
yarn workspaces foreach --all --no-private version minor --deferred
yarn version apply --all
commit_to_revert="HEAD~0"

# Publish packages to verdaccio
yarn workspaces foreach --all --no-private -pt npm publish

# set the npm registry because that will set it at a higher level, making local testing easier
npm set registry $registry
yarn config set npmRegistryServer $registry

#install packages in test app
cd examples/$test_app
yarn install

#build test app
yarn build
cd ../..

echo "Cleaning up"
lsof -ti tcp:4873 | xargs kill
# Clean up generated dists if run locally
rm -rf packages/**/dist
rm -rf storage/ ~/.config/verdaccio/storage/ $output
git fetch
git reset --hard $commit_to_revert
npm set registry $original_registry

#check the size of the files in the build directory
du -c examples/*/build/
