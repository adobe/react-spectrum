/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  AgentDocsError,
  API_VERSION,
  ApiDocsResult,
  BrandId,
  CatalogEntryIR,
  CatalogSectionIR,
  CliCapabilityManifest,
  CommonQueryOptions,
  DocWarning,
  EXIT_CODES,
  ExportApiIR,
  IconsDocsResult,
  LibraryId,
  PackageSlicePointer,
  PrefetchDocsResult,
  ReadDocsResult,
  READER_SCHEMA_VERSION,
  ReadItemResult,
  ReadSectionRef,
  ResolutionState,
  ResolvedPackageProvenance,
  SearchDocsResult,
  SearchHit,
  SearchIndexRecord,
  SectionFilter,
  SnapshotEnvelopeRef,
  SnapshotIndex,
  TokensDocsResult
} from './types.js';
import {createHash} from 'node:crypto';
import {
  ensurePackageSliceExtracted,
  isSafeEntrySlug,
  loadSnapshotIndex,
  loadSnapshotManifest,
  readSliceEntryBySlug,
  readSliceS2Assets,
  readSliceSearchIndex,
  resolveDefaultCacheDir
} from './cache.js';
import {formatReadOutput, ReadOutputOptions} from './format.js';
import {LIBRARY_TO_PACKAGES, resolveWorkspace} from './resolver.js';
import path from 'node:path';

const QUERY_SYNONYMS: Record<string, string[]> = {
  dropdown: ['picker', 'select', 'combobox', 'menu'],
  searchable: ['combobox', 'autocomplete', 'searchfield', 'filter'],
  currency: ['numberformatter', 'usenumberformatter'],
  modal: ['dialog', 'alertdialog', 'popover'],
  popup: ['popover', 'dialog', 'tooltip', 'contextualhelp'],
  notification: ['toast', 'inlinealert', 'badge'],
  spinner: ['progresscircle', 'progressbar', 'pending'],
  toggle: ['switch', 'togglebutton', 'checkbox'],
  tabs: ['tabs', 'tablist', 'tabpanel'],
  date: ['datepicker', 'daterangepicker', 'calendar', 'calendardate'],
  grid: ['tableview', 'table', 'gridlist', 'treeview'],
  drawer: ['tray', 'dialog', 'modal'],
  style: ['styling', 'style-macro', 'tokens']
};

function tokenizeQuery(query: string): string[] {
  const raw = query
    .toLowerCase()
    .split(/[^a-z0-9@/_-]+/)
    .map(t => t.trim())
    .filter(t => t.length >= 2);
  return Array.from(new Set(raw));
}

function collectEnvelopeSnapshots(
  index: SnapshotIndex,
  snapshotIds: Iterable<string>
): Record<string, SnapshotEnvelopeRef> {
  const out: Record<string, SnapshotEnvelopeRef> = {};
  for (const id of snapshotIds) {
    const info = index.snapshots[id];
    if (info) {
      out[id] = {
        snapshotId: info.snapshotId,
        schemaVersion: index.schemaVersion,
        sourceTag: info.sourceTag,
        sourceCommit: info.sourceCommit,
        docRevision: info.docRevision,
        packages: info.packages
      };
    }
  }
  return out;
}

