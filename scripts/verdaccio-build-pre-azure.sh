#!/usr/bin/env bash

verdaccio_path=verdaccio_dist/`git rev-parse HEAD~0`/verdaccio

mkdir -p $verdaccio_path/publish-stats

cp -r /tmp/$verdaccio_path/webpack-4/publish-stats/webpack-4-build-stats.txt ./
cp -r /tmp/$verdaccio_path/next/publish-stats/publish.json ./
cp -r /tmp/$verdaccio_path/next/publish-stats/next-build-stats.txt ./
cp -r /tmp/$verdaccio_path/rsp-cra-18/publish-stats/build-stats.txt ./

echo 'compare sizes'
# Compare the size of the built app and the published packages.
node scripts/compareSize.js

echo 'move to folder for azure'
# Store into folder for azure.
mv size-diff.txt build-stats.txt publish.json webpack-4-build-stats.txt next-build-stats.txt $verdaccio_path/publish-stats
