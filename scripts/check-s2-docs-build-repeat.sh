#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/packages/dev/s2-docs/dist"
REQUIRED_SUCCESSES="${1:-5}"
PUBLIC_URL_DEFAULT="${PUBLIC_URL:-/}"
export PUBLIC_URL="$PUBLIC_URL_DEFAULT"

for ((run=1; run<=REQUIRED_SUCCESSES; run++)); do
  echo "\n=== S2 docs build attempt $run/$REQUIRED_SUCCESSES ==="
  echo "Cleaning build dir: $BUILD_DIR"
  rm -rf "$BUILD_DIR"

  echo "Building s2 docs..."
  (cd "$ROOT_DIR" && yarn build:s2-docs)

  echo "Validating build output..."
  if (cd "$ROOT_DIR" && yarn check:s2-docs-build "$BUILD_DIR"); then
    echo "✅ Success $run/$REQUIRED_SUCCESSES"
  else
    echo "❌ Build validation failed on attempt $run/$REQUIRED_SUCCESSES."
    exit 1
  fi
done

echo "\n🎉 Build validated $REQUIRED_SUCCESSES times in a row."
