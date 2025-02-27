#!/usr/bin/env bash

# Login as test user
yarn config set npmRegistryServer $registry
yarn config set unsafeHttpWhitelist localhost
yarn config set npmAlwaysAuth true
npm set registry $registry

# build prod docs with a public url of /reactspectrum/COMMIT_HASH_BEFORE_PUBLISH/verdaccio/docs
PUBLIC_URL=/reactspectrum/`git rev-parse HEAD~0`/verdaccio/docs make website-production

# Rename the dist folder from dist/production/docs to verdaccio_dist/COMMIT_HASH_BEFORE_PUBLISH/verdaccio/docs
# This is so we can have verdaccio build in a separate stream from deploy and deploy_prod
verdaccio_path=verdaccio_dist/`git rev-parse HEAD~0`/verdaccio
mkdir -p $verdaccio_path
mv dist/production/docs $verdaccio_path