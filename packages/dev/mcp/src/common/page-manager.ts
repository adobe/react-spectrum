import {DEFAULT_CDN_BASE, fetchText} from './utils.js';
import {extractNameAndDescription, parseSectionsFromMarkdown} from './parser.js';
import type {Library, PageInfo} from './types.js';
import path from 'path';

// Cache of parsed pages
const pageCache = new Map<string, PageInfo>();

// Whether we've loaded the page index for a library yet.
const pageIndexLoaded = new Set<Library>();

function libBaseUrl(library: Library) {
  return `${DEFAULT_CDN_BASE}/${library}`;
}

// Build an index of pages for the given library from the CDN's llms.txt.
export async function buildPageIndex(library: Library): Promise<PageInfo[]> {
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
    const description = (m[3] || '').trim() || undefined;
    if (!href || !/\.md$/i.test(href)) {continue;}
    const key = href.replace(/\.md$/i, '').replace(/\\/g, '/');
    const name = display || path.basename(key);
    const filePath = `${DEFAULT_CDN_BASE}/${key}.md`;
    const info: PageInfo = {key, name, description, filePath, sections: []};
    pages.push(info);
    pageCache.set(info.key, info);
  }

  pageIndexLoaded.add(library);
  return pages.sort((a, b) => a.key.localeCompare(b.key));
}

export async function ensureParsedPage(info: PageInfo): Promise<PageInfo> {
  if (info.sections && info.sections.length > 0 && info.description !== undefined) {
    return info;
  }

  const text = await fetchText(info.filePath);
  const lines = text.split(/\r?\n/);
  const {name, description} = extractNameAndDescription(lines);
  const sections = parseSectionsFromMarkdown(lines);
  const updated = {...info, name: name || info.name, description, sections};
  pageCache.set(updated.key, updated);
  return updated;
}

export async function resolvePageRef(library: Library, pageName: string): Promise<PageInfo> {
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
    const stub: PageInfo = {key: normalized, name: path.basename(normalized), description: undefined, filePath, sections: []};
    pageCache.set(stub.key, stub);
    return stub;
  }

  const key = `${library}/${pageName}`;
  const maybe = pageCache.get(key);
  if (maybe) {return maybe;}
  const filePath = `${DEFAULT_CDN_BASE}/${key}.md`;
  const stub: PageInfo = {key, name: pageName, description: undefined, filePath, sections: []};
  pageCache.set(stub.key, stub);
  return stub;
}
