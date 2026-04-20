#!/usr/bin/env bash
# Build agent skills for the current working tree and copy the resulting
# .well-known/skills directories into $1 for later diffing.
#
# Runs the two node scripts directly (rather than via yarn) so the command
# works from a `git worktree` / `git archive` checkout that doesn't have
# its own installed node_modules — node will resolve deps by walking up to
# the nearest parent node_modules, letting us reuse a sibling checkout's
# installed deps via a symlink.
set -euo pipefail

if [ -z "${1-}" ]; then
  echo "usage: $0 <destination-dir>" >&2
  exit 1
fi

DEST="$1"

rm -rf packages/dev/s2-docs/dist
node packages/dev/s2-docs/scripts/generateMarkdownDocs.mjs
node packages/dev/s2-docs/scripts/generateAgentSkills.mjs

rm -rf "$DEST"
mkdir -p "$DEST"
for lib in s2 react-aria; do
  src="packages/dev/s2-docs/dist/$lib/.well-known/skills"
  if [ -d "$src" ]; then
    mkdir -p "$DEST/$lib"
    cp -R "$src" "$DEST/$lib/"
  fi
done
