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
import {LIBRARY_TO_PACKAGES, resolveWorkspace} from './resolver.js';

const QUERY_SYNONYMS: Record<string, string[]> = {
  dropdown: ['picker', 'select', 'combobox', 'menu'],
  searchable: ['combobox', 'autocomplete', 'searchfield', 'filter'],
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
  tokens: string[],
  expandedTokens: Set<string>,
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

  for (const tok of tokens) {
    if (titleLower === tok || slugLower === tok) {
      score += 55;
    } else if (titleLower.includes(tok) || slugLower.includes(tok)) {
      score += 30;
    }
    if (exportsLower.some(e => e === tok)) {
      score += 35;
    } else if (exportsLower.some(e => e.includes(tok))) {
      score += 15;
    }
    if (keywordsLower.some(k => k === tok || k.includes(tok))) {
      score += 22;
    }
    if (summaryLower.includes(tok)) {
      score += 12;
    }
    if (rec.kind.toLowerCase().includes(tok)) {
      score += 10;
    }
  }

  for (const syn of expandedTokens) {
    if (tokens.includes(syn)) {
      continue;
    }
    if (titleLower === syn || slugLower === syn) {
      score += 28;
    } else if (
      titleLower.includes(syn) ||
      keywordsLower.some(k => k.includes(syn)) ||
      summaryLower.includes(syn)
    ) {
      score += 12;
    }
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

  const rawQueryLower = query.toLowerCase();
  const tokens = tokenizeQuery(query);
  const expandedTokens = new Set<string>(tokens);
  for (const tok of tokens) {
    for (const [key, syns] of Object.entries(QUERY_SYNONYMS)) {
      if (tok === key || tok.includes(key)) {
        for (const s of syns) {
          expandedTokens.add(s);
        }
      }
    }
  }

  const hits: SearchHit[] = [];
  const usedSnapshots = new Set<string>();

  for (const prov of Object.values(resolution.packages)) {
    const sliceDir = await openSliceForProvenance(prov, index, options);
    const records = readSliceSearchIndex(sliceDir);
    for (const rec of records) {
      if (options.library && rec.library !== options.library) {
        continue;
      }
      const score = scoreSearchRecord(
        rec,
        rawQueryLower,
        tokens,
        expandedTokens,
        options.library || options.defaultLibrary || null
      );
      if (score <= 0) {
        continue;
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
          `${cliPrefix} read ${rec.id}`,
          ...(rec.exports && rec.exports.length > 0 ? [`${cliPrefix} api ${rec.id}`] : [])
        ]
      });
    }
  }

  hits.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const topHits = hits.slice(0, limit);

  return {
    apiVersion: API_VERSION,
    query,
    libraryFilter: options.library || null,
    snapshots: collectEnvelopeSnapshots(index, usedSnapshots),
    resolution,
    warnings: [...resolution.warnings],
    results: topHits
  };
}

function estimateTokens(text: string): number {
  return Math.ceil(Buffer.byteLength(text, 'utf8') / 4);
}

function renderReadEntry(entry: CatalogEntryIR): string {
  const lines = [
    `# ${entry.title} (\`${entry.id}\`)`,
    `Package: \`${entry.packageName}@${entry.packageVersion}\``,
    '',
    entry.summary
  ];
  if (entry.imports.length > 0) {
    lines.push('', '## Imports', '```tsx', ...entry.imports, '```');
  }
  if (entry.compositionRules.length > 0) {
    lines.push('', '## Implementation Rules', ...entry.compositionRules.map(rule => `- ${rule}`));
  }
  for (const section of entry.sections) {
    lines.push('', `## ${section.heading}`, '', section.markdown);
  }
  if (entry.exports.length > 0) {
    lines.push('', '## API', ...entry.exports.map(exp => renderDetailedExportMarkdown(exp)));
  }
  return lines.join('\n').trim() + '\n';
}

