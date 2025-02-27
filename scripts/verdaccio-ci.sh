#!/usr/bin/env bash

port=4000
output="output.out"

set -e

printenv
ls -al
# Start verdaccio and send it to the background
yarn verdaccio --config ./scripts/verdaccio-config.yaml --listen $port &>${output} &

# Wait for verdaccio to start
grep -q 'http address' <(tail -f $output)
