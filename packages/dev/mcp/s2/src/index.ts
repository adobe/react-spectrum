#!/usr/bin/env node
/// <reference types="node" />
import {errorToString, parseServerCliArgs, readPackageVersion} from '../../shared/src/utils.js';
import {startServer} from '../../shared/src/server.js';

(async () => {
  try {
    const {help, cwd} = parseServerCliArgs(process.argv.slice(2));
    if (help) {
      console.log(
        [
          'Usage: npx @react-spectrum/mcp@latest [--cwd <workspace-dir>]',
          '',
          'Starts the version-aware MCP server for React Spectrum (S2) and React Aria documentation.'
        ].join('\n')
      );
      process.exit(0);
    }

    await startServer('s2', readPackageVersion(import.meta.url), {defaultCwd: cwd});
  } catch (err) {
    console.error(errorToString(err));
    process.exit(1);
  }
})();
