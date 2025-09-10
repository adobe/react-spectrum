#!/usr/bin/env node
import fg from 'fast-glob';
import {fileURLToPath, pathToFileURL} from 'url';
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

// Resolve docs dist root based on this file location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_DIST_ROOT = path.resolve(__dirname, '../../s2-docs/dist');

function assertDocsExist() {
  if (!fs.existsSync(DOCS_DIST_ROOT)) {
    const hint = path.resolve(__dirname, '../../s2-docs/scripts/generateMarkdownDocs.mjs');
    throw new Error(`S2 docs dist not found at ${DOCS_DIST_ROOT}. Build them first via: yarn workspace @react-spectrum/s2-docs generate:md (script: ${hint})`);
  }
}

// Cache of parsed pages
const pageCache = new Map<string, PageInfo>();

const ICONS_DIR = path.resolve(__dirname, '../../../@react-spectrum/s2/s2wf-icons');
let iconIdCache: string[] | null = null;
const ILLUSTRATIONS_DIR = path.resolve(__dirname, '../../../@react-spectrum/s2/spectrum-illustrations/linear');
let illustrationIdCache: string[] | null = null;
let iconAliasesCache: Record<string, string[]> | null = null;
let illustrationAliasesCache: Record<string, string[]> | null = null;

function ensureIconsExist() {
  if (!fs.existsSync(ICONS_DIR)) {
    throw new Error(`S2 icons directory not found at ${ICONS_DIR}`);
  }
}

function listIconNames(): string[] {
  if (iconIdCache) {return iconIdCache;}
  ensureIconsExist();
  const files = fg.sync('*.svg', {cwd: ICONS_DIR, absolute: false, suppressErrors: true});
  const ids = Array.from(new Set(
    files.map(f => f.replace(/\.svg$/i, '')
      // Mirror IconPicker.tsx regex to derive the id from the filename
      .replace(/^S2_Icon_(.*?)(Size\d+)?_2.*/, '$1'))
  )).sort((a, b) => a.localeCompare(b));
  iconIdCache = ids;
  return ids;
}

function ensureIllustrationsExist() {
  if (!fs.existsSync(ILLUSTRATIONS_DIR)) {
    throw new Error(`S2 illustrations directory not found at ${ILLUSTRATIONS_DIR}`);
  }
}

function listIllustrationNames(): string[] {
  if (illustrationIdCache) {return illustrationIdCache;}
  ensureIllustrationsExist();
  // linear directory may contain multiple sizes per illustration name
  const files = fg.sync('**/*.svg', {cwd: ILLUSTRATIONS_DIR, absolute: false, suppressErrors: true});
  const ids = Array.from(new Set(
    files.map(f => {
      const base = f.replace(/\.svg$/i, '')
        // Pattern: S2_lin_<name>_<size>
        .replace(/^S2_lin_(.*)_\d+$/, '$1');
      return base ? (base.charAt(0).toUpperCase() + base.slice(1)) : base;
    })
  )).sort((a, b) => a.localeCompare(b));
  illustrationIdCache = ids;
  return ids;
}

async function loadIconAliases(): Promise<Record<string, string[]>> {
  if (iconAliasesCache) {return iconAliasesCache;}
  const aliasesPath = path.resolve(__dirname, '../../s2-docs/src/iconAliases.js');
  if (!fs.existsSync(aliasesPath)) {return iconAliasesCache = {};}
  const mod = await import(pathToFileURL(aliasesPath).href);
  return (iconAliasesCache = (mod.iconAliases ?? {}));
}

async function loadIllustrationAliases(): Promise<Record<string, string[]>> {
  if (illustrationAliasesCache) {return illustrationAliasesCache;}
  const aliasesPath = path.resolve(__dirname, '../../s2-docs/src/illustrationAliases.js');
  if (!fs.existsSync(aliasesPath)) {return illustrationAliasesCache = {};}
  const mod = await import(pathToFileURL(aliasesPath).href);
  return (illustrationAliasesCache = (mod.illustrationAliases ?? {}));
}

function readAllPagesFor(library: Library): PageInfo[] {
  assertDocsExist();
  const pattern = `${library}/**/*.md`;
  const absFiles = fg.sync([pattern], {cwd: DOCS_DIST_ROOT, absolute: true, suppressErrors: true});
  const pages: PageInfo[] = [];
  for (const absPath of absFiles) {
    if (path.basename(absPath).toLowerCase() === 'llms.txt') {continue;}
    const rel = path.relative(DOCS_DIST_ROOT, absPath);
    const key = rel.replace(/\\/g, '/').replace(/\.md$/i, '');
    const info = parsePage(absPath, key);
    pages.push(info);
    pageCache.set(info.key, info);
  }
  return pages;
}

