import {buildPageIndex, ensureParsedPage, resolvePageRef} from './page-manager.js';
import {errorToString, fetchText} from './utils.js';
import type {Library} from './types.js';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {parseSectionsFromMarkdown} from './parser.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {z} from 'zod';

export async function startServer(
  library: Library,
  version: string,
  registerAdditionalTools?: (server: McpServer) => void | Promise<void>
) {
  const server = new McpServer({
    name: library === 's2' ? 's2-docs-server' : 'react-aria-docs-server',
    version
  });

  // Build page index at startup.
  try {
    await buildPageIndex(library);
  } catch (e) {
    console.warn(`Warning: failed to load ${library} docs index (${errorToString(e)}).`);
  }

  const toolPrefix = library === 's2' ? 's2' : 'react_aria';

  server.registerTool(
    `list_${toolPrefix}_pages`,
    {
      title: library === 's2' ? 'List React Spectrum (@react-spectrum/s2) docs pages' : 'List React Aria docs pages',
      description: `Returns a list of available pages in the ${library} docs.`,
      inputSchema: {includeDescription: z.boolean().optional()}
    },
    async ({includeDescription}) => {
      const pages = await buildPageIndex(library);
      const items = pages
        .sort((a, b) => a.key.localeCompare(b.key))
        .map(p => includeDescription ? {name: p.name, description: p.description ?? ''} : {name: p.name});
      return {
        content: [{type: 'text', text: JSON.stringify(items, null, 2)}]
      };
    }
  );

  server.registerTool(
    `get_${toolPrefix}_page_info`,
    {
      title: 'Get page info',
      description: 'Returns page description and list of sections for a given page.',
      inputSchema: {page_name: z.string()}
    },
    async ({page_name}) => {
      const ref = await resolvePageRef(library, page_name);
      const info = await ensureParsedPage(ref);
      const out = {
        name: info.name,
        description: info.description ?? '',
        sections: info.sections.map(s => s.name)
      };
      return {content: [{type: 'text', text: JSON.stringify(out, null, 2)}]};
    }
  );

  server.registerTool(
    `get_${toolPrefix}_page`,
    {
      title: 'Get page markdown',
      description: 'Returns the full markdown content for a page, or a specific section if provided.',
      inputSchema: {page_name: z.string(), section_name: z.string().optional()}
    },
    async ({page_name, section_name}) => {
      const ref = await resolvePageRef(library, page_name);
      let text: string;
      text = await fetchText(ref.filePath);

      if (!section_name) {
        return {content: [{type: 'text', text}]} as const;
      }

      const lines = text.split(/\r?\n/);
      const sections = parseSectionsFromMarkdown(lines);
      let section = sections.find(s => s.name === section_name);
      if (!section) {
        section = sections.find(s => s.name.toLowerCase() === section_name.toLowerCase());
      }
      if (!section) {
        const available = sections.map(s => s.name).join(', ');
        throw new Error(`Section '${section_name}' not found in ${ref.key}. Available: ${available}`);
      }
      const snippet = lines.slice(section.startLine, section.endLine).join('\n');
      return {content: [{type: 'text', text: snippet}]} as const;
    }
  );

  if (registerAdditionalTools) {
    await registerAdditionalTools(server);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
