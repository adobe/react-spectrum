#!/usr/bin/env node
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  const subcommand = process.argv[2] || 's2';
  const transport = new StdioClientTransport({
    command: 'node',
    args: [new URL('../dist/index.js', import.meta.url).pathname, subcommand]
  });

  const client = new Client({name: 's2-docs-smoke', version: '0.0.0'});
  await client.connect(transport);

  const result = await client.callTool({
    name: 'list_pages',
    arguments: {includeDescription: true}
  });

  const text = result?.content?.[0]?.text ?? '';
  console.log(text);
  process.exit(0);
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
