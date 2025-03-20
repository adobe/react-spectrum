#!/usr/bin/env bash

port=4000
# usually defaults to https://registry.npmjs.com/
original_registry=`npm get registry`
registry="http://localhost:$port"
output="output.out"
ci=false

echo "Build and deploy to verdaccio"

# Wait for verdaccio to start
grep -q 'http address' <(tail -f $output)

if curl -sI http://localhost:4000/ >/dev/null; then
    echo "Verdaccio is running on port 4000."
else
    echo "Verdaccio is NOT running on port 4000."
fi

yarn config set npmPublishRegistry $registry
yarn config set npmRegistryServer $registry
yarn config set npmAlwaysAuth false
yarn config set npmAuthToken abc
yarn config set unsafeHttpWhitelist localhost
npm set registry $registry

git config --global user.email octobot@github.com
git config --global user.name GitHub Actions

# Generate dists for the packages
make build

# Bump all package versions (allow publish from current branch but don't push tags or commit)
yarn workspaces list --json --no-private | node ./scripts/verdaccio-generate-versions.js
cat .yarn/versions/version.yml
yarn version apply --all
cat ./packages/react-aria-components/package.json

# Publish packages to verdaccio
yarn workspaces foreach --all --no-private -pt npm publish --tag latest

curl -s http://localhost:4000/@adobe/react-spectrum

netstat -tpln | awk -F'[[:space:]/:]+' '$5 == 4000 {print $(NF-2)}' | xargs kill
