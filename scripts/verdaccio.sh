#!/bin/bash

port=4000
original_registry=`npm get registry`
registry="http://localhost:$port"
output="output.out"
ci=false

if [ "$1" = "ci" ];
then
  ci=true
fi

function cleanup {
  lsof -ti tcp:4000 | xargs kill

  if [ "$ci" = false ];
  then
    # Clean up generated dists if run locally
    rm -rf **/dist
    rm -rf storage/ ~/.config/verdaccio/storage/ $output
    git tag -d $(git tag -l)
    git fetch
    git reset --hard HEAD~1
    npm set registry $original_registry
  fi
}

# Generate dists for the packages
make build

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

npm set registry $registry

if [ "$ci" = true ];
then
  # build prod docs
  make website-production
  # Rename the dist folder from dist/production/docs to dist/verdaccio/docs
  # If building the sample app, move the contents of the build folder to dist/verdaccio/build or something
  mv dist/production/ dist/`git rev-parse HEAD`/verdaccio/
else
  # Wait for user input to do cleanup
  read -n 1 -p "Press a key to close server and cleanup"
fi

cleanup