function filterEntryBySections(
  entry: CatalogEntryIR,
  fullCanonicalMd: string,
  requestedSections: SectionFilter[] | undefined,
  cliPrefix: string
): {
  entry: CatalogEntryIR;
  markdown: string;
  includedSections: string[];
  omittedSections: string[];
  truncated: boolean;
  continueCommand?: string;
} {
  const wantsAll =
    !requestedSections || requestedSections.length === 0 || requestedSections.includes('all');

  if (wantsAll) {
    return {
      entry,
      markdown: fullCanonicalMd,
      includedSections: [
        ...new Set([...entry.sections.map(s => s.id), ...(entry.exports.length > 0 ? ['api'] : [])])
      ],
      omittedSections: [],
      truncated: false
    };
  }

  const wantedSet = new Set(requestedSections);
  const filteredEntry = {
    ...entry,
    sections: entry.sections.filter(sec => wantedSet.has(sec.category)),
    exports: wantedSet.has('api') ? entry.exports : [],
    compositionRules:
      wantedSet.has('usage') || wantedSet.has('accessibility') ? entry.compositionRules : []
  };
  const omittedSections = [
    ...entry.sections.filter(sec => !wantedSet.has(sec.category)).map(sec => sec.id),
    ...(!wantedSet.has('api') && entry.exports.length > 0 ? ['api'] : [])
  ];

  return {
    entry: filteredEntry,
    markdown: renderReadEntry(filteredEntry),
    includedSections: [
      ...new Set([
        ...filteredEntry.sections.map(sec => sec.id),
        ...(filteredEntry.exports.length > 0 ? ['api'] : [])
      ])
    ],
    omittedSections,
    truncated: false,
    continueCommand:
      omittedSections.length > 0 ? `${cliPrefix} read ${entry.id} --sections all` : undefined
  };
}

function boundReadResult(result: ReadDocsResult, maxTokens: number, cliPrefix: string): void {
  const outputTokens = () => estimateTokens(JSON.stringify(result, null, 2) + '\n');
  if (outputTokens() <= maxTokens) {
    return;
  }

  const originals = [...result.results];
  type ReadSuccess = Extract<ReadItemResult, {ok: true}>;
  const project = (original: ReadSuccess, entry: CatalogEntryIR): ReadSuccess => {
    const omitted = [
      ...original.omittedSections,
      ...original.entry.sections.filter(sec => !entry.sections.includes(sec)).map(sec => sec.id),
      ...(original.entry.exports.length > entry.exports.length ? ['api'] : [])
    ];
    const truncated =
      entry.sections.length < original.entry.sections.length ||
      entry.exports.length < original.entry.exports.length;
    const continueCommand =
      omitted.length > 0 ? `${cliPrefix} read ${entry.id} --sections all` : undefined;
    return {
      ...original,
      entry,
      markdown:
        renderReadEntry(entry) +
        (truncated ? `\n> Output truncated. Run \`${continueCommand}\` for full content.\n` : ''),
      includedSections: [
        ...new Set([
          ...entry.sections.map(sec => sec.id),
          ...(entry.exports.length > 0 ? ['api'] : [])
        ])
      ],
      omittedSections: [...new Set(omitted)],
      truncated,
      continueCommand
    };
  };
  // Reserve the complete serialized envelope, including provenance and continuation metadata.
  result.results = originals.map(item =>
    item.ok ? project(item, {...item.entry, sections: [], exports: []}) : item
  );
  const minimumTokens = outputTokens();
  if (minimumTokens > maxTokens) {
    throw new AgentDocsError(
      'ERR_INVALID_ARGS',
      `The token budget ${maxTokens} is too small for document metadata and provenance (requires at least ${minimumTokens}). Increase --max-tokens or request fewer entries.`,
      EXIT_CODES.INVALID_ARGS
    );
  }
  const successCount = originals.filter(item => item.ok).length;
  const extraTokensPerEntry = Math.floor((maxTokens - minimumTokens) / Math.max(1, successCount));

  for (const [i, original] of originals.entries()) {
    let current = result.results[i];
    if (!original.ok || !current.ok) {
      continue;
    }
    const entryLimit = outputTokens() + extraTokensPerEntry;
    const apiSections = original.entry.sections.filter(section => section.category === 'api');
    const candidates = [
      ...original.entry.sections
        .filter(section => section.category !== 'api')
        .map(section => ({sections: [section], exports: []})),
      ...(original.entry.exports.length > 0 || apiSections.length > 0
        ? [{sections: apiSections, exports: original.entry.exports}]
        : [])
    ];
    for (const candidate of candidates) {
      const next = project(original, {
        ...current.entry,
        sections: [...current.entry.sections, ...candidate.sections],
        exports: candidate.exports.length > 0 ? candidate.exports : current.entry.exports
      });
      result.results[i] = next;
      if (outputTokens() <= entryLimit) {
        current = next;
      } else {
        result.results[i] = current;
      }
    }
  }
}

