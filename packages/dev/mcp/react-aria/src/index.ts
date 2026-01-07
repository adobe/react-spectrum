#!/usr/bin/env node
/// <reference types="node" />
import {errorToString} from '../../shared/src/utils.js';
import {startServer} from '../../shared/src/server.js';

// CLI entry for React Aria
(async () => {
  try {
    const arg = (process.argv[2] || '').trim();
    if (arg === '--help' || arg === '-h' || arg === 'help') {
      console.log('Usage: npx @react-aria/mcp@latest\n\nStarts the MCP server for React Aria documentation.');
      process.exit(0);
    }
    await startServer('react-aria', '0.1.0');
  } catch (err) {
    console.error(errorToString(err));
    process.exit(1);
  }
})();
