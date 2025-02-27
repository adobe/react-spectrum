#!/usr/bin/env bash

port=4000
output="output.out"

function cleanup {
  echo "Cleaning up"
  # lsof doesn't work in circleci
  netstat -tpln | awk -F'[[:space:]/:]+' '$5 == 4000 {print $(NF-2)}' | xargs kill
}

trap cleanup EXIT
trap "exit 1" INT ERR

set -e

# Start verdaccio and send it to the background
yarn verdaccio --listen $port &>${output}&

# Wait for verdaccio to start
grep -q 'http address' <(tail -f $output)
