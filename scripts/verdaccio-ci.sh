#!/usr/bin/env bash

port=4000
registry="http://localhost:$port"
output="output.out"

set -e

echo "Starting verdaccio server"

# Start verdaccio and send it to the background
yarn verdaccio --config ./scripts/verdaccio-config.yaml --listen $port &>${output} &

# Wait for verdaccio to start
grep -q 'http address' <(tail -f $output)

if curl -sI http://localhost:4000/ >/dev/null; then
    echo "Verdaccio is running on port 4000."
else
    echo "Verdaccio is NOT running on port 4000."
fi

# Login as test user
yarn config set npmPublishRegistry $registry
yarn config set npmRegistryServer $registry
yarn config set npmAlwaysAuth false
yarn config set npmAuthToken abc
yarn config set unsafeHttpWhitelist localhost
npm set registry $registry

text="
//localhost:4000/:_authToken=abc
"
echo "$text" > .npmrc