function parsePage(absPath: string, keyFromPath?: string): PageInfo {
  const raw = fs.readFileSync(absPath, 'utf8');
  const lines = raw.split(/\r?\n/);

  let title = '';
  let description: string | undefined = undefined;
  let i = 0;
  // Find first H1 (title)
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('# ')) {
      title = line.replace(/^#\s+/, '').trim();
      i++;
      break;
    }
  }

  // Collect first paragraph as description (non-empty text until blank line)
  let descLines: string[] = [];
  let inCode = false;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line.trim())) {inCode = !inCode;}
    if (inCode) {continue;}
    if (line.trim() === '') {
      if (descLines.length > 0) {break;} else {continue;}
    }
    // ignore headings and HTML-like tags if they appear before paragraph
    if (/^#{1,6}\s/.test(line) || /^</.test(line.trim())) {continue;}
    descLines.push(line);
  }
  if (descLines.length > 0) {
    description = descLines.join('\n').trim();
  }

  // Parse sections (## ...)
  const sections: SectionInfo[] = [];
  inCode = false;
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (/^```/.test(line.trim())) {inCode = !inCode;}
    if (inCode) {continue;}
    if (line.startsWith('## ')) {
      const name = line.replace(/^##\s+/, '').trim();
      sections.push({name, startLine: idx, endLine: lines.length});
    }
  }
  // Compute endLine for each section as start of next section
  for (let s = 0; s < sections.length - 1; s++) {
    sections[s].endLine = sections[s + 1].startLine;
  }

  const rel = path.relative(DOCS_DIST_ROOT, absPath).replace(/\\/g, '/');
  const key = keyFromPath ?? rel.replace(/\.md$/i, '');
  return {key, title, description, filePath: absPath, sections};
}

function resolvePagePathFor(library: Library, pageName: string): PageInfo {
  // Accept keys like "s2/Button" or plain "Button" but restrict to the selected library
  assertDocsExist();

  if (pageCache.has(pageName)) {
    return pageCache.get(pageName)!;
  }

  if (pageName.includes('/')) {
    const normalized = pageName.replace(/\\/g, '/');
    const prefix = normalized.split('/', 1)[0];
    if (prefix !== library) {
      throw new Error(`Page '${pageName}' is not in the '${library}' library.`);
    }
    const abs = path.join(DOCS_DIST_ROOT, `${normalized}.md`);
    if (!fs.existsSync(abs)) {
      throw new Error(`Page not found: ${pageName}`);
    }
    const info = parsePage(abs, normalized);
    pageCache.set(normalized, info);
    return info;
  }

  const abs = path.join(DOCS_DIST_ROOT, library, `${pageName}.md`);
  if (!fs.existsSync(abs)) {
    throw new Error(`Page not found in '${library}': ${pageName}`);
  }
  const key = `${library}/${pageName}`;
  const info = parsePage(abs, key);
  pageCache.set(info.key, info);
  return info;
}

function readPageContent(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

async function startServer(library: Library) {
  const server = new McpServer({
    name: library === 's2' ? 's2-docs-server' : 'react-aria-docs-server',
    version: '0.1.0'
  });

  // list_pages tool
  server.registerTool(
    'list_pages',
    {
      title: library === 's2' ? 'List React Spectrum (@react-spectrum/s2) docs pages' : 'List React Aria docs pages',
      description: `Returns a list of available pages in the ${library} docs.`,
      inputSchema: {includeDescription: z.boolean().optional()}
    },
    async ({includeDescription}) => {
      const pages = readAllPagesFor(library);
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
      const info = resolvePagePathFor(library, page_name);
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
      const info = resolvePagePathFor(library, page_name);
      let text: string;
      if (!section_name) {
        text = readPageContent(info.filePath);
      } else {
        // Find section by exact title match (case-sensitive first, then case-insensitive)
        let section = info.sections.find(s => s.name === section_name);
        if (!section) {
          section = info.sections.find(s => s.name.toLowerCase() === section_name.toLowerCase());
        }
        if (!section) {
          const available = info.sections.map(s => s.name).join(', ');
          throw new Error(`Section '${section_name}' not found in ${info.key}. Available: ${available}`);
        }
        const lines = fs.readFileSync(info.filePath, 'utf8').split(/\r?\n/);
        text = lines.slice(section.startLine, section.endLine).join('\n');
      }
      return {content: [{type: 'text', text}]} as const;
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
  const usage = 'Usage: mcp <subcommand>\n\nSubcommands:\n  s2           Start MCP server for React Spectrum S2 docs\n  react-aria   Start MCP server for React Aria docs\n\nExamples:\n  npx @react-spectrum/mcp s2\n  npx @react-spectrum/mcp react-aria';
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
