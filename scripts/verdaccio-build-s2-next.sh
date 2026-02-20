#!/usr/bin/env bash

port=4000
registry="http://localhost:$port"
output="output.out"
touch $output

set -e

echo "Building s2-next with verdaccio"

# Wait for verdaccio to start
grep -q 'http address' <(tail -f $output)

if curl -sI http://localhost:4000/ >/dev/null; then
    echo "Verdaccio is running on port 4000."
else
    echo "Verdaccio is NOT running on port 4000."
fi

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

echo 'build Spectrum 2 + Next.js test app'
cd examples/s2-next-macros
yarn config set npmRegistryServer $registry
yarn install --no-immutable
yarn up @react-spectrum/s2
VERDACCIO=true yarn build
mv out ../../$verdaccio_path/s2-next-macros

netstat -tpln | awk -F'[[:space:]/:]+' '$5 == 4000 {print $(NF-2)}' | xargs kill
