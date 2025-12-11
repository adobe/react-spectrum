#!/usr/bin/env node
/// <reference types="node" />
import {errorToString} from '../../shared/src/utils.js';
import {listIconNames, listIllustrationNames, loadIconAliases, loadIllustrationAliases} from './s2-data.js';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {startServer} from '../../shared/src/server.js';
import {z} from 'zod';

// CLI entry for S2
(async () => {
  try {
    const arg = (process.argv[2] || '').trim();
    if (arg === '--help' || arg === '-h' || arg === 'help') {
      console.log('Usage: npx @react-spectrum/mcp@latest\n\nStarts the MCP server for React Spectrum (S2) documentation.');
      process.exit(0);
    }

    await startServer('s2', '0.1.0', (server: McpServer) => {
      server.registerTool(
        'search_s2_icons',
        {
          title: 'Search S2 icons',
          description: 'Searches the S2 workflow icon set by one or more terms; returns matching icon names.',
          inputSchema: {terms: z.union([z.string(), z.array(z.string())])}
        },
        async ({terms}) => {
          const allNames = listIconNames();
          const nameSet = new Set(allNames);
          const aliases = await loadIconAliases();
          const rawTerms = Array.isArray(terms) ? terms : [terms];
          const normalized = Array.from(new Set(rawTerms.map(t => String(t ?? '').trim().toLowerCase()).filter(Boolean)));
          if (normalized.length === 0) {
            throw new Error('Provide at least one non-empty search term.');
          }
          // direct name matches
          const results = new Set(allNames.filter(name => {
            const nameLower = name.toLowerCase();
            return normalized.some(term => nameLower.includes(term));
          }));
          // alias matches
          for (const [aliasKey, targets] of Object.entries(aliases)) {
            if (!targets || targets.length === 0) {continue;}
            const aliasLower = aliasKey.toLowerCase();
            if (normalized.some(term => aliasLower.includes(term) || term.includes(aliasLower))) {
              for (const t of targets) {
                const n = String(t);
                if (nameSet.has(n)) {results.add(n);}
              }
            }
          }
          return {content: [{type: 'text', text: JSON.stringify(Array.from(results).sort((a, b) => a.localeCompare(b)), null, 2)}]};
        }
      );

      server.registerTool(
        'search_s2_illustrations',
        {
          title: 'Search S2 illustrations',
          description: 'Searches the S2 illustrations set by one or more terms; returns matching illustration names.',
          inputSchema: {terms: z.union([z.string(), z.array(z.string())])}
        },
        async ({terms}) => {
          const allNames = listIllustrationNames();
          const nameSet = new Set(allNames);
          const aliases = await loadIllustrationAliases();
          const rawTerms = Array.isArray(terms) ? terms : [terms];
          const normalized = Array.from(new Set(rawTerms.map(t => String(t ?? '').trim().toLowerCase()).filter(Boolean)));
          if (normalized.length === 0) {
            throw new Error('Provide at least one non-empty search term.');
          }
          // direct name matches
          const results = new Set(allNames.filter(name => {
            const nameLower = name.toLowerCase();
            return normalized.some(term => nameLower.includes(term));
          }));
          // alias matches
          for (const [aliasKey, targets] of Object.entries(aliases)) {
            if (!targets || targets.length === 0) {continue;}
            const aliasLower = aliasKey.toLowerCase();
            if (normalized.some(term => aliasLower.includes(term) || term.includes(aliasLower))) {
              for (const t of targets) {
                const n = String(t);
                if (nameSet.has(n)) {results.add(n);}
              }
            }
          }
          return {content: [{type: 'text', text: JSON.stringify(Array.from(results).sort((a, b) => a.localeCompare(b)), null, 2)}]};
        }
      );
    });
  } catch (err) {
    console.error(errorToString(err));
    process.exit(1);
  }
})();