async function openSliceForProvenance(
  prov: ResolvedPackageProvenance,
  index: SnapshotIndex,
  options: CommonQueryOptions
): Promise<string> {
  let ptr: PackageSlicePointer | undefined =
    index.packages[prov.packageName]?.[prov.packageVersion];
  if (!ptr || ptr.snapshotId !== prov.snapshotId) {
    const snapshot = index.snapshots[prov.snapshotId];
    ptr = snapshot
      ? (await loadSnapshotManifest(snapshot, options)).slices[prov.packageName]
      : undefined;
  }
  if (!ptr) {
    throw new AgentDocsError(
      'ERR_SNAPSHOT_NOT_FOUND',
      `Slice metadata missing in index for ${prov.packageName}@${prov.packageVersion}.`,
      EXIT_CODES.NOT_FOUND
    );
  }
  if (
    ptr.snapshotId !== prov.snapshotId ||
    ptr.packageVersion !== prov.packageVersion ||
    ptr.sliceRelPath !== prov.slicePath ||
    ptr.sliceSha256 !== prov.sliceSha256
  ) {
    throw new AgentDocsError(
      'ERR_CACHE_INTEGRITY',
      `Slice metadata no longer matches the resolution for ${prov.packageName}@${prov.packageVersion} in snapshot '${prov.snapshotId}'.`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }
  return ensurePackageSliceExtracted(prov.packageName, prov.packageVersion, ptr, {
    cacheDir: options.cacheDir,
    snapshotSource: options.snapshotSource,
    offline: options.offline
  });
}

function parseQualifiedId(
  rawId: string,
  defaultLibrary: LibraryId,
  resolution: ResolutionState
): {library: LibraryId; slug: string} {
  const trimmed = rawId.trim();
  const colonIdx = trimmed.indexOf(':');
  if (colonIdx > 0) {
    const prefix = trimmed.slice(0, colonIdx).toLowerCase();
    const slug = trimmed.slice(colonIdx + 1).replace(/^\/+|\/+$/g, '');
    if (prefix === 's2' || prefix === 'spectrum') {
      return {library: 's2', slug};
    }
    if (prefix === 'rac' || prefix === 'aria-components') {
      return {library: 'rac', slug};
    }
    if (prefix === 'react-aria' || prefix === 'aria') {
      return {library: 'react-aria', slug};
    }
    if (prefix === 'react-stately' || prefix === 'stately') {
      return {library: 'react-stately', slug};
    }
    if (prefix === 'internationalized' || prefix === 'i18n') {
      return {library: 'internationalized', slug};
    }
  }

  // Unqualified ID: prefer defaultLibrary if present in resolution, otherwise first primary library in resolution
  const cleanSlug = trimmed.replace(/^\/+|\/+$/g, '');
  if (defaultLibrary === 's2' && resolution.packages['@react-spectrum/s2']) {
    return {library: 's2', slug: cleanSlug};
  }
  if (defaultLibrary === 'rac' && resolution.packages['react-aria-components']) {
    return {library: 'rac', slug: cleanSlug};
  }
  if (resolution.packages['@react-spectrum/s2']) {
    return {library: 's2', slug: cleanSlug};
  }
  if (resolution.packages['react-aria-components']) {
    return {library: 'rac', slug: cleanSlug};
  }
  if (resolution.packages['react-aria']) {
    return {library: 'react-aria', slug: cleanSlug};
  }
  return {library: defaultLibrary, slug: cleanSlug};
}

function candidatePackagesForLookup(library: LibraryId, slug: string): string[] {
  if (library === 'internationalized') {
    if (slug.startsWith('number/')) {
      return ['@internationalized/number', '@internationalized/date'];
    }
    return ['@internationalized/date', '@internationalized/number'];
  }
  if (library === 'rac') {
    return ['react-aria-components', 'react-aria'];
  }
  return LIBRARY_TO_PACKAGES[library] || ['@react-spectrum/s2'];
}

function scoreSearchRecord(
  rec: SearchIndexRecord,
  rawQueryLower: string,
  terms: Array<{token: string; synonyms: string[]}>,
  preferredLibrary: LibraryId | null
): number {
  const titleLower = rec.title.toLowerCase();
  const slugLower = rec.slug.toLowerCase();
  const idLower = rec.id.toLowerCase();
  const summaryLower = rec.summary.toLowerCase();
  const keywordsLower = (rec.keywords || []).map(k => k.toLowerCase());
  const exportsLower = (rec.exports || []).map(e => e.toLowerCase());

  let score = 0;

  if (idLower === rawQueryLower || titleLower === rawQueryLower || slugLower === rawQueryLower) {
    score += 120;
  } else if (titleLower.includes(rawQueryLower) || slugLower.includes(rawQueryLower)) {
    score += 65;
  }

  for (const {token, synonyms} of terms) {
    let directScore = 0;
    if (titleLower === token || slugLower === token) {
      directScore += 55;
    } else if (titleLower.includes(token) || slugLower.includes(token)) {
      directScore += 30;
    }
    if (exportsLower.includes(token)) {
      directScore += 35;
    } else if (exportsLower.some(e => e.includes(token))) {
      directScore += 15;
    }
    if (keywordsLower.some(k => k.includes(token))) {
      directScore += 22;
    }
    if (summaryLower.includes(token)) {
      directScore += 12;
    }
    if (rec.kind.toLowerCase().includes(token)) {
      directScore += 10;
    }

    let synonymScore = 0;
    for (const synonym of synonyms) {
      if (titleLower === synonym || slugLower === synonym) {
        synonymScore = 28;
        break;
      }
      if (
        titleLower.includes(synonym) ||
        keywordsLower.some(k => k.includes(synonym)) ||
        summaryLower.includes(synonym)
      ) {
        synonymScore = 12;
      }
    }
    // A synonym is evidence for its query term. Several aliases for the same term
    // should not outweigh a result that matches more of the query.
    score += Math.max(directScore, synonymScore);
  }

  if (score > 0 && preferredLibrary && rec.library === preferredLibrary) {
    score += 8;
  }
  // Slightly prefer primary component/guide docs over secondary subpages on ties
  if (score > 0 && (rec.kind === 'component' || rec.kind === 'guide')) {
    score += 4;
  }

  return score;
}

export interface SearchDocsOptions extends CommonQueryOptions {
  query: string;
  library?: LibraryId;
  limit?: number;
  cliCommandPrefix?: string;
}

function quoteShellArg(value: string): string {
  return /^[\w@%+=:,./-]+$/.test(value) ? value : `'${value.replace(/'/g, "'\\''")}'`;
}

function formatFollowUpFlags(options: CommonQueryOptions, resolution: ResolutionState): string {
  const source = options.snapshotSource;
  const values = {
    '--cwd': resolution.cwd,
    '--version': options.versionOverride,
    '--snapshot': options.snapshotOverride,
    '--cache-dir': options.cacheDir ? path.resolve(options.cacheDir) : undefined,
    '--snapshot-source':
      source && !/^(?:https?|file):\/\//i.test(source) ? path.resolve(source) : source
  };
  return [
    ...Object.entries(values).flatMap(([flag, value]) =>
      value ? [flag, quoteShellArg(value)] : []
    ),
    ...(options.offline ? ['--offline'] : []),
    ...(options.strictVersion ? ['--strict-version'] : []),
    ...(options.allowLatestFallback ? ['--allow-latest'] : [])
  ].join(' ');
}

function warningsForPackages(
  resolution: ResolutionState,
  packages: Iterable<string>
): DocWarning[] {
  const selected = new Set(packages);
  return resolution.warnings.filter(
    warning => !warning.packageName || selected.has(warning.packageName)
  );
}

function getStatelyCoverageWarning(resolution: ResolutionState): DocWarning | undefined {
  if (resolution.packages['react-stately']) {
    return undefined;
  }
  const warning = resolution.warnings.find(
    warning =>
      warning.packageName === 'react-stately' &&
      warning.code === 'WARN_AUX_PACKAGE_SLICE_UNAVAILABLE'
  );
  return (
    warning ?? {
      code: 'WARN_LIBRARY_UNAVAILABLE',
      packageName: 'react-stately',
      message:
        'No version-matched React Stately documentation snapshot is available for this workspace. Run resolve to inspect package versions.'
    }
  );
}

export async function searchDocs(options: SearchDocsOptions): Promise<SearchDocsResult> {
  const query = String(options.query || '').trim();
  if (!query) {
    throw new AgentDocsError(
      'ERR_INVALID_ARGS',
      'Provide a non-empty search query.',
      EXIT_CODES.INVALID_ARGS
    );
  }

  const index = await loadSnapshotIndex({
    cacheDir: options.cacheDir,
    snapshotSource: options.snapshotSource,
    offline: options.offline
  });
  const resolution = await resolveWorkspace(options);
  const limit = Math.max(1, Math.min(options.limit ?? 10, 50));
  const cliPrefix =
    options.cliCommandPrefix || (options.defaultLibrary === 'rac' ? 'react-aria' : 'spectrum');
  const followUpFlags = formatFollowUpFlags(options, resolution);

  const prefixMatch =
    /^(s2|spectrum|rac|react-aria-components|react-aria|aria|react-stately|stately|internationalized|i18n):/i.exec(
      query
    );
  const prefixMap: Record<string, LibraryId> = {
    s2: 's2',
    spectrum: 's2',
    rac: 'rac',
    'react-aria-components': 'rac',
    'react-aria': 'react-aria',
    aria: 'react-aria',
    'react-stately': 'react-stately',
    stately: 'react-stately',
    internationalized: 'internationalized',
    i18n: 'internationalized'
  };
  const prefixedLibrary = prefixMatch ? prefixMap[prefixMatch[1].toLowerCase()] : undefined;
  const remainderAfterPrefix = prefixMatch ? query.slice(prefixMatch[0].length).trim() : '';
  const usePrefix = Boolean(prefixedLibrary && remainderAfterPrefix);
  const library = options.library ?? (usePrefix ? prefixedLibrary : undefined);
  const searchTerm = usePrefix && library === prefixedLibrary ? remainderAfterPrefix : query;
  const rawQueryLower = searchTerm.toLowerCase();
  const terms = tokenizeQuery(searchTerm).map(token => ({
    token,
    synonyms: Object.entries(QUERY_SYNONYMS)
      .filter(([key]) => token === key || token === `${key}s`)
      .flatMap(([, synonyms]) => synonyms)
  }));

  const hits: SearchHit[] = [];
  const usedSnapshots = new Set<string>();
  const isHookQuery = /^use[A-Z][\w$]*$/.test(searchTerm);
  let foundExactHook = false;

  for (const prov of Object.values(resolution.packages)) {
    const sliceDir = await openSliceForProvenance(prov, index, options);
    const records = readSliceSearchIndex(sliceDir);
    for (const rec of records) {
      if (library && rec.library !== library) {
        continue;
      }
      const score = scoreSearchRecord(
        rec,
        rawQueryLower,
        terms,
        library || options.defaultLibrary || null
      );
      if (score <= 0) {
        continue;
      }
      if (
        isHookQuery &&
        (rec.title.toLowerCase() === rawQueryLower ||
          rec.exports.some(name => name.toLowerCase() === rawQueryLower))
      ) {
        foundExactHook = true;
      }
      usedSnapshots.add(prov.snapshotId);
      hits.push({
        id: rec.id,
        title: rec.title,
        kind: rec.kind,
        library: rec.library,
        summary: rec.summary,
        score,
        exports: (rec.exports || []).slice(0, 8),
        sourceUrl: rec.sourceUrl,
        provenance: {
          packageName: prov.packageName,
          packageVersion: prov.packageVersion,
          snapshotId: prov.snapshotId,
          exactMatch: prov.exactMatch
        },
        followUpCommands: [
          `${cliPrefix} read ${quoteShellArg(rec.id)} ${followUpFlags}`.trimEnd(),
          ...(rec.exports && rec.exports.length > 0
            ? [`${cliPrefix} api ${quoteShellArg(rec.id)} ${followUpFlags}`.trimEnd()]
            : [])
        ]
      });
    }
  }

  hits.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const topHits = hits.slice(0, limit);
  const warnings = warningsForPackages(
    resolution,
    library ? candidatePackagesForLookup(library, '') : Object.keys(resolution.packages)
  );
  const coverageWarning =
    library === 'react-stately' ? getStatelyCoverageWarning(resolution) : undefined;
  if (coverageWarning && !warnings.includes(coverageWarning)) {
    warnings.push(coverageWarning);
  }
  if (isHookQuery && !foundExactHook && topHits.length > 0) {
    warnings.push({
      code: 'WARN_NO_EXACT_HOOK_MATCH',
      message: `No documented hook exactly matches '${searchTerm}' in the selected snapshots. Showing related results.`
    });
  }

  return {
    apiVersion: API_VERSION,
    query,
    libraryFilter: library || null,
    snapshots: collectEnvelopeSnapshots(index, usedSnapshots),
    resolution,
    warnings,
    followUpFlags,
    results: topHits
  };
}

function estimateTokens(text: string): number {
  return Math.ceil(Buffer.byteLength(text, 'utf8') / 4);
}

type ReadChunk = ReadSectionRef & ({section: CatalogSectionIR} | {apiExport: ExportApiIR});
type ReadFailure = Extract<ReadItemResult, {ok: false}>;

function isApiHeading(section: CatalogSectionIR): boolean {
  return section.id === 'api' && (section.level ?? 2) === 2;
}

function getReadChunks(entry: CatalogEntryIR): ReadChunk[] {
  const chunks: ReadChunk[] = entry.sections.map(section => ({
    id: section.id,
    heading: section.heading,
    category: section.category,
    level: Math.max(2, section.level ?? 2),
    section
  }));
  const apiHeading = entry.sections.findIndex(isApiHeading);
  const nextHeading =
    apiHeading < 0
      ? -1
      : entry.sections.findIndex((section, i) => i > apiHeading && (section.level ?? 2) === 2);
  chunks.splice(
    nextHeading < 0 ? chunks.length : nextHeading,
    0,
    ...entry.exports.map<ReadChunk>(apiExport => ({
      id: `api:${apiExport.name}`,
      heading: apiExport.name,
      category: 'api',
      level: 3,
      apiExport
    }))
  );
  // Duplicate headings in existing snapshots need distinct selectors.
  const counts = new Map<string, number>();
  const occurrences = new Map<string, number>();
  for (const {id} of chunks) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  for (const chunk of chunks) {
    const {id} = chunk;
    if ((counts.get(id) ?? 0) > 1) {
      const occurrence = (occurrences.get(id) ?? 0) + 1;
      occurrences.set(id, occurrence);
      chunk.id = `${id}#${occurrence}`;
    }
  }
  return chunks;
}

function selectReadChunks(
  entryId: string,
  chunks: ReadChunk[],
  headings: string[]
): {chunks: ReadChunk[]} | {error: ReadFailure['error']} {
  if (headings.length === 0) {
    return {chunks};
  }

  const selected = new Set<ReadChunk>();
  for (const heading of headings) {
    const needle = heading.toLowerCase();
    const byId = chunks.find(chunk => chunk.id.toLowerCase() === needle);
    const matches = byId ? [byId] : chunks.filter(chunk => chunk.heading.toLowerCase() === needle);
    if (matches.length === 0) {
      const suggestions = chunks
        .map(chunk => ({id: chunk.id, distance: editDistance(needle, chunk.heading.toLowerCase())}))
        .filter(({distance}) => distance <= 3)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5)
        .map(({id}) => id);
      return {
        error: {
          code: 'ERR_SECTION_NOT_FOUND',
          message: `Section '${heading}' was not found on '${entryId}' with the selected filters. Use --list-sections to see available headings.`,
          suggestions
        }
      };
    }
    if (matches.length > 1) {
      return {
        error: {
          code: 'ERR_AMBIGUOUS_SECTION',
          message: `Multiple sections match '${heading}' on '${entryId}'. Use one of their section IDs.`,
          suggestions: matches.map(chunk => chunk.id)
        }
      };
    }
    selected.add(matches[0]);
  }
  return {chunks: chunks.filter(chunk => selected.has(chunk))};
}

