#!/bin/bash

port=4000
registry="http://localhost:$port"
output="output.out"

function cleanup {
  lsof -ti tcp:4000 | xargs kill
  rm -rf storage/ ~/.config/verdaccio/storage/ $output
  git tag -d $(git tag -l)
  git fetch
  git reset --hard HEAD^
}

# Start verdaccio and send it to the background
yarn verdaccio --listen $port &>${output}&

# Wait for verdaccio to start
grep -q 'http address' <(tail -f $output)

# Login as test user
yarn npm-cli-login -u abc -p abc -e 'abc@abc.com' -r $registry

# Bump all package versions (allow publish from current branch but don't push tags or commit)
yarn lerna version minor --force-publish --allow-branch `git branch --show-current` --no-push --yes

# Publish packages to verdaccio
yarn lerna publish from-package --registry $registry --yes

# Wait for user input to do cleanup
read -n 1 -p "Press a key to close server and cleanup"

cleanup
