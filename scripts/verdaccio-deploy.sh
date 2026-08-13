#!/usr/bin/env bash

# Builds all packages, bumps their versions, and writes them straight into a
# Verdaccio local-storage folder

set -e

# Where the Verdaccio local-storage database is written. Must match the storage
# path used by the downstream verdaccio-ci.sh / verdaccio-config.yaml jobs.
storage_path="${VERDACCIO_STORAGE_PATH:-/tmp/verdaccio-workspace/storage}"

echo "Build and seed Verdaccio storage at $storage_path"

git config --global user.email octobot@github.com
git config --global user.name GitHub Actions

# Generate dists for the packages
make build

# Bump all package versions (allow publish from current branch but don't push tags or commit)
yarn workspaces list --json --no-private | node ./scripts/verdaccio-generate-versions.js
cat .yarn/versions/version.yml
yarn version apply --all
cat ./packages/react-aria-components/package.json

# Seed the packages directly into Verdaccio storage
mkdir -p "$storage_path"
yarn workspaces list --json --no-private | node ./scripts/verdaccio-seed.js "$storage_path"