function renderReadEntry(entry: CatalogEntryIR, chunks: ReadChunk[]): string {
  const lines = [
    `# ${entry.title} (\`${entry.id}\`)`,
    `Package: \`${entry.packageName}@${entry.packageVersion}\``
  ];
  if (entry.summary) {
    lines.push('', entry.summary);
  }
  if (entry.imports.length > 0) {
    lines.push('', '## Imports', '```tsx', ...entry.imports, '```');
  }
  if (entry.compositionRules.length > 0) {
    lines.push('', '## Implementation Rules', ...entry.compositionRules.map(rule => `- ${rule}`));
  }
  let hasApiHeading = false;
  for (const chunk of chunks) {
    if ('section' in chunk) {
      const {section} = chunk;
      const {level} = chunk;
      lines.push('', `${'#'.repeat(level)} ${section.heading}`, '', section.markdown);
      if (level === 2) {
        hasApiHeading = isApiHeading(section);
      }
    } else {
      if (!hasApiHeading) {
        lines.push('', '## API');
        hasApiHeading = true;
      }
      lines.push('', renderDetailedExportMarkdown(chunk.apiExport, 3));
    }
  }
  return lines.join('\n').trim() + '\n';
}

function renderReadSectionIndex(entry: CatalogEntryIR, sections: ReadSectionRef[]): string {
  const outline = sections.length
    ? sections
        .map(({id, heading, level}) => `${'  '.repeat(level - 2)}- ${heading} (\`${id}\`)`)
        .join('\n')
    : '_No matching sections._';
  return renderReadEntry(entry, []) + '\n' + outline + '\n';
}

function getChunkPartCount(chunk: ReadChunk): number {
  if ('section' in chunk) {
    return chunk.section.markdown.split('\n').length;
  }
  const {apiExport} = chunk;
  return apiExport.props.length + apiExport.events.length + apiExport.renderProps.length;
}

function sliceRange<T>(items: T[], start: number, end: number, baseOffset: number): T[] {
  const localStart = Math.max(0, start - baseOffset);
  const localEnd = Math.min(items.length, end - baseOffset);
  return localStart < localEnd ? items.slice(localStart, localEnd) : [];
}

function findUnclosedFence(lines: string[]): string | null {
  let openFence: string | null = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      openFence = openFence ? null : trimmed;
    }
  }
  return openFence;
}

function sliceReadChunk(chunk: ReadChunk, partStart: number, partEnd: number): ReadChunk {
  if ('section' in chunk) {
    const lines = chunk.section.markdown.split('\n');
    const sliceLines = lines.slice(partStart, partEnd);
    const prefixFence = partStart > 0 ? findUnclosedFence(lines.slice(0, partStart)) : null;
    const outputLines = prefixFence ? [prefixFence, ...sliceLines] : [...sliceLines];
    if (partEnd < lines.length && findUnclosedFence(outputLines)) {
      outputLines.push('```');
    }
    return {
      ...chunk,
      section: {
        ...chunk.section,
        markdown: outputLines.join('\n')
      }
    };
  }
  const exp = chunk.apiExport;
  const propsLen = exp.props.length;
  const eventsLen = exp.events.length;
  const slicedExport: ExportApiIR = {
    ...exp,
    description: partStart === 0 ? exp.description : undefined,
    constraints: partStart === 0 ? exp.constraints : [],
    callSignatures: partStart === 0 ? exp.callSignatures : [],
    typeText: partStart === 0 ? exp.typeText : undefined,
    props: sliceRange(exp.props, partStart, partEnd, 0),
    events: sliceRange(exp.events, partStart, partEnd, propsLen),
    renderProps: sliceRange(exp.renderProps, partStart, partEnd, propsLen + eventsLen)
  };
  return {
    ...chunk,
    apiExport: slicedExport
  };
}

function parseReadCursor(
  raw: string | undefined,
  cursorKey: string,
  chunks: ReadChunk[],
  listSections: boolean
): {start: number; startPart: number} | null {
  if (raw === undefined) {
    return {start: 0, startPart: 0};
  }
  const match = /^(\d+)(?:_(\d+))?\.([a-f0-9]+)$/.exec(raw);
  if (!match || match[3] !== cursorKey) {
    return null;
  }
  const start = Number(match[1]);
  const startPart = match[2] !== undefined ? Number(match[2]) : 0;
  if (!Number.isSafeInteger(start) || start < 0 || start >= chunks.length) {
    return null;
  }
  if (!Number.isSafeInteger(startPart) || startPart < 0) {
    return null;
  }
  if (startPart > 0 && (listSections || startPart >= getChunkPartCount(chunks[start]))) {
    return null;
  }
  return {start, startPart};
}

function filterExportDeprecatedMembers(exp: ExportApiIR, includeDeprecated: boolean): ExportApiIR {
  if (includeDeprecated) {
    return exp;
  }
  return {
    ...exp,
    props: exp.props.filter(p => !p.deprecated),
    events: exp.events.filter(e => !e.deprecated),
    renderProps: exp.renderProps.filter(rp => !rp.deprecated)
  };
}

type ReadSuccess = Extract<ReadItemResult, {ok: true}>;

interface ReadPage {
  start: number;
  startPart: number;
  end: number;
  totalFirstChunkParts: number;
  allowSubChunking: boolean;
  project: (end: number) => ReadSuccess;
  projectSlice: (partEnd: number) => ReadSuccess;
}

function fitOversizedFirstChunk(
  result: ReadDocsResult,
  pageIndex: number,
  page: ReadPage,
  entryLimit: number,
  outputTokens: () => number
): {fitted: boolean; minSliceTokens: number} {
  if (!page.allowSubChunking || page.totalFirstChunkParts <= page.startPart + 1) {
    return {fitted: false, minSliceTokens: 0};
  }
  let lo = page.startPart + 1;
  let hi = page.totalFirstChunkParts - 1;
  let best = -1;
  let minSliceTokens = 0;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    result.results[pageIndex] = page.projectSlice(mid);
    const tokens = outputTokens();
    if (mid === page.startPart + 1) {
      minSliceTokens = tokens;
    }
    if (tokens <= entryLimit) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  if (best !== -1) {
    result.results[pageIndex] = page.projectSlice(best);
    return {fitted: true, minSliceTokens};
  }
  if (minSliceTokens === 0) {
    result.results[pageIndex] = page.projectSlice(page.startPart + 1);
    minSliceTokens = outputTokens();
  }
  return {fitted: false, minSliceTokens};
}

function boundReadResult(
  result: ReadDocsResult,
  pages: Map<number, ReadPage>,
  maxTokens: number,
  output?: ReadOutputOptions
): void {
  const outputTokens = () =>
    estimateTokens(
      output ? formatReadOutput(result, output) : JSON.stringify(result, null, 2) + '\n'
    );
  if (outputTokens() <= maxTokens) {
    return;
  }

  const budgetError = (required: number, subject: string) =>
    new AgentDocsError(
      'ERR_INVALID_ARGS',
      `The token budget ${maxTokens} is too small for ${subject} (requires at least ${required}). Increase --max-tokens or request fewer entries.`,
      EXIT_CODES.INVALID_ARGS,
      {details: {maxTokens, minimumTokens: required}}
    );

  for (const [i, page] of pages) {
    result.results[i] = page.project(page.start);
  }
  const minimumTokens = outputTokens();
  if (minimumTokens > maxTokens) {
    throw budgetError(minimumTokens, 'the response metadata');
  }

  let remainingPages = pages.size;
  for (const [i, page] of pages) {
    const entryLimit = outputTokens() + Math.floor((maxTokens - outputTokens()) / remainingPages--);
    let current = result.results[i];
    for (let end = page.start + 1; end <= page.end; end++) {
      const next = page.project(end);
      result.results[i] = next;
      const tokens = outputTokens();
      if (tokens <= entryLimit) {
        current = next;
        continue;
      }
      if (end === page.start + 1) {
        const sliced = fitOversizedFirstChunk(result, i, page, entryLimit, outputTokens);
        if (sliced.fitted) {
          break;
        }
        result.results[i] = current;
        if (pages.size === 1) {
          throw budgetError(sliced.minSliceTokens || tokens, 'the next section or API export');
        }
        break;
      }
      result.results[i] = current;
      break;
    }
  }
}

