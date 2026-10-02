#!/usr/bin/env bash

port=4000
registry="http://localhost:$port"
output="output.out"
touch $output

set -e

echo "Building starters with verdaccio"

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

cd starters/docs
yarn config set npmRegistryServer $registry
yarn install --no-immutable
yarn up react-aria-components
cd ../tailwind
yarn config set npmRegistryServer $registry
yarn install --no-immutable
yarn up react-aria-components tailwindcss-react-aria-components
cd ../..
make build-starters

netstat -tpln | awk -F'[[:space:]/:]+' '$5 == 4000 {print $(NF-2)}' | xargs kill
