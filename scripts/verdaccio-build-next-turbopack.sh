#!/usr/bin/env bash

# Builds the Turbopack Next.js example (examples/next-app-turbopack) against the
# local Verdaccio registry so it consumes the freshly built
# @react-aria/optimize-locales-plugin + react-aria-components, then prints
# verification of the locale optimization to the CI logs.
#
# The example's next.config.ts keeps the locales [en, de] on the server and []
# in the browser, so:
#   * the generated React Aria i18n chunk in .next/server should contain ONLY
#     en/de strings (a small chunk), and
#   * the client bundle in .next/static should contain no React Aria locale
#     strings at all.
# If the plugin did not run, the server chunk would balloon with ~30 locales.

port=4000
registry="http://localhost:$port"
output="output.out"
touch $output

set -e

echo "Building next-app-turbopack with verdaccio"

# Wait for verdaccio to start (verdaccio-ci.sh starts it before this script runs)
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

echo 'build next-app-turbopack test app'
cd examples/next-app-turbopack
yarn config set npmRegistryServer $registry

# Install and pull the freshly published packages from verdaccio. The example's
# committed deps use semver ranges (^1/^2), so upgrade explicitly to the
# verdaccio "latest" dist-tag to guarantee we exercise the locally built plugin.
yarn install --no-immutable
yarn up "react-aria-components@latest" "@react-aria/optimize-locales-plugin@latest"

echo "Versions under test:"
node -e "console.log('  react-aria-components@' + require('./node_modules/react-aria-components/package.json').version)" || true
node -e "console.log('  @react-aria/optimize-locales-plugin@' + require('./node_modules/@react-aria/optimize-locales-plugin/package.json').version)" || true

# Build with Turbopack (next build, no --webpack). Not piped, so `set -e` fails
# the job if the build (e.g. a broken plugin) fails.
VERDACCIO=true yarn build

echo ""
echo "======================================================================"
echo " Locale optimization verification (@react-aria/optimize-locales-plugin)"
echo "======================================================================"
echo " next.config.ts keeps: server -> [en, de], browser -> []"
echo ""

echo "--- Build output sizes ---"
du -sh .next .next/server .next/static 2>/dev/null || true
echo ""

# The compiled i18n dictionary preserves message keys such as "colorSwatchPicker",
# so we can find whichever server chunk bundled the React Aria locale strings.
marker_key='colorSwatchPicker'

# report_locales <files>: print which locales' strings survive in the given files.
# Kept locales (en/de) use ASCII markers so they match reliably even if the
# minifier \u-escapes non-ASCII characters. Removed-locale markers are raw UTF-8
# (best effort); their real backstop is the chunk size and the dumped contents.
report_locales () {
  local files="$1"
  local rows=(
    "en-US|Select an item|kept"
    "de-DE|Farbfelder|kept"
    "fr-FR|Sélectionner un élément|removed"
    "ja-JP|項目を選択|removed"
    "ko-KR|항목 선택|removed"
    "zh-CN|选择一个项目|removed"
    "es-ES|Seleccionar un artículo|removed"
    "ar-AE|حدد عنصرًا|removed"
  )
  local row label marker expect
  for row in "${rows[@]}"; do
    IFS='|' read -r label marker expect <<< "$row"
    if grep -qF -- "$marker" $files 2>/dev/null; then
      printf '  %-7s PRESENT  (expected: %s)\n' "$label" "$expect"
    else
      printf '  %-7s absent   (expected: %s)\n' "$label" "$expect"
    fi
  done
}

echo "--- Server build: generated React Aria i18n chunk(s) ---"
server_chunks=$(grep -rlF "$marker_key" .next/server 2>/dev/null || true)
if [ -z "$server_chunks" ]; then
  echo "  No React Aria i18n chunk found in .next/server (unexpected for this app)."
else
  echo "  Chunk(s):"
  for f in $server_chunks; do
    echo "    $f ($(du -h "$f" | cut -f1))"
  done
  echo ""
  echo "  Locale strings present in server chunk(s):"
  report_locales "$server_chunks"
  echo ""
  echo "  --- Generated chunk contents (should contain ONLY en/de strings) ---"
  for f in $server_chunks; do
    size_bytes=$(wc -c < "$f")
    echo ""
    echo "  >>> $f ($(du -h "$f" | cut -f1))"
    if [ "$size_bytes" -gt 1048576 ]; then
      echo "  (chunk > 1MB - not dumping in full; a large locale chunk suggests the pack was NOT reduced)"
    else
      cat "$f"
      echo ""
    fi
  done
fi
echo ""

echo "--- Client build: must contain NO React Aria locale strings (browser -> []) ---"
client_chunks=$(grep -rlF "$marker_key" .next/static 2>/dev/null || true)
if [ -z "$client_chunks" ]; then
  echo "  None found - client bundle is stripped of React Aria locale data."
else
  echo "  React Aria locale strings unexpectedly present in client chunk(s):"
  for f in $client_chunks; do
    echo "    $f ($(du -h "$f" | cut -f1))"
  done
  echo "  Locale strings present in client chunk(s):"
  report_locales "$client_chunks"
fi
echo ""
echo "======================================================================"

cd ../..

netstat -tpln | awk -F'[[:space:]/:]+' '$5 == 4000 {print $(NF-2)}' | xargs kill