export interface ReadDocsOptions extends CommonQueryOptions {
  ids: string[];
  sections?: SectionFilter[];
  listSections?: boolean;
  sectionHeadings?: string[];
  includeDeprecated?: boolean;
  maxTokens?: number;
  cursor?: string;
  output?: ReadOutputOptions;
  cliCommandPrefix?: string;
}

/**
 * Batched multi-document read across one or more resolved per-package snapshots.
 * Returns per-entry `{ok: true | false}` results so one unknown ID never discards valid siblings.
 */
export async function readDocs(options: ReadDocsOptions): Promise<ReadDocsResult> {
  const ids = (options.ids || []).map(s => s.trim()).filter(Boolean);
  if (ids.length === 0) {
    throw new AgentDocsError(
      'ERR_INVALID_ARGS',
      'Provide at least one document ID (for example: s2:ComboBox or rac:Dialog).',
      EXIT_CODES.INVALID_ARGS
    );
  }

  if (options.cursor !== undefined && (ids.length !== 1 || !options.cursor)) {
    throw new AgentDocsError(
      'ERR_INVALID_ARGS',
      'Provide a non-empty cursor with exactly one document ID.',
      EXIT_CODES.INVALID_ARGS
    );
  }
  if (
    options.maxTokens !== undefined &&
    (!Number.isSafeInteger(options.maxTokens) || options.maxTokens < 1)
  ) {
    throw new AgentDocsError(
      'ERR_INVALID_ARGS',
      'maxTokens must be a positive safe integer.',
      EXIT_CODES.INVALID_ARGS
    );
  }

  const headings = [...new Set((options.sectionHeadings ?? []).map(heading => heading.trim()))];
  if (headings.includes('') || (options.listSections && headings.length > 0)) {
    throw new AgentDocsError(
      'ERR_INVALID_ARGS',
      'Provide non-empty section headings or IDs. Listing sections and reading specific headings are separate operations.',
      EXIT_CODES.INVALID_ARGS
    );
  }

  const index = await loadSnapshotIndex({
    cacheDir: options.cacheDir,
    snapshotSource: options.snapshotSource,
    offline: options.offline
  });
  const resolution = await resolveWorkspace(options);
  const defaultLibrary = options.defaultLibrary || 's2';
  const cliPrefix =
    options.cliCommandPrefix || (defaultLibrary === 'rac' ? 'react-aria' : 'spectrum');
  const followUpFlags = formatFollowUpFlags(options, resolution);
  const sections =
    options.sections?.length && !options.sections.includes('all')
      ? [...new Set(options.sections)].sort()
      : undefined;
  const continuationFlags = [
    ...(sections ? ['--sections', sections.join(',')] : []),
    ...(options.listSections ? ['--list-sections'] : []),
    ...headings.flatMap(heading => ['--section', quoteShellArg(heading)]),
    ...(options.includeDeprecated ? ['--include-deprecated'] : []),
    ...(options.maxTokens === undefined ? [] : ['--max-tokens', String(options.maxTokens)]),
    ...(options.output?.format === 'json' ? ['--json'] : []),
    ...(options.output?.jsonContent === 'markdown' ? ['--json-content', 'markdown'] : []),
    ...(options.output?.includeResolution ? ['--include-resolution'] : []),
    followUpFlags
  ].join(' ');

  const sliceCache = new Map<string, string>();
  const searchCache = new Map<string, SearchIndexRecord[]>();
  const getSearchRecords = (sliceDir: string) => {
    let records = searchCache.get(sliceDir);
    if (!records) {
      records = readSliceSearchIndex(sliceDir);
      searchCache.set(sliceDir, records);
    }
    return records;
  };
  const getSliceDir = async (prov: ResolvedPackageProvenance) => {
    const key = `${prov.packageName}@${prov.packageVersion}`;
    if (!sliceCache.has(key)) {
      sliceCache.set(key, await openSliceForProvenance(prov, index, options));
    }
    return sliceCache.get(key)!;
  };

  const results: ReadItemResult[] = [];
  const usedSnapshots = new Set<string>();
  const pages = new Map<number, ReadPage>();
  const relevantPackages = new Set<string>();
  for (const requestedId of ids) {
    const {library, slug} = parseQualifiedId(requestedId, defaultLibrary, resolution);
    if (!isSafeEntrySlug(slug)) {
      results.push({
        requestedId,
        ok: false,
        error: {
          code: 'ERR_INVALID_ID',
          message: `Document ID '${requestedId}' is not a valid documentation ID.`,
          suggestions: []
        }
      });
      continue;
    }
    const candidatePkgs = candidatePackagesForLookup(library, slug);

    let matchedData: {
      entry: CatalogEntryIR;
      prov: ResolvedPackageProvenance;
    } | null = null;
    const slugLower = slug.toLowerCase();
    const suggestionRecords = new Set<SearchIndexRecord>();

    for (const pkgName of candidatePkgs) {
      const prov = resolution.packages[pkgName];
      if (!prov) {
        continue;
      }
      const sliceDir = await getSliceDir(prov);
      const direct = readSliceEntryBySlug(sliceDir, library, slug);
      if (direct) {
        matchedData = {entry: direct.entry, prov};
        break;
      }

      // Case-insensitive exact ID/slug/title lookup via search index (without fuzzy hallucination!)
      const searchRecords = getSearchRecords(sliceDir);
      const exactRecord = searchRecords.find(
        r =>
          r.library === library &&
          (r.slug.toLowerCase() === slugLower || r.title.toLowerCase() === slugLower)
      );
      if (exactRecord) {
        const byExact = readSliceEntryBySlug(sliceDir, exactRecord.library, exactRecord.slug);
        if (byExact) {
          matchedData = {entry: byExact.entry, prov};
          break;
        }
      }

      for (const record of searchRecords) {
        if (record.library === library) {
          suggestionRecords.add(record);
        }
      }
    }

    // Fallback: if unqualified slug (e.g. `CalendarDate`) didn't match defaultLibrary, check other resolved packages for an exact title/slug match
    if (!matchedData && !requestedId.includes(':')) {
      for (const prov of Object.values(resolution.packages)) {
        const sliceDir = await getSliceDir(prov);
        const records = getSearchRecords(sliceDir);
        const exactRecord = records.find(
          r => r.slug.toLowerCase() === slugLower || r.title.toLowerCase() === slugLower
        );
        const found = exactRecord
          ? readSliceEntryBySlug(sliceDir, exactRecord.library, exactRecord.slug)
          : null;
        if (found) {
          matchedData = {entry: found.entry, prov};
          break;
        }
        for (const record of records) {
          suggestionRecords.add(record);
        }
      }
    }

    if (!matchedData) {
      for (const pkg of candidatePkgs) {
        relevantPackages.add(pkg);
      }
      const primaryPkg = candidatePkgs[0];
      const prov = resolution.packages[primaryPkg];
      const coverageWarning =
        library === 'react-stately' ? getStatelyCoverageWarning(resolution) : undefined;
      const versionNote = prov
        ? ` in ${prov.packageName}@${prov.packageVersion} (snapshot ${prov.snapshotId})`
        : ` (package '${primaryPkg}' is not resolved in this workspace)`;
      results.push({
        requestedId,
        ok: false,
        error: {
          code: coverageWarning ? 'ERR_SNAPSHOT_NOT_FOUND' : 'ERR_ENTRY_NOT_FOUND',
          message:
            coverageWarning?.message ?? `Document '${requestedId}' was not found${versionNote}.`,
          suggestions: suggestIds(suggestionRecords, slugLower, library)
        }
      });
      continue;
    }

    const {entry: rawEntry, prov} = matchedData;
    const includeDeprecated = Boolean(options.includeDeprecated);
    const fullEntry: CatalogEntryIR = {
      ...rawEntry,
      exports: rawEntry.exports.map(exp => filterExportDeprecatedMembers(exp, includeDeprecated))
    };
    usedSnapshots.add(prov.snapshotId);
    relevantPackages.add(prov.packageName);
    const allChunks = getReadChunks(fullEntry);
    const categoryChunks = sections
      ? allChunks.filter(chunk => sections.includes(chunk.category))
      : allChunks;
    const selection = selectReadChunks(fullEntry.id, categoryChunks, headings);
    if ('error' in selection) {
      results.push({requestedId, ok: false, error: selection.error});
      continue;
    }
    const {chunks} = selection;
    const selectedIds = new Set(chunks.map(chunk => chunk.id));
    const filteredIds = allChunks.map(chunk => chunk.id).filter(id => !selectedIds.has(id));
    const cursorScope = [
      fullEntry.id,
      prov.snapshotId,
      prov.sliceSha256,
      sections,
      ...(includeDeprecated ? ['deprecated'] : [])
    ];
    const cursorKey = createHash('sha256')
      .update(
        JSON.stringify(
          options.listSections || headings.length
            ? [...cursorScope, Boolean(options.listSections), [...selectedIds]]
            : cursorScope
        )
      )
      .digest('hex')
      .slice(0, 20);
    const parsedCursor = parseReadCursor(
      options.cursor,
      cursorKey,
      chunks,
      Boolean(options.listSections)
    );
    if (!parsedCursor) {
      throw new AgentDocsError(
        'ERR_INVALID_ARGS',
        'This cursor does not match the document, snapshot, or section selection. Start a new read or use the original options.',
        EXIT_CODES.INVALID_ARGS
      );
    }
    const {start, startPart} = parsedCursor;
    const firstChunkParts = start < chunks.length ? getChunkPartCount(chunks[start]) : 0;

    const header =
      options.cursor !== undefined || options.listSections || headings.length > 0
        ? {...fullEntry, summary: '', imports: [], compositionRules: []}
        : {
            ...fullEntry,
            compositionRules:
              !sections || sections.includes('usage') || sections.includes('accessibility')
                ? fullEntry.compositionRules
                : []
          };
    const buildReadSuccess = (
      selected: ReadChunk[],
      omittedAfterEnd: string[],
      truncated: boolean,
      nextCursor: string | undefined
    ): ReadSuccess => {
      const sectionIndex = options.listSections
        ? selected.map(({id, heading, category, level}) => ({id, heading, category, level}))
        : undefined;
      const pageEntry = {
        ...header,
        sections: sectionIndex
          ? []
          : selected.flatMap(chunk =>
              'section' in chunk ? [{...chunk.section, id: chunk.id}] : []
            ),
        exports: sectionIndex
          ? []
          : selected.flatMap(chunk => ('apiExport' in chunk ? [chunk.apiExport] : []))
      };
      return {
        requestedId,
        ok: true,
        id: fullEntry.id,
        provenance: {
          packageName: prov.packageName,
          packageVersion: prov.packageVersion,
          snapshotId: prov.snapshotId,
          exactMatch: prov.exactMatch,
          sourceUrl: fullEntry.sourceUrl
        },
        entry: pageEntry,
        markdown: sectionIndex
          ? renderReadSectionIndex(pageEntry, sectionIndex)
          : renderReadEntry(pageEntry, selected),
        sectionIndex,
        includedSections: [...new Set(selected.map(chunk => chunk.id))],
        omittedSections: [...new Set([...filteredIds, ...omittedAfterEnd])],
        truncated,
        nextCursor,
        continueCommand:
          nextCursor && options.output?.continuation !== 'cursor'
            ? `${cliPrefix} read ${quoteShellArg(fullEntry.id)} --cursor ${nextCursor} ${continuationFlags}`
            : undefined
      };
    };

    const project = (end: number): ReadSuccess => {
      let selected: ReadChunk[];
      if (end <= start) {
        selected = [];
      } else if (startPart > 0) {
        selected = [
          sliceReadChunk(chunks[start], startPart, firstChunkParts),
          ...chunks.slice(start + 1, end)
        ];
      } else {
        selected = chunks.slice(start, end);
      }
      const truncated = end < chunks.length;
      const nextCursor = truncated
        ? end === start && startPart > 0
          ? `${start}_${startPart}.${cursorKey}`
          : `${end}.${cursorKey}`
        : undefined;
      return buildReadSuccess(
        selected,
        chunks.slice(end).map(chunk => chunk.id),
        truncated,
        nextCursor
      );
    };

    const projectSlice = (partEnd: number): ReadSuccess => {
      const selected = [sliceReadChunk(chunks[start], startPart, partEnd)];
      return buildReadSuccess(
        selected,
        chunks.slice(start + 1).map(chunk => chunk.id),
        true,
        `${start}_${partEnd}.${cursorKey}`
      );
    };

    if (start < chunks.length) {
      pages.set(results.length, {
        start,
        startPart,
        end: chunks.length,
        totalFirstChunkParts: firstChunkParts,
        allowSubChunking: !options.listSections,
        project,
        projectSlice
      });
    }
    results.push(project(chunks.length));
  }

  const warnings = warningsForPackages(resolution, relevantPackages);
  const okCount = results.filter(r => r.ok).length;
  const failCount = results.length - okCount;
  if (okCount > 0 && failCount > 0) {
    warnings.push({
      code: 'WARN_PARTIAL_BATCH_MISS',
      message: `${failCount} of ${results.length} requested document IDs could not be resolved; ${okCount} succeeded.`
    });
  }

  const result: ReadDocsResult = {
    apiVersion: API_VERSION,
    snapshots: collectEnvelopeSnapshots(index, usedSnapshots),
    resolution,
    warnings,
    results
  };
  if (options.maxTokens !== undefined) {
    boundReadResult(result, pages, options.maxTokens, options.output);
  }
  return result;
}