export interface ReadDocsOptions extends CommonQueryOptions {
  ids: string[];
  sections?: SectionFilter[];
  maxTokens?: number;
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

  const index = await loadSnapshotIndex({
    cacheDir: options.cacheDir,
    snapshotSource: options.snapshotSource,
    offline: options.offline
  });
  const resolution = await resolveWorkspace(options);
  const defaultLibrary = options.defaultLibrary || 's2';
  const cliPrefix =
    options.cliCommandPrefix || (defaultLibrary === 'rac' ? 'react-aria' : 'spectrum');

  const sliceCache = new Map<string, string>();
  const getSliceDir = async (prov: ResolvedPackageProvenance) => {
    const key = `${prov.packageName}@${prov.packageVersion}`;
    if (!sliceCache.has(key)) {
      sliceCache.set(key, await openSliceForProvenance(prov, index, options));
    }
    return sliceCache.get(key)!;
  };

  const results: ReadItemResult[] = [];
  const usedSnapshots = new Set<string>();
  const warnings: DocWarning[] = [...resolution.warnings];
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
      markdown: string;
      prov: ResolvedPackageProvenance;
    } | null = null;
    const fuzzySuggestions = new Set<string>();

    for (const pkgName of candidatePkgs) {
      const prov = resolution.packages[pkgName];
      if (!prov) {
        continue;
      }
      const sliceDir = await getSliceDir(prov);
      const direct = readSliceEntryBySlug(sliceDir, library, slug);
      if (direct) {
        matchedData = {entry: direct.entry, markdown: direct.markdown, prov};
        break;
      }

      // Case-insensitive exact ID/slug/title lookup via search index (without fuzzy hallucination!)
      const searchRecords = readSliceSearchIndex(sliceDir);
      const slugLower = slug.toLowerCase();
      const exactRecord = searchRecords.find(
        r =>
          r.library === library &&
          (r.slug.toLowerCase() === slugLower || r.title.toLowerCase() === slugLower)
      );
      if (exactRecord) {
        const byExact = readSliceEntryBySlug(sliceDir, exactRecord.library, exactRecord.slug);
        if (byExact) {
          matchedData = {entry: byExact.entry, markdown: byExact.markdown, prov};
          break;
        }
      }

      for (const rec of searchRecords) {
        if (
          rec.title.toLowerCase().includes(slugLower) ||
          slugLower.includes(rec.title.toLowerCase()) ||
          rec.exports.some(e => e.toLowerCase() === slugLower)
        ) {
          fuzzySuggestions.add(rec.id);
        }
      }
    }

    // Fallback: if unqualified slug (e.g. `CalendarDate`) didn't match defaultLibrary, check other resolved packages for an exact title/slug match
    if (!matchedData && !requestedId.includes(':')) {
      const slugLower = slug.toLowerCase();
      for (const prov of Object.values(resolution.packages)) {
        const sliceDir = await getSliceDir(prov);
        const exactRecord = readSliceSearchIndex(sliceDir).find(
          r => r.slug.toLowerCase() === slugLower || r.title.toLowerCase() === slugLower
        );
        const found = exactRecord
          ? readSliceEntryBySlug(sliceDir, exactRecord.library, exactRecord.slug)
          : null;
        if (found) {
          matchedData = {entry: found.entry, markdown: found.markdown, prov};
          break;
        }
      }
    }

    if (!matchedData) {
      const primaryPkg = candidatePkgs[0];
      const prov = resolution.packages[primaryPkg];
      const versionNote = prov
        ? ` in ${prov.packageName}@${prov.packageVersion} (snapshot ${prov.snapshotId})`
        : ` (package '${primaryPkg}' is not resolved in this workspace)`;
      results.push({
        requestedId,
        ok: false,
        error: {
          code: 'ERR_ENTRY_NOT_FOUND',
          message: `Document '${requestedId}' was not found${versionNote}.`,
          suggestions: Array.from(fuzzySuggestions).slice(0, 5)
        }
      });
      continue;
    }

    usedSnapshots.add(matchedData.prov.snapshotId);
    const filtered = filterEntryBySections(
      matchedData.entry,
      matchedData.markdown,
      options.sections,
      cliPrefix
    );

    results.push({
      requestedId,
      ok: true,
      id: matchedData.entry.id,
      provenance: {
        packageName: matchedData.prov.packageName,
        packageVersion: matchedData.prov.packageVersion,
        snapshotId: matchedData.prov.snapshotId,
        exactMatch: matchedData.prov.exactMatch,
        sourceUrl: matchedData.entry.sourceUrl
      },
      entry: filtered.entry,
      markdown: filtered.markdown,
      includedSections: filtered.includedSections,
      omittedSections: filtered.omittedSections,
      truncated: filtered.truncated,
      continueCommand: filtered.continueCommand
    });
  }

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
    if (!Number.isSafeInteger(options.maxTokens) || options.maxTokens < 1) {
      throw new AgentDocsError(
        'ERR_INVALID_ARGS',
        'maxTokens must be a positive safe integer.',
        EXIT_CODES.INVALID_ARGS
      );
    }
    boundReadResult(result, options.maxTokens, cliPrefix);
  }
  return result;
}

