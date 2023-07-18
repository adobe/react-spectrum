#!/bin/sh

port=4873
original_registry=`npm get registry`
registry="http://localhost:$port"
output="output.out"
commit_to_revert="HEAD"
test_app='rsp-cra-18'

# Generate dists for the packages
yarn parcel build packages/@adobe/react-spectrum/ packages/@react-{spectrum,aria,stately}/*/ packages/@internationalized/*/ --no-optimize --log-level error

# Start verdaccio and send it to the background
yarn verdaccio --listen $port &>${output}&

# Login as test user
yarn npm-cli-login -u abc -p abc -e 'abc@abc.com' -r $registry

# Bump all package versions (allow publish from current branch but don't push tags or commit)
yarn lerna version minor --force-publish --allow-branch `git branch --show-current` --no-push --yes
commit_to_revert="HEAD~1"

# Publish packages to verdaccio
yarn lerna publish from-package --registry $registry --yes

npm set registry $registry

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
git tag -d $(git tag -l)
git fetch
git reset --hard $commit_to_revert
npm set registry $original_registry

#check the size of the files in the build directory
du -c examples/*/build/
