#!/usr/bin/env node
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  const transport = new StdioClientTransport({
    command: 'node',
    args: [new URL('../dist/mcp/s2/src/index.js', import.meta.url).pathname],
    env: process.env
  });

  const client = new Client({name: 's2-docs-smoke', version: '0.0.0'});
  await client.connect(transport);

  const result = await client.callTool({
    name: 'search_docs',
    arguments: {query: 'ComboBox', version: 'latest'}
  });

  const text = result?.content?.[0]?.text ?? '';
  if (result?.isError) {
    throw new Error(`MCP smoke test failed:\n${text}`);
  }
  console.log(text);
  await client.close();
}

main().catch(err => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