export interface QueryApiOptions extends CommonQueryOptions {
  id: string;
  exportName?: string;
  propFilter?: string;
  eventsOnly?: boolean;
  renderPropsOnly?: boolean;
  includeDeprecated?: boolean;
}

function formatMemberDescription(member: {
  description: string;
  deprecated?: boolean;
  deprecationMessage?: string;
}): string {
  const parts: string[] = [];
  if (member.deprecated) {
    parts.push(
      member.deprecationMessage ? `*(deprecated: ${member.deprecationMessage})*` : '*(deprecated)*'
    );
  }
  if (member.description) {
    parts.push(member.description);
  }
  return (parts.join(' ') || '—').replace(/\|/g, '\\|');
}

function renderDetailedExportMarkdown(exp: ExportApiIR, headingLevel = 2): string {
  const lines: string[] = [];
  const heading = '#'.repeat(headingLevel);
  const genSuffix =
    exp.typeParameters.length > 0
      ? `<${exp.typeParameters.map(g => `${g.name}${g.constraint ? ` extends ${g.constraint}` : ''}${g.defaultType ? ` = ${g.defaultType}` : ''}`).join(', ')}>`
      : '';
  lines.push(`${heading} \`${exp.name}${genSuffix}\` (${exp.exportKind})`);
  if (exp.description) {
    lines.push(exp.description);
  }
  if (exp.constraints && exp.constraints.length > 0) {
    lines.push('');
    lines.push('**Constraints:**');
    for (const c of exp.constraints) {
      lines.push(`- ${c.description}`);
    }
  }
  if (exp.callSignatures.length > 0) {
    lines.push('');
    lines.push('```ts');
    for (const sig of exp.callSignatures) {
      lines.push(sig.signature);
    }
    lines.push('```');
  }
  if (exp.typeText) {
    lines.push('');
    lines.push('```ts');
    lines.push(`type ${exp.name} = ${exp.typeText}`);
    lines.push('```');
  }

  const props = exp.props;
  if (props.length > 0) {
    lines.push('');
    if (exp.exportKind === 'class') {
      lines.push(`${heading}# Properties & Methods`);
      lines.push('| Member | Type | Default | Inherited From | Description |');
    } else {
      lines.push(`${heading}# Props`);
      lines.push('| Prop | Type | Default | Inherited From | Description |');
    }
    lines.push('|---|---|---|---|---|');
    for (const p of props) {
      const req = p.required ? '**required**' : p.defaultValue || '—';
      lines.push(
        `| \`${p.name}\` | \`${p.type.replace(/\|/g, '\\|')}\` | ${req.replace(/\|/g, '\\|')} | ${p.inheritedFrom ? `\`${p.inheritedFrom}\`` : '—'} | ${formatMemberDescription(p)} |`
      );
    }
  }
  const events = exp.events;
  if (events.length > 0) {
    lines.push('');
    lines.push(`${heading}# Events`);
    lines.push('| Event | Signature | Description |');
    lines.push('|---|---|---|');
    for (const ev of events) {
      lines.push(
        `| \`${ev.name}\` | \`${ev.type.replace(/\|/g, '\\|')}\` | ${formatMemberDescription(ev)} |`
      );
    }
  }
  const rps = exp.renderProps;
  if (rps.length > 0) {
    lines.push('');
    lines.push(`${heading}# Render Props & Data Attributes`);
    lines.push('| State | Type | CSS Selector | Description |');
    lines.push('|---|---|---|---|');
    for (const rp of rps) {
      lines.push(
        `| \`${rp.name}\` | \`${rp.type.replace(/\|/g, '\\|')}\` | ${rp.selector ? `\`${rp.selector}\`` : '—'} | ${formatMemberDescription(rp)} |`
      );
    }
  }
  return lines.join('\n');
}

function editDistance(a: string, b: string): number {
  let previousPrevious: number[] | undefined;
  let previous = Array.from({length: b.length + 1}, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      if (previousPrevious && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        current[j] = Math.min(current[j], previousPrevious[j - 2] + 1);
      }
    }
    previousPrevious = previous;
    previous = current;
  }
  return previous[b.length];
}

function scoreIdSuggestion(record: SearchIndexRecord, query: string): number {
  if (record.exports.some(name => name.toLowerCase() === query)) {
    return 0;
  }
  const title = record.title.toLowerCase();
  const slug = record.slug.toLowerCase();
  const maxDistance = query.length >= 6 ? 2 : 1;
  let score = Infinity;
  for (const name of new Set([title, slug, path.posix.basename(slug)])) {
    if (query.length >= 4 && Math.abs(name.length - query.length) <= maxDistance) {
      const distance = editDistance(query, name);
      if (distance <= maxDistance) {
        score = Math.min(score, distance);
      }
    }
    if (name.includes(query) || (name.length >= 4 && query.includes(name))) {
      score = Math.min(score, 3);
    }
  }
  return score;
}

function suggestIds(
  records: Iterable<SearchIndexRecord>,
  query: string,
  preferredLibrary: LibraryId
): string[] {
  const ranked = [...records].map(record => ({
    id: record.id,
    score: scoreIdSuggestion(record, query),
    preferred: record.library === preferredLibrary
  }));
  ranked.sort(
    (a, b) =>
      a.score - b.score || Number(b.preferred) - Number(a.preferred) || a.id.localeCompare(b.id)
  );
  const ids = new Set(ranked.filter(item => Number.isFinite(item.score)).map(item => item.id));
  return [...ids].slice(0, 5);
}

async function findApiExport(
  options: QueryApiOptions,
  resolution: ResolutionState
): Promise<{id: string; exportName: string} | undefined> {
  const {slug, library} = parseQualifiedId(options.id, options.defaultLibrary || 's2', resolution);
  const qualified = options.id.includes(':');
  const query = slug.toLowerCase();
  const index = await loadSnapshotIndex(options);
  const matches = new Map<string, string>();
  const packages = qualified
    ? candidatePackagesForLookup(library, slug)
    : Object.keys(resolution.packages);
  for (const packageName of packages) {
    const prov = resolution.packages[packageName];
    if (!prov) {
      continue;
    }
    const sliceDir = await openSliceForProvenance(prov, index, options);
    for (const record of readSliceSearchIndex(sliceDir)) {
      if (!qualified || record.library === library) {
        const exportName = record.exports.find(name => name.toLowerCase() === query);
        if (exportName) {
          matches.set(record.id, exportName);
        }
      }
    }
  }
  if (matches.size > 1) {
    throw new AgentDocsError(
      'ERR_AMBIGUOUS_EXPORT',
      `Export '${options.id}' appears in more than one document. Choose a document ID with --export ${slug}.`,
      EXIT_CODES.NOT_FOUND,
      {suggestions: [...matches.keys()].sort()}
    );
  }
  const match = matches.entries().next().value;
  return match && {id: match[0], exportName: match[1]};
}

export async function queryApi(options: QueryApiOptions): Promise<ApiDocsResult> {
  const includeDeprecated = Boolean(options.includeDeprecated);
  let readRes = await readDocs({
    ...options,
    ids: [options.id],
    sections: ['api'],
    includeDeprecated: true
  });
  let item = readRes.results[0];
  let exportName = options.exportName;
  let resolvedByExport = false;
  if (item && !item.ok && item.error.code === 'ERR_ENTRY_NOT_FOUND') {
    const match = await findApiExport(options, readRes.resolution);
    if (match) {
      resolvedByExport = true;
      exportName ??= match.exportName;
      readRes = await readDocs({
        ...options,
        resolution: readRes.resolution,
        ids: [match.id],
        sections: ['api'],
        includeDeprecated: true
      });
      item = readRes.results[0];
    }
  }
  if (!item || !item.ok) {
    throw new AgentDocsError(
      item?.error.code || 'ERR_ENTRY_NOT_FOUND',
      item?.error.message || `Component '${options.id}' not found.`,
      EXIT_CODES.NOT_FOUND,
      {suggestions: item && !item.ok ? item.error.suggestions : undefined}
    );
  }

  let rawExportsList = item.entry.exports || [];
  if (exportName) {
    const needle = exportName.toLowerCase();
    rawExportsList = rawExportsList.filter(e => e.name.toLowerCase() === needle);
    if (rawExportsList.length === 0) {
      const available = (item.entry.exports || []).map(e => e.name);
      throw new AgentDocsError(
        'ERR_ENTRY_NOT_FOUND',
        `Export '${exportName}' not found on '${item.id}'. Available exports: ${available.join(', ') || 'none'}.`,
        EXIT_CODES.NOT_FOUND,
        {suggestions: available}
      );
    }
  }
  const hiddenDeprecatedNames = includeDeprecated
    ? new Set<string>()
    : new Set(
        rawExportsList.flatMap(exp =>
          [...exp.props, ...exp.events, ...exp.renderProps]
            .filter(m => m.deprecated)
            .map(m => m.name.toLowerCase())
        )
      );
  let exportsList = rawExportsList.map(exp =>
    filterExportDeprecatedMembers(exp, includeDeprecated)
  );

  const uniqueRawFilters: Array<{filter: string; needle: string}> = [];
  const seenNeedles = new Set<string>();
  for (const raw of (options.propFilter || '').split(',')) {
    const filter = raw.trim();
    if (!filter) {
      continue;
    }
    const needle = filter.toLowerCase();
    if (!seenNeedles.has(needle)) {
      seenNeedles.add(needle);
      uniqueRawFilters.push({filter, needle});
    }
  }
  const propNeedles = uniqueRawFilters.map(item => item.needle);
  const filterByKind = Boolean(options.eventsOnly || options.renderPropsOnly);
  const visibleExports = exportsList.map(exp => ({
    ...exp,
    props: filterByKind ? [] : exp.props,
    events: !filterByKind || options.eventsOnly ? exp.events : [],
    renderProps: !filterByKind || options.renderPropsOnly ? exp.renderProps : []
  }));

  // Report every filter that matched nothing, so a partly wrong list is never silently narrowed.
  const visibleMembers = visibleExports.flatMap(exp => [
    ...exp.props,
    ...exp.events,
    ...exp.renderProps
  ]);
  // Prefer member-name matches per needle; fall back to description matching only if no name matched.
  const nameMatchedNeedles = new Set(
    propNeedles.filter(needle => visibleMembers.some(p => p.name.toLowerCase().includes(needle)))
  );
  const memberMatchesNeedle = (member: {name: string; description: string}, needle: string) => {
    if (member.name.toLowerCase().includes(needle)) {
      return true;
    }
    return !nameMatchedNeedles.has(needle) && member.description.toLowerCase().includes(needle);
  };
  const filterMembers = <T extends {name: string; description: string}>(items: T[]): T[] =>
    propNeedles.length > 0
      ? items.filter(p => propNeedles.some(needle => memberMatchesNeedle(p, needle)))
      : items;
  exportsList = visibleExports.map(exp => ({
    ...exp,
    props: filterMembers(exp.props),
    events: filterMembers(exp.events),
    renderProps: filterMembers(exp.renderProps)
  }));
  if (propNeedles.length > 0 || filterByKind) {
    exportsList = exportsList.filter(
      exp => exp.props.length > 0 || exp.events.length > 0 || exp.renderProps.length > 0
    );
  }

  const memberNames = [...new Set(visibleMembers.map(p => p.name))];
  const suggestMembers = (needle: string): string[] =>
    memberNames
      .map(name => ({name, distance: editDistance(needle, name.toLowerCase())}))
      .filter(({distance}) => distance <= 3)
      .sort((a, b) => a.distance - b.distance || a.name.localeCompare(b.name))
      .slice(0, 5)
      .map(({name}) => name);
  const unmatchedFilters = uniqueRawFilters
    .filter(({needle}) => !visibleMembers.some(p => memberMatchesNeedle(p, needle)))
    .map(({filter, needle}) => ({
      filter,
      matchesHiddenDeprecated: [...hiddenDeprecatedNames].some(name => name.includes(needle)),
      suggestions: suggestMembers(needle)
    }));
  const apiTarget = exportName ? `'${exportName}' in '${item.id}'` : `'${item.id}'`;
  const describeUnmatched = ({
    filter,
    matchesHiddenDeprecated,
    suggestions
  }: {
    filter: string;
    matchesHiddenDeprecated: boolean;
    suggestions: string[];
  }) => {
    const hints: string[] = [];
    if (matchesHiddenDeprecated) {
      hints.push('matches a deprecated member — pass --include-deprecated to view it');
    }
    if (suggestions.length > 0) {
      hints.push(`did you mean ${suggestions.map(s => `\`${s}\``).join(', ')}?`);
    }
    return `'${filter}'${hints.length > 0 ? ` (${hints.join('; ')})` : ''}`;
  };

  if (propNeedles.length > 0 && unmatchedFilters.length === propNeedles.length) {
    const deprecatedHint = unmatchedFilters.some(u => u.matchesHiddenDeprecated)
      ? ' Re-run with --include-deprecated to include @deprecated members.'
      : '';
    throw new AgentDocsError(
      'ERR_PROP_NOT_FOUND',
      `Prop filter ${unmatchedFilters.map(u => `'${u.filter}'`).join(', ')} not found on ${apiTarget}.${deprecatedHint}`,
      EXIT_CODES.NOT_FOUND,
      {suggestions: [...new Set(unmatchedFilters.flatMap(u => u.suggestions))].slice(0, 5)}
    );
  }
  const apiWarnings: DocWarning[] = unmatchedFilters.map(u => ({
    code: 'WARN_PROP_NOT_FOUND',
    message: `No prop, event, or render prop matching ${describeUnmatched(u)} exists on ${apiTarget}.`,
    packageName: item.provenance.packageName,
    details: {filter: u.filter, suggestions: u.suggestions}
  }));

  let imports = item.entry.imports;
  if (resolvedByExport && exportName) {
    const focusedImports = imports.flatMap(statement => {
      const match = /^(import\s+\{)([^}]+)(\}\s+from\s+.+)$/.exec(statement);
      const binding = match?.[2]
        .split(',')
        .map(specifier => specifier.trim())
        .find(specifier => specifier.replace(/^type\s+/, '').split(/\s+/)[0] === exportName);
      return match && binding ? [`${match[1]}${binding}${match[3]}`] : [];
    });
    if (focusedImports.length > 0) {
      imports = focusedImports;
    }
  }

  const mdLines: string[] = [
    `# API Reference: ${item.entry.title} (\`${item.id}\`)`,
    `Package: \`${item.provenance.packageName}@${item.provenance.packageVersion}\` · Snapshot: \`${item.provenance.snapshotId}\``
  ];
  if (imports.length > 0) {
    mdLines.push('');
    mdLines.push('```tsx');
    for (const imp of imports) {
      mdLines.push(imp);
    }
    mdLines.push('```');
  }
  if (apiWarnings.length > 0) {
    mdLines.push('');
    for (const warning of apiWarnings) {
      mdLines.push(`> [${warning.code}] ${warning.message}`);
    }
  }
  if (exportsList.length === 0 && filterByKind) {
    mdLines.push('');
    const kindLabel =
      options.eventsOnly && options.renderPropsOnly
        ? 'events or render props'
        : options.eventsOnly
          ? 'events'
          : 'render props';
    mdLines.push(`_No matching ${kindLabel} found on ${apiTarget}._`);
  }
  for (const exp of exportsList) {
    mdLines.push('');
    mdLines.push(renderDetailedExportMarkdown(exp));
  }

  return {
    apiVersion: API_VERSION,
    requestedId: options.id,
    resolvedId: item.id,
    provenance: item.provenance,
    snapshots: readRes.snapshots,
    resolution: readRes.resolution,
    warnings: [...readRes.warnings, ...apiWarnings],
    imports,
    exports: exportsList,
    markdown: mdLines.join('\n').trim() + '\n'
  };
}

export interface QueryTokensOptions extends CommonQueryOptions {
  query?: string;
  propertyFilter?: string;
}

export async function queryTokens(options: QueryTokensOptions = {}): Promise<TokensDocsResult> {
  const index = await loadSnapshotIndex({
    cacheDir: options.cacheDir,
    snapshotSource: options.snapshotSource,
    offline: options.offline
  });
  const resolution = await resolveWorkspace({...options, defaultLibrary: 's2'});
  const s2Prov = resolution.packages['@react-spectrum/s2'];
  if (!s2Prov) {
    throw new AgentDocsError(
      'ERR_SNAPSHOT_NOT_FOUND',
      `'@react-spectrum/s2' is not installed in '${resolution.cwd}'. Pass --version @react-spectrum/s2@latest to inspect S2 tokens outside an S2 project.`,
      EXIT_CODES.NOT_FOUND
    );
  }

  const sliceDir = await openSliceForProvenance(s2Prov, index, options);
  const assets = readSliceS2Assets(sliceDir);
  if (!assets) {
    throw new AgentDocsError(
      'ERR_SNAPSHOT_NOT_FOUND',
      `S2 token metadata is not available in snapshot '${s2Prov.snapshotId}'.`,
      EXIT_CODES.NOT_FOUND
    );
  }

  const propNeedle = options.propertyFilter?.toLowerCase() || null;
  // Every word must hit the property (name, category, description) or all non-property words
  // must intersect on a single value, so "blue background" finds blue values of `backgroundColor`
  // and "blue 100" finds `blue-100` instead of `red-100`.
  const queryWords = (options.query || '').toLowerCase().split(/\s+/).filter(Boolean);
  const matchedProps: Array<TokensDocsResult['properties'][number] & {matchingValueCount: number}> =
    [];
  const spacingScale = assets.styleMacro?.spacingScale ?? {};

  for (const [categoryName, catMap] of Object.entries(assets.styleMacro?.categories || {})) {
    for (const [propName, def] of Object.entries(catMap || {})) {
      if (
        propNeedle &&
        propName.toLowerCase() !== propNeedle &&
        !propName.toLowerCase().includes(propNeedle)
      ) {
        continue;
      }
      const spacingValues = (def.additionalTypes || []).flatMap(type => {
        const scale = spacingScale[type];
        return Array.isArray(scale) ? scale : [];
      });
      const allValues = [...new Set([...(def.values || []), ...spacingValues].map(String))];
      const desc = def.description || `${categoryName} style macro property`;
      let matchingValues = allValues;
      if (queryWords.length > 0) {
        const haystack = `${propName}\n${categoryName}\n${desc}`.toLowerCase();
        const valueWords = queryWords.filter(w => !haystack.includes(w));
        if (valueWords.length > 0) {
          matchingValues = allValues.filter(v => {
            const lower = v.toLowerCase();
            return valueWords.every(w => lower.includes(w));
          });
        } else {
          const allWordValHits = allValues.filter(v => {
            const lower = v.toLowerCase();
            return queryWords.every(w => lower.includes(w));
          });
          matchingValues = allWordValHits.length > 0 ? allWordValHits : allValues;
        }
        if (matchingValues.length === 0) {
          continue;
        }
      }
      matchedProps.push({
        property: propName,
        description: desc,
        matchedValues: matchingValues.slice(0, 40),
        matchingValueCount: matchingValues.length,
        totalValueCount: allValues.length
      });
    }
  }

  const mdLines: string[] = [
    `# S2 Style Macro Tokens (\`${s2Prov.packageName}@${s2Prov.packageVersion}\`)`,
    `Import: \`import {style} from '@react-spectrum/s2/style' with {type: 'macro'};\``,
    ''
  ];
  if (matchedProps.length === 0) {
    const searched = [
      ...(options.query ? [`query \`${options.query}\``] : []),
      ...(options.propertyFilter ? [`property \`${options.propertyFilter}\``] : [])
    ].join(' and ');
    mdLines.push(
      `_No style macro properties or values matched ${searched || 'this request'}. Search by a property name (\`backgroundColor\`) or a value (\`blue\`)._`
    );
  }
  const MAX_RENDERED_PROPS = 25;
  for (const p of matchedProps.slice(0, MAX_RENDERED_PROPS)) {
    const countLabel =
      p.matchingValueCount < p.totalValueCount
        ? `${p.matchingValueCount} matching of ${p.totalValueCount} allowed values`
        : `${p.totalValueCount} allowed values`;
    mdLines.push(`## \`${p.property}\` (${countLabel})`);
    if (p.description) {
      mdLines.push(p.description);
    }
    const remainingMatching = p.matchingValueCount - p.matchedValues.length;
    mdLines.push(
      `Values: ${p.matchedValues.map(v => `\`${v}\``).join(', ')}${remainingMatching > 0 ? ` … (+${remainingMatching} more)` : ''}`
    );
    mdLines.push('');
  }
  if (matchedProps.length > MAX_RENDERED_PROPS) {
    mdLines.push(
      `_Showing ${MAX_RENDERED_PROPS} of ${matchedProps.length} matching properties. Narrow results with \`--property <name>\` or a more specific query._`
    );
  }

  const publicProperties: TokensDocsResult['properties'] = matchedProps.map(
    ({property, description, matchedValues, totalValueCount}) => ({
      property,
      description,
      matchedValues,
      totalValueCount
    })
  );

  return {
    apiVersion: API_VERSION,
    query: options.query || null,
    propertyFilter: options.propertyFilter || null,
    provenance: {
      packageName: s2Prov.packageName,
      packageVersion: s2Prov.packageVersion,
      snapshotId: s2Prov.snapshotId,
      exactMatch: s2Prov.exactMatch
    },
    snapshots: collectEnvelopeSnapshots(index, [s2Prov.snapshotId]),
    resolution,
    warnings: warningsForPackages(resolution, [s2Prov.packageName]),
    properties: publicProperties,
    markdown: mdLines.join('\n').trim() + '\n'
  };
}

