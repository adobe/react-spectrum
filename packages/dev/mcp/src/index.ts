#!/usr/bin/env node
/// <reference types="node" />
import {fileURLToPath} from 'url';
import fs from 'fs';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import path from 'path';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {z} from 'zod';

type SectionInfo = {
  name: string,
  startLine: number, // 0-based index where section heading starts
  endLine: number   // exclusive end line index for section content
};

type PageInfo = {
  key: string,          // e.g. "s2/Button"
  title: string,        // from top-level heading
  description?: string, // first paragraph after title
  filePath: string,     // absolute path to markdown file
  sections: SectionInfo[]
};

type Library = 's2' | 'react-aria';

function errorToString(err: unknown): string {
  if (err && typeof err === 'object' && 'stack' in err && typeof (err as any).stack === 'string') {
    return (err as any).stack as string;
  }
  if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
    return (err as any).message as string;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CDN base for docs. Can be overridden via env variable.
const DEFAULT_CDN_BASE = process.env.DOCS_CDN_BASE
  ?? 'https://reactspectrum.blob.core.windows.net/reactspectrum/7d2883a56fb1a0554864b21324d405f758deb3ce/s2-docs';

function libBaseUrl(library: Library) {
  return `${DEFAULT_CDN_BASE}/${library}`;
}

async function fetchText(url: string, timeoutMs = 15000): Promise<string> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs).unref?.();
  try {
    const res = await fetch(url, {signal: ctrl.signal, cache: 'no-store'} as any);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }
    return await res.text();
  } finally {
    clearTimeout(id as any);
  }
}

// Cache of parsed pages
const pageCache = new Map<string, PageInfo>();

let iconIdCache: string[] | null = null;
let illustrationIdCache: string[] | null = null;
let iconAliasesCache: Record<string, string[]> | null = null;
let illustrationAliasesCache: Record<string, string[]> | null = null;

function readBundledJson(filename: string): any | null {
  try {
    const p = path.resolve(__dirname, 'data', filename); // dist/data
    if (!fs.existsSync(p)) {return null;}
    const txt = fs.readFileSync(p, 'utf8');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

function listIconNames(): string[] {
  if (iconIdCache) {return iconIdCache;}
  const bundled = readBundledJson('icons.json');
  return (iconIdCache = Array.isArray(bundled) ? bundled.slice().sort((a, b) => a.localeCompare(b)) : []);
}

function listIllustrationNames(): string[] {
  if (illustrationIdCache) {return illustrationIdCache;}
  const bundled = readBundledJson('illustrations.json');
  return (illustrationIdCache = Array.isArray(bundled) ? bundled.slice().sort((a, b) => a.localeCompare(b)) : []);
}

async function loadIconAliases(): Promise<Record<string, string[]>> {
  if (iconAliasesCache) {return iconAliasesCache;}
  const bundled = readBundledJson('iconAliases.json');
  return (iconAliasesCache = (bundled && typeof bundled === 'object') ? bundled : {});
}

async function loadIllustrationAliases(): Promise<Record<string, string[]>> {
  if (illustrationAliasesCache) {return illustrationAliasesCache;}
  const bundled = readBundledJson('illustrationAliases.json');
  return (illustrationAliasesCache = (bundled && typeof bundled === 'object') ? bundled : {});
}

// Whether we've loaded the page index for a library yet.
const pageIndexLoaded = new Set<Library>();

// Build a lightweight index of pages for the given library from the CDN's llms.txt.
// Populates pageCache with stubs (title from filename; description/sections omitted).
async function buildPageIndex(library: Library): Promise<PageInfo[]> {
  if (pageIndexLoaded.has(library)) {
    return Array.from(pageCache.values()).filter(p => p.key.startsWith(`${library}/`));
  }

  const pages: PageInfo[] = [];

  // Read llms.txt to enumerate available pages without downloading them all.
  const llmsUrl = `${libBaseUrl(library)}/llms.txt`;
  const txt = await fetchText(llmsUrl);
  const re = /^\s*-\s*\[([^\]]+)\]\(([^)]+)\)(?:\s*:\s*(.*))?\s*$/;
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(re);
    if (!m) {continue;}
    const display = (m[1] || '').trim();
    const href = (m[2] || '').trim();
    const desc = (m[3] || '').trim() || undefined;
    if (!href || !/\.md$/i.test(href)) {continue;}
    const key = href.replace(/\.md$/i, '').replace(/\\/g, '/');
    const title = display || path.basename(key);
    const url = `${DEFAULT_CDN_BASE}/${key}.md`;
    const info: PageInfo = {key, title, description: desc, filePath: url, sections: []};
    pages.push(info);
    pageCache.set(info.key, info);
  }

  pageIndexLoaded.add(library);
  return pages.sort((a, b) => a.key.localeCompare(b.key));
}

