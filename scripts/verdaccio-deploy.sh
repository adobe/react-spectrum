#!/usr/bin/env bash

port=4000
# usually defaults to https://registry.npmjs.com/
original_registry=`npm get registry`
registry="http://localhost:$port"
output="output.out"
ci=false

# Wait for verdaccio to start
grep -q 'http address' <(tail -f $output)

# Login as test user
yarn npm-cli-login -u abc -p abc -e 'abc@abc.com' -r $registry
yarn config set npmPublishRegistry $registry
yarn config set npmRegistryServer $registry
yarn config set unsafeHttpWhitelist localhost
yarn config set npmAlwaysAuth true
npm set registry $registry
# Pause is important so that the username isn't interpreted as both username and password
(echo "abc"; sleep 2; echo "abc") | yarn npm login

git config --global user.email octobot@github.com
git config --global user.name GitHub Actions

# Generate dists for the packages
make build

# Bump all package versions (allow publish from current branch but don't push tags or commit)
yarn workspaces foreach --all --no-private version patch --deferred
yarn version apply --all

# Publish packages to verdaccio
yarn workspaces foreach --all --no-private -pt npm publish

netstat -tpln | awk -F'[[:space:]/:]+' '$5 == 4000 {print $(NF-2)}' | xargs kill
