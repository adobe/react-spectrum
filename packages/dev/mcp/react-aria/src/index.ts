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
          'Usage: npx @react-aria/mcp@latest [--cwd <workspace-dir>]',
          '',
          'Starts the version-aware MCP server for React Aria documentation.'
        ].join('\n')
      );
      process.exit(0);
    }
    await startServer('react-aria', readPackageVersion(import.meta.url), {defaultCwd: cwd});
  } catch (err) {
    console.error(errorToString(err));
    process.exit(1);
  }
})();
