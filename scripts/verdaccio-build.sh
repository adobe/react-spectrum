#!/usr/bin/env bash

port=4000
registry="http://localhost:$port"
# Login as test user
yarn config set npmRegistryServer $registry
yarn config set unsafeHttpWhitelist localhost
npm set registry $registry

cd starters/docs
yarn config set npmRegistryServer $registry
cd ../tailwind
yarn config set npmRegistryServer $registry
cd ../..

# build prod docs with a public url of /reactspectrum/COMMIT_HASH_BEFORE_PUBLISH/verdaccio/docs
PUBLIC_URL=/reactspectrum/`git rev-parse HEAD~0`/verdaccio/docs make website-production

# Rename the dist folder from dist/production/docs to verdaccio_dist/COMMIT_HASH_BEFORE_PUBLISH/verdaccio/docs
# This is so we can have verdaccio build in a separate stream from deploy and deploy_prod
verdaccio_path=verdaccio_dist/`git rev-parse HEAD~0`/verdaccio
mkdir -p $verdaccio_path
mv dist/production/docs $verdaccio_path

netstat -tpln | awk -F'[[:space:]/:]+' '$5 == 4000 {print $(NF-2)}' | xargs kill
