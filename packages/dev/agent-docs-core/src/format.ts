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
  DocWarning,
  PrefetchDocsResult,
  ReadDocsResult,
  ResolutionState,
  SearchDocsResult
} from './types.js';

function formatWarningsBanner(warnings: DocWarning[]): string {
  if (!warnings || warnings.length === 0) {
    return '';
  }
  const lines = warnings.map(w => `> [${w.code}] ${w.message}`);
  return lines.join('\n') + '\n\n';
}

export function formatResolutionMarkdown(resolution: ResolutionState): string {
  const lines: string[] = [];
  lines.push('# Workspace Documentation Resolution');
  lines.push(`Working directory: \`${resolution.cwd}\``);
  if (resolution.workspaceDir) {
    lines.push(
      `Workspace: \`${resolution.workspacePackageName || 'unnamed'}\` (\`${resolution.workspaceDir}\`)`
    );
  }
  if (resolution.lockfilePath) {
    lines.push(`Lockfile: \`${resolution.lockfilePath}\` (${resolution.lockfileKind})`);
  }
  lines.push('');

  if (resolution.warnings.length > 0) {
    lines.push(formatWarningsBanner(resolution.warnings).trimEnd());
    lines.push('');
  }

  lines.push(
    '| Package | Resolved Version | Requested | Source | Importer | Snapshot | Exact Match |'
  );
  lines.push('|---|---|---|---|---|---|---|');
  for (const prov of Object.values(resolution.packages)) {
    lines.push(
      `| \`${prov.packageName}\` | \`${prov.packageVersion}\` | \`${prov.requestedVersion}\` | ${prov.source} | \`${prov.importer}\` | \`${prov.snapshotId}\` | ${prov.exactMatch ? 'yes' : 'no (same-minor)'} |`
    );
  }

  return lines.join('\n') + '\n';
}

export function formatSearchMarkdown(result: SearchDocsResult): string {
  const lines: string[] = [];
  if (result.warnings.length > 0) {
    lines.push(formatWarningsBanner(result.warnings).trimEnd());
    lines.push('');
  }
  lines.push(
    `# Search Results for "${result.query}" (${result.results.length} hit${result.results.length === 1 ? '' : 's'})`
  );
  lines.push('');

  if (result.results.length === 0) {
    lines.push('_No matching components, hooks, or guides found._');
    return lines.join('\n') + '\n';
  }

  // With several hits, state the shared context flags once instead of repeating them per hit.
  const sharedFlags = result.results.length > 1 ? result.followUpFlags : '';
  const suffix = sharedFlags ? ` ${sharedFlags}` : '';
  if (sharedFlags) {
    lines.push(`Append to every \`Next\` command below: \`${sharedFlags}\``);
    lines.push('');
  }

  for (const hit of result.results) {
    lines.push(
      `- **\`${hit.id}\`** — ${hit.title} (${hit.kind}, \`${hit.provenance.packageName}@${hit.provenance.packageVersion}\`)`
    );
    if (hit.summary) {
      lines.push(`  ${hit.summary}`);
    }
    const command = hit.followUpCommands[0];
    lines.push(
      `  Next: \`${suffix && command.endsWith(suffix) ? command.slice(0, -suffix.length) : command}\``
    );
  }

  return lines.join('\n') + '\n';
}

export function formatReadMarkdown(result: ReadDocsResult): string {
  const blocks: string[] = [];
  if (result.warnings.length > 0) {
    blocks.push(formatWarningsBanner(result.warnings).trimEnd());
  }

  for (const item of result.results) {
    if (item.ok) {
      const continuation = item.continueCommand
        ? `\n\n> Continue with \`${item.continueCommand}\`.`
        : item.nextCursor
          ? `\n\n> Call read_docs for this ID with cursor \`${item.nextCursor}\` and the same options.`
          : '';
      blocks.push(item.markdown.trimEnd() + continuation);
    } else {
      const suggestionText =
        item.error.suggestions && item.error.suggestions.length > 0
          ? ` Did you mean: ${item.error.suggestions.map(s => `\`${s}\``).join(', ')}?`
          : '';
      blocks.push(
        `## Error reading \`${item.requestedId}\` [${item.error.code}]\n${item.error.message}${suggestionText}`
      );
    }
  }

  return blocks.join('\n\n---\n\n') + '\n';
}

export interface ReadOutputOptions {
  format: 'markdown' | 'json';
  jsonContent?: 'entry' | 'markdown';
  includeResolution?: boolean;
  continuation?: 'cursor';
}

export function formatQueryJson<T extends {resolution: ResolutionState}>(
  {resolution, ...result}: T,
  includeResolution?: boolean
): string {
  return JSON.stringify(includeResolution ? {...result, resolution} : result) + '\n';
}

export function formatReadOutput(result: ReadDocsResult, options: ReadOutputOptions): string {
  if (options.format === 'markdown') {
    return formatReadMarkdown(result);
  }
  const results = result.results.map(item => {
    if (!item.ok) {
      return item;
    }
    const {entry, markdown, ...metadata} = item;
    return options.jsonContent === 'markdown' ? {...metadata, markdown} : {...metadata, entry};
  });
  return formatQueryJson({...result, results}, options.includeResolution);
}

export function formatPrefetchMarkdown(result: PrefetchDocsResult): string {
  const lines: string[] = [];
  if (result.warnings.length > 0) {
    lines.push(formatWarningsBanner(result.warnings).trimEnd());
    lines.push('');
  }
  lines.push(`# Prefetched ${result.prefetchedSlices.length} Documentation Slice(s)`);
  lines.push(`Cache directory: \`${result.cacheDir}\``);
  lines.push('');
  for (const s of result.prefetchedSlices) {
    lines.push(
      `- \`${s.packageName}@${s.packageVersion}\` (snapshot \`${s.snapshotId}\`, sha256 \`${s.sliceSha256.slice(0, 12)}…\`)`
    );
  }
  return lines.join('\n') + '\n';
}
