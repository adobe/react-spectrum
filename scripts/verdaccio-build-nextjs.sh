#!/usr/bin/env bash

port=4000
registry="http://localhost:$port"
output="output.out"

set -e

echo "Building docs with verdaccio"

# Wait for verdaccio to start
grep -q 'http address' <(tail -f $output)

if curl -sI http://localhost:4000/ >/dev/null; then
    echo "Verdaccio is running on port 4000."
else
    echo "Verdaccio is NOT running on port 4000."
fi

curl -s http://localhost:4000/@adobe/react-spectrum

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

echo 'build nextjs test app'
# install packages in NextJS test app
cd examples/rsp-next-ts
yarn config set npmRegistryServer $registry
yarn install --no-immutable
yarn test

# Build NextJS test app and move to dist folder. Store the size of the build in a text file.
VERDACCIO=true yarn build | tee next-build-stats.txt
yarn export
du -ka out/ | tee -a next-build-stats.txt
mkdir -p ../../$verdaccio_path/next/publish-stats
mv next-build-stats.txt ../../$verdaccio_path/next/publish-stats
mv out/* ../../$verdaccio_path/next

echo 'get size of each package published to verdaccio'

cd ../..
# Get the tarball size of each published package.
# note, I'm doing this here because this is one of the shortest jobs
# and I don't want to have to create a new job just to get the size of the packages
# I also can't do it in the verdaccio-deploy job because it uses a different workspace
# in order to be a little more efficient with downloads
node scripts/verdaccioPkgSize.js

mv publish.json $verdaccio_path/next/publish-stats

netstat -tpln | awk -F'[[:space:]/:]+' '$5 == 4000 {print $(NF-2)}' | xargs kill