function parseSectionsFromMarkdown(lines: string[]): SectionInfo[] {
  const sections: SectionInfo[] = [];
  let inCode = false;
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (/^```/.test(line.trim())) {inCode = !inCode;}
    if (inCode) {continue;}
    if (line.startsWith('## ')) {
      const name = line.replace(/^##\s+/, '').trim();
      sections.push({name, startLine: idx, endLine: lines.length});
    }
  }
  for (let s = 0; s < sections.length - 1; s++) {
    sections[s].endLine = sections[s + 1].startLine;
  }
  return sections;
}

function extractTitleAndDescription(lines: string[]): {title: string, description?: string} {
  let title = '';
  let description: string | undefined = undefined;

  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('# ')) {
      title = line.replace(/^#\s+/, '').trim();
      i++;
      break;
    }
  }

  let descLines: string[] = [];
  let inCode = false;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line.trim())) {inCode = !inCode;}
    if (inCode) {continue;}
    if (line.trim() === '') {
      if (descLines.length > 0) {break;} else {continue;}
    }
    if (/^#{1,6}\s/.test(line) || /^</.test(line.trim())) {continue;}
    descLines.push(line);
  }
  if (descLines.length > 0) {
    description = descLines.join('\n').trim();
  }

  return {title, description};
}

async function ensureParsedPage(info: PageInfo): Promise<PageInfo> {
  if (info.sections && info.sections.length > 0 && info.description !== undefined) {
    return info;
  }

  const text = await fetchText(info.filePath);
  const lines = text.split(/\r?\n/);
  const {title, description} = extractTitleAndDescription(lines);
  const sections = parseSectionsFromMarkdown(lines);
  const updated = {...info, title: title || info.title, description, sections};
  pageCache.set(updated.key, updated);
  return updated;
}

async function resolvePageRef(library: Library, pageName: string): Promise<PageInfo> {
  // Ensure index is loaded
  await buildPageIndex(library);

  if (pageCache.has(pageName)) {
    return pageCache.get(pageName)!;
  }

  if (pageName.includes('/')) {
    const normalized = pageName.replace(/\\/g, '/');
    const prefix = normalized.split('/', 1)[0];
    if (prefix !== library) {
      throw new Error(`Page '${pageName}' is not in the '${library}' library.`);
    }
    const maybe = pageCache.get(normalized);
    if (maybe) {return maybe;}
    const filePath = `${DEFAULT_CDN_BASE}/${normalized}.md`;
    const stub: PageInfo = {key: normalized, title: path.basename(normalized), description: undefined, filePath, sections: []};
    pageCache.set(stub.key, stub);
    return stub;
  }

  const key = `${library}/${pageName}`;
  const maybe = pageCache.get(key);
  if (maybe) {return maybe;}
  const filePath = `${DEFAULT_CDN_BASE}/${key}.md`;
  const stub: PageInfo = {key, title: pageName, description: undefined, filePath, sections: []};
  pageCache.set(stub.key, stub);
  return stub;
}

async function startServer(library: Library) {
  const server = new McpServer({
    name: library === 's2' ? 's2-docs-server' : 'react-aria-docs-server',
    version: '0.1.0'
  });

  // Build page index at startup.
  try {
    await buildPageIndex(library);
  } catch (e) {
    console.warn(`Warning: failed to load ${library} docs index (${errorToString(e)}).`);
  }

  // list_pages tool
  server.registerTool(
    'list_pages',
    {
      title: library === 's2' ? 'List React Spectrum (@react-spectrum/s2) docs pages' : 'List React Aria docs pages',
      description: `Returns a list of available pages in the ${library} docs.`,
      inputSchema: {includeDescription: z.boolean().optional()}
    },
    async ({includeDescription}) => {
      const pages = await buildPageIndex(library);
      const items = pages
        .sort((a, b) => a.key.localeCompare(b.key))
        .map(p => includeDescription ? {key: p.key, title: p.title, description: p.description ?? ''} : {key: p.key, title: p.title});
      return {
        content: [{type: 'text', text: JSON.stringify(items, null, 2)}]
      };
    }
  );

  // get_page_info tool
  server.registerTool(
    'get_page_info',
    {
      title: 'Get page info',
      description: 'Returns page description and list of sections for a given page.',
      inputSchema: {page_name: z.string()}
    },
    async ({page_name}) => {
      const ref = await resolvePageRef(library, page_name);
      const info = await ensureParsedPage(ref);
      const out = {
        key: info.key,
        title: info.title,
        description: info.description ?? '',
        sections: info.sections.map(s => s.name)
      };
      return {content: [{type: 'text', text: JSON.stringify(out, null, 2)}]};
    }
  );

  // get_page tool
  server.registerTool(
    'get_page',
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

  if (library === 's2') {
    // search_icons tool
    server.registerTool(
      'search_icons',
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

    // search_illustrations tool
    server.registerTool(
      'search_illustrations',
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
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

function printUsage() {
  const usage = 'Usage: mcp <subcommand>\n\nSubcommands:\n  s2           Start MCP server for React Spectrum S2 docs\n  react-aria   Start MCP server for React Aria docs\n\nEnvironment:\n\nExamples:\n  npx @react-spectrum/mcp s2\n  npx @react-spectrum/mcp react-aria';
  console.log(usage);
}

// CLI entry
(async () => {
  try {
    const arg = (process.argv[2] || '').trim();
    if (arg === '--help' || arg === '-h' || arg === 'help') {
      printUsage();
      process.exit(0);
    }
    const library: Library = arg === 'react-aria' ? 'react-aria' : 's2';
    await startServer(library);
  } catch (err) {
    console.error(errorToString(err));
    process.exit(1);
  }
})();