export interface QueryIconsOptions extends CommonQueryOptions {
  terms: string | string[];
  illustrations?: boolean;
}

export async function queryIcons(options: QueryIconsOptions): Promise<IconsDocsResult> {
  const rawTerms = Array.isArray(options.terms) ? options.terms : [options.terms];
  const normalized = Array.from(
    new Set(
      rawTerms
        .flatMap(t => String(t || '').split(/[\s,]+/))
        .map(t => t.trim().toLowerCase())
        .filter(Boolean)
    )
  );
  if (normalized.length === 0) {
    throw new AgentDocsError(
      'ERR_INVALID_ARGS',
      'Provide at least one search term for icons or illustrations.',
      EXIT_CODES.INVALID_ARGS
    );
  }

  const index = await loadSnapshotIndex({
    cacheDir: options.cacheDir,
    snapshotSource: options.snapshotSource,
    offline: options.offline
  });
  const resolution = await resolveWorkspace({...options, defaultLibrary: 's2'});
  const s2Prov = resolution.packages['@react-spectrum/s2'];
  if (!s2Prov) {
    throw new AgentDocsError(
      'ERR_SNAPSHOT_NOT_FOUND',
      `'@react-spectrum/s2' is not installed in '${resolution.cwd}'. Pass --version @react-spectrum/s2@latest to search S2 icons.`,
      EXIT_CODES.NOT_FOUND
    );
  }

  const sliceDir = await openSliceForProvenance(s2Prov, index, options);
  const assets = readSliceS2Assets(sliceDir);
  if (!assets) {
    throw new AgentDocsError(
      'ERR_SNAPSHOT_NOT_FOUND',
      `S2 icon metadata is not available in snapshot '${s2Prov.snapshotId}'.`,
      EXIT_CODES.NOT_FOUND
    );
  }

  const kind = options.illustrations ? 'illustrations' : 'icons';
  const allNames = options.illustrations
    ? (assets.illustrations || []).map(i => i.id)
    : assets.icons || [];
  const aliases: Record<string, string[]> = options.illustrations
    ? {}
    : {pencil: ['Edit'], ...assets.iconAliases};
  const nameSet = new Set(allNames);
  // Lower rank sorts first: exact name, alias target, name prefix, then any substring match.
  const matches = new Map<string, number>();
  const matchedTerms = new Set<string>();
  const addMatch = (name: string, rank: number, term: string) => {
    matches.set(name, Math.min(rank, matches.get(name) ?? rank));
    matchedTerms.add(term);
  };

  for (const name of allNames) {
    const lower = name.toLowerCase();
    for (const term of normalized) {
      if (lower.includes(term)) {
        addMatch(name, lower === term ? 0 : lower.startsWith(term) ? 2 : 3, term);
      }
    }
  }
  for (const [alias, targets] of Object.entries(aliases)) {
    const aliasLower = alias.toLowerCase();
    const knownTargets = targets.filter(target => nameSet.has(target));
    for (const term of normalized) {
      const aliasMatchesTerm =
        aliasLower === term ||
        (term.length >= 2 && aliasLower.includes(term)) ||
        (aliasLower.length >= 3 && term.includes(aliasLower));
      if (aliasMatchesTerm) {
        for (const target of knownTargets) {
          addMatch(target, 1, term);
        }
      }
    }
  }

  const sortedMatches = Array.from(matches.keys()).sort(
    (a, b) => matches.get(a)! - matches.get(b)! || a.localeCompare(b)
  );
  const unmatchedTerms = normalized.filter(term => !matchedTerms.has(term));
  const sampleName = sortedMatches[0];
  let importExample = '';
  if (sampleName) {
    const subpath = options.illustrations
      ? assets.illustrations.find(i => i.id === sampleName)?.subpath
      : `@react-spectrum/s2/icons/${sampleName}`;
    if (subpath) {
      importExample = `import ${sampleName} from '${subpath}';`;
    }
  }

  const mdLines: string[] = [
    `# S2 ${options.illustrations ? 'Illustrations' : 'Workflow Icons'} (\`${s2Prov.packageName}@${s2Prov.packageVersion}\`)`,
    `Matched ${sortedMatches.length} of ${allNames.length} ${kind} for: ${normalized.map(t => `\`${t}\``).join(', ')}`,
    '',
    ...(importExample ? ['```tsx', importExample, '```', ''] : []),
    sortedMatches.length > 0
      ? sortedMatches.map(m => `- \`${m}\``).join('\n')
      : '_No matching names found._',
    ...(sortedMatches.length > 0 && unmatchedTerms.length > 0
      ? ['', `_No matches for: ${unmatchedTerms.map(t => `\`${t}\``).join(', ')}._`]
      : [])
  ];

  return {
    apiVersion: API_VERSION,
    terms: normalized,
    assetKind: kind,
    provenance: {
      packageName: s2Prov.packageName,
      packageVersion: s2Prov.packageVersion,
      snapshotId: s2Prov.snapshotId,
      exactMatch: s2Prov.exactMatch
    },
    snapshots: collectEnvelopeSnapshots(index, [s2Prov.snapshotId]),
    resolution,
    warnings: warningsForPackages(resolution, [s2Prov.packageName]),
    matches: sortedMatches,
    unmatchedTerms,
    importExample,
    markdown: mdLines.join('\n').trim() + '\n'
  };
}

export async function prefetchDocs(options: CommonQueryOptions = {}): Promise<PrefetchDocsResult> {
  const cacheDir = resolveDefaultCacheDir(options.cacheDir);
  const index = await loadSnapshotIndex({
    cacheDir,
    snapshotSource: options.snapshotSource,
    offline: options.offline,
    forceRefreshIndex: !options.offline
  });
  const resolution = await resolveWorkspace({...options, cacheDir});
  const prefetchedSlices: PrefetchDocsResult['prefetchedSlices'] = [];

  for (const snapshotId of new Set(
    Object.values(resolution.packages).map(prov => prov.snapshotId)
  )) {
    const snapshot = index.snapshots[snapshotId];
    if (!snapshot) {
      throw new AgentDocsError(
        'ERR_SNAPSHOT_NOT_FOUND',
        `Unknown snapshot '${snapshotId}'.`,
        EXIT_CODES.NOT_FOUND
      );
    }
    await loadSnapshotManifest(snapshot, {...options, cacheDir});
  }
  for (const prov of Object.values(resolution.packages)) {
    const localDir = await openSliceForProvenance(prov, index, {...options, cacheDir});
    prefetchedSlices.push({
      packageName: prov.packageName,
      packageVersion: prov.packageVersion,
      snapshotId: prov.snapshotId,
      sliceSha256: prov.sliceSha256,
      localDir
    });
  }

  return {
    apiVersion: API_VERSION,
    cacheDir,
    resolution,
    warnings: [...resolution.warnings],
    prefetchedSlices
  };
}

export function getCapabilityManifest(
  brand: BrandId,
  packageVersion: string
): CliCapabilityManifest {
  const isS2 = brand === 's2';
  const cliName = isS2 ? 'spectrum' : 'react-aria';
  const packageName = isS2 ? '@react-spectrum/cli' : '@react-aria/cli';
  const defaultLibrary: LibraryId = isS2 ? 's2' : 'rac';

  const commands: CliCapabilityManifest['commands'] = [
    {
      name: 'search',
      summary:
        'Search components, hooks, patterns, and guides matched to workspace package versions.',
      usage: `${cliName} search <query> [--library s2|rac|react-aria|react-stately|internationalized] [--limit N] [--json]`,
      flags: [
        '--cwd',
        '--library',
        '--limit',
        '--version',
        '--snapshot',
        '--offline',
        '--json',
        '--include-resolution'
      ]
    },
    {
      name: 'read',
      summary:
        'Read compact usage, anatomy, styling, accessibility, and API docs for one or more IDs in a single call.',
      usage: `${cliName} read <id...> [--sections usage,api,accessibility,styling,testing,guide,all] [--list-sections | --section heading-or-id] [--include-deprecated] [--max-tokens N] [--cursor value] [--json [--json-content entry|markdown]]`,
      flags: [
        '--cwd',
        '--sections',
        '--list-sections',
        '--section',
        '--include-deprecated',
        '--max-tokens',
        '--cursor',
        '--version',
        '--snapshot',
        '--strict-version',
        '--offline',
        '--json',
        '--json-content',
        '--include-resolution'
      ]
    },
    {
      name: 'api',
      summary: 'Inspect TypeScript APIs by document ID or export name.',
      usage: `${cliName} api <id-or-export> [--export Name] [--prop filter] [--events-only] [--render-props] [--include-deprecated] [--json]`,
      flags: [
        '--cwd',
        '--export',
        '--prop',
        '--events-only',
        '--render-props',
        '--include-deprecated',
        '--version',
        '--snapshot',
        '--offline',
        '--json',
        '--include-resolution'
      ]
    },
    ...(isS2
      ? [
          {
            name: 'tokens',
            summary: 'Query S2 style macro properties and allowed design token values.',
            usage: `${cliName} tokens [query] [--property name] [--json]`,
            flags: [
              '--cwd',
              '--property',
              '--version',
              '--snapshot',
              '--offline',
              '--json',
              '--include-resolution'
            ]
          },
          {
            name: 'icons',
            summary: 'Search S2 workflow icons and linear illustrations by name or alias.',
            usage: `${cliName} icons <term...> [--illustrations] [--json]`,
            flags: [
              '--cwd',
              '--illustrations',
              '--version',
              '--snapshot',
              '--offline',
              '--json',
              '--include-resolution'
            ]
          }
        ]
      : []),
    {
      name: 'resolve',
      summary:
        'Diagnostic check of workspace dependency versions, importer contexts, and matched snapshot slices.',
      usage: `${cliName} resolve [--cwd path] [--json]`,
      flags: ['--cwd', '--version', '--snapshot', '--strict-version', '--offline', '--json']
    },
    {
      name: 'prefetch',
      summary:
        'Download and SHA-256 verify documentation slices for the workspace into the user cache for offline/CI use.',
      usage: `${cliName} prefetch [--cwd path] [--cache-dir dir] [--json]`,
      flags: ['--cwd', '--cache-dir', '--version', '--snapshot', '--json', '--include-resolution']
    },
    {
      name: 'manifest',
      summary: 'Print machine-readable CLI capability and schema compatibility manifest.',
      usage: `${cliName} manifest [--json]`,
      flags: ['--json']
    }
  ];

  return {
    apiVersion: API_VERSION,
    readerSchemaVersion: READER_SCHEMA_VERSION,
    cliName,
    packageName,
    packageVersion,
    defaultLibrary,
    supportedSnapshotSchemaVersions: [1],
    commands,
    exitCodes: {...EXIT_CODES}
  };
}