export interface QueryApiOptions extends CommonQueryOptions {
  id: string;
  exportName?: string;
  propFilter?: string;
  eventsOnly?: boolean;
  renderPropsOnly?: boolean;
}

function renderDetailedExportMarkdown(exp: ExportApiIR): string {
  const lines: string[] = [];
  const genSuffix =
    exp.typeParameters.length > 0
      ? `<${exp.typeParameters.map(g => `${g.name}${g.constraint ? ` extends ${g.constraint}` : ''}${g.defaultType ? ` = ${g.defaultType}` : ''}`).join(', ')}>`
      : '';
  lines.push(`## \`${exp.name}${genSuffix}\` (${exp.exportKind})`);
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
    lines.push('### Props');
    lines.push('| Prop | Type | Default | Inherited From | Description |');
    lines.push('|---|---|---|---|---|');
    for (const p of props) {
      const req = p.required ? '**required**' : p.defaultValue || '—';
      lines.push(
        `| \`${p.name}\` | \`${p.type.replace(/\|/g, '\\|')}\` | ${req.replace(/\|/g, '\\|')} | ${p.inheritedFrom ? `\`${p.inheritedFrom}\`` : '—'} | ${(p.description || '—').replace(/\|/g, '\\|')} |`
      );
    }
  }
  const events = exp.events;
  if (events.length > 0) {
    lines.push('');
    lines.push('### Events');
    lines.push('| Event | Signature | Description |');
    lines.push('|---|---|---|');
    for (const ev of events) {
      lines.push(
        `| \`${ev.name}\` | \`${ev.type.replace(/\|/g, '\\|')}\` | ${(ev.description || '—').replace(/\|/g, '\\|')} |`
      );
    }
  }
  const rps = exp.renderProps;
  if (rps.length > 0) {
    lines.push('');
    lines.push('### Render Props & Data Attributes');
    lines.push('| State | Type | CSS Selector | Description |');
    lines.push('|---|---|---|---|');
    for (const rp of rps) {
      lines.push(
        `| \`${rp.name}\` | \`${rp.type.replace(/\|/g, '\\|')}\` | ${rp.selector ? `\`${rp.selector}\`` : '—'} | ${(rp.description || '—').replace(/\|/g, '\\|')} |`
      );
    }
  }
  return lines.join('\n');
}

export async function queryApi(options: QueryApiOptions): Promise<ApiDocsResult> {
  const readRes = await readDocs({
    ...options,
    ids: [options.id],
    sections: ['api']
  });
  const item = readRes.results[0];
  if (!item || !item.ok) {
    throw new AgentDocsError(
      item?.error.code || 'ERR_ENTRY_NOT_FOUND',
      item?.error.message || `Component '${options.id}' not found.`,
      EXIT_CODES.NOT_FOUND,
      {suggestions: item && !item.ok ? item.error.suggestions : undefined}
    );
  }

  let exportsList = item.entry.exports || [];
  if (options.exportName) {
    const needle = options.exportName.toLowerCase();
    exportsList = exportsList.filter(e => e.name.toLowerCase() === needle);
    if (exportsList.length === 0) {
      const available = (item.entry.exports || []).map(e => e.name);
      throw new AgentDocsError(
        'ERR_ENTRY_NOT_FOUND',
        `Export '${options.exportName}' not found on '${item.id}'. Available exports: ${available.join(', ') || 'none'}.`,
        EXIT_CODES.NOT_FOUND,
        {suggestions: available}
      );
    }
  }

  const propNeedles = (options.propFilter || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  const filterMembers = <T extends {name: string; description: string}>(items: T[]): T[] =>
    propNeedles.length > 0
      ? items.filter(p =>
          propNeedles.some(
            needle =>
              p.name.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle)
          )
        )
      : items;
  exportsList = exportsList.map(exp => ({
    ...exp,
    props: options.eventsOnly || options.renderPropsOnly ? [] : filterMembers(exp.props),
    events: options.renderPropsOnly ? [] : filterMembers(exp.events),
    renderProps: options.eventsOnly ? [] : filterMembers(exp.renderProps)
  }));

  const mdLines: string[] = [
    `# API Reference: ${item.entry.title} (\`${item.id}\`)`,
    `Package: \`${item.provenance.packageName}@${item.provenance.packageVersion}\` · Snapshot: \`${item.provenance.snapshotId}\``
  ];
  if (item.entry.imports && item.entry.imports.length > 0) {
    mdLines.push('');
    mdLines.push('```tsx');
    for (const imp of item.entry.imports) {
      mdLines.push(imp);
    }
    mdLines.push('```');
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
    warnings: readRes.warnings,
    imports: item.entry.imports,
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
  const queryNeedle = options.query?.toLowerCase() || null;
  const matchedProps: TokensDocsResult['properties'] = [];

  for (const [categoryName, catMap] of Object.entries(assets.styleMacro?.categories || {})) {
    for (const [propName, def] of Object.entries(catMap || {})) {
      if (
        propNeedle &&
        propName.toLowerCase() !== propNeedle &&
        !propName.toLowerCase().includes(propNeedle)
      ) {
        continue;
      }
      const allValues = (def.values || []).map(v => String(v));
      const desc = def.description || `${categoryName} style macro property`;
      if (queryNeedle) {
        const nameHit =
          propName.toLowerCase().includes(queryNeedle) ||
          categoryName.toLowerCase().includes(queryNeedle) ||
          desc.toLowerCase().includes(queryNeedle);
        const valHits = allValues.filter(v => v.toLowerCase().includes(queryNeedle));
        if (!nameHit && valHits.length === 0) {
          continue;
        }
        matchedProps.push({
          property: propName,
          description: desc,
          matchedValues: (valHits.length > 0 ? valHits : allValues).slice(0, 40),
          totalValueCount: allValues.length
        });
      } else {
        matchedProps.push({
          property: propName,
          description: desc,
          matchedValues: allValues.slice(0, 40),
          totalValueCount: allValues.length
        });
      }
    }
  }

  const mdLines: string[] = [
    `# S2 Style Macro Tokens (\`${s2Prov.packageName}@${s2Prov.packageVersion}\`)`,
    `Import: \`import {style} from '@react-spectrum/s2/style' with {type: 'macro'};\``,
    ''
  ];
  for (const p of matchedProps.slice(0, 25)) {
    mdLines.push(`## \`${p.property}\` (${p.totalValueCount} allowed values)`);
    if (p.description) {
      mdLines.push(p.description);
    }
    mdLines.push(
      `Values: ${p.matchedValues.map(v => `\`${v}\``).join(', ')}${p.totalValueCount > p.matchedValues.length ? ` … (+${p.totalValueCount - p.matchedValues.length} more)` : ''}`
    );
    mdLines.push('');
  }

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
    warnings: [...resolution.warnings],
    properties: matchedProps,
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
  const aliases = options.illustrations ? {} : assets.iconAliases || {};
  const nameSet = new Set(allNames);
  const matches = new Set<string>();

  for (const name of allNames) {
    const lower = name.toLowerCase();
    if (normalized.some(t => lower.includes(t))) {
      matches.add(name);
    }
  }
  for (const [alias, targets] of Object.entries(aliases)) {
    const aliasLower = alias.toLowerCase();
    if (normalized.some(t => aliasLower.includes(t) || t.includes(aliasLower))) {
      for (const target of targets) {
        if (nameSet.has(target)) {
          matches.add(target);
        }
      }
    }
  }

  const sortedMatches = Array.from(matches).sort((a, b) => a.localeCompare(b));
  const sampleName = sortedMatches[0] || (options.illustrations ? 'Upload' : 'Search');
  const sampleIllusSubpath = options.illustrations
    ? assets.illustrations.find(i => i.id === sampleName)?.subpath ||
      `@react-spectrum/s2/illustrations/linear/${sampleName}`
    : '';
  const importExample = options.illustrations
    ? `import ${sampleName} from '${sampleIllusSubpath}';`
    : `import ${sampleName} from '@react-spectrum/s2/icons/${sampleName}';`;

  const mdLines: string[] = [
    `# S2 ${options.illustrations ? 'Illustrations' : 'Workflow Icons'} (\`${s2Prov.packageName}@${s2Prov.packageVersion}\`)`,
    `Matched ${sortedMatches.length} of ${allNames.length} ${kind} for: ${normalized.map(t => `\`${t}\``).join(', ')}`,
    '',
    '```tsx',
    importExample,
    '```',
    '',
    sortedMatches.length > 0
      ? sortedMatches.map(m => `- \`${m}\``).join('\n')
      : '_No matching names found._'
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
    warnings: [...resolution.warnings],
    matches: sortedMatches,
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
      usage: `${cliName} search <query> [--library s2|rac|react-aria|internationalized] [--limit N] [--json]`,
      flags: ['--cwd', '--library', '--limit', '--version', '--snapshot', '--offline', '--json']
    },
    {
      name: 'read',
      summary:
        'Read compact usage, anatomy, styling, accessibility, and API docs for one or more IDs in a single call.',
      usage: `${cliName} read <id...> [--sections usage,api,accessibility,styling,testing,guide,all] [--max-tokens N] [--json]`,
      flags: [
        '--cwd',
        '--sections',
        '--max-tokens',
        '--version',
        '--snapshot',
        '--strict-version',
        '--offline',
        '--json'
      ]
    },
    {
      name: 'api',
      summary:
        'Inspect detailed TypeScript props, events, render props, generics, and constraints for a component or hook.',
      usage: `${cliName} api <id> [--export Name] [--prop filter] [--events-only] [--render-props] [--json]`,
      flags: [
        '--cwd',
        '--export',
        '--prop',
        '--events-only',
        '--render-props',
        '--version',
        '--snapshot',
        '--offline',
        '--json'
      ]
    },
    ...(isS2
      ? [
          {
            name: 'tokens',
            summary: 'Query S2 style macro properties and allowed design token values.',
            usage: `${cliName} tokens [query] [--property name] [--json]`,
            flags: ['--cwd', '--property', '--version', '--snapshot', '--offline', '--json']
          },
          {
            name: 'icons',
            summary: 'Search S2 workflow icons and linear illustrations by name or alias.',
            usage: `${cliName} icons <term...> [--illustrations] [--json]`,
            flags: ['--cwd', '--illustrations', '--version', '--snapshot', '--offline', '--json']
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
      flags: ['--cwd', '--cache-dir', '--version', '--snapshot', '--json']
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
