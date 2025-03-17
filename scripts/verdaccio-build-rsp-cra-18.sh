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

echo 'build rsp-cra-18'
# install packages in CRA test app
cd examples/rsp-cra-18
yarn config set npmRegistryServer $registry
yarn install --no-immutable

# Build CRA test app and move to dist folder. Store the size of the build in a text file.
yarn build | tee build-stats.txt
du -ka build/ | tee -a build-stats.txt
mkdir -p ../../$verdaccio_path/rsp-cra-18/publish-stats
mv build-stats.txt ../../$verdaccio_path/rsp-cra-18/publish-stats
mv build/* ../../$verdaccio_path/rsp-cra-18

netstat -tpln | awk -F'[[:space:]/:]+' '$5 == 4000 {print $(NF-2)}' | xargs kill
