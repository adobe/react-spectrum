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
  BrandId,
  CommonQueryOptions,
  EXIT_CODES,
  LibraryId,
  SectionFilter
} from './types.js';
import {
  formatPrefetchMarkdown,
  formatQueryJson,
  formatReadOutput,
  formatResolutionMarkdown,
  formatSearchMarkdown,
  ReadOutputOptions
} from './format.js';
import {
  getCapabilityManifest,
  prefetchDocs,
  queryApi,
  queryIcons,
  queryTokens,
  readDocs,
  searchDocs
} from './query.js';
import {parseArgs} from 'node:util';
import {resolveWorkspace} from './resolver.js';

function renderHelpText(brand: BrandId, version: string): string {
  const manifest = getCapabilityManifest(brand, version);
  const lines: string[] = [
    `${manifest.cliName} (${manifest.packageName}@${manifest.packageVersion})`,
    `Version-matched documentation & API CLI for ${brand === 's2' ? 'React Spectrum S2' : 'React Aria Components & Hooks'}.`,
    '',
    'Commands:'
  ];
  for (const cmd of manifest.commands) {
    lines.push(`  ${cmd.usage}`);
    lines.push(`    ${cmd.summary}`);
  }
  lines.push('');
  lines.push('Common Flags:');
  lines.push(
    '  --cwd <dir>              Resolve workspace dependencies from <dir> (default: process.cwd())'
  );
  lines.push(
    '  --version <spec>         Override package version (e.g. 1.2.0, latest, @react-spectrum/s2@1.2.0)'
  );
  lines.push('  --snapshot <id>          Pin an exact immutable snapshot ID');
  lines.push('  --max-tokens <N>         Bound rendered read output (~4 UTF-8 bytes/token)');
  lines.push('  --cursor <value>         Resume a truncated read for one document');
  lines.push('  --json-content <type>    Read JSON content: entry (default) or markdown');
  lines.push('  --include-resolution    Include full workspace resolution in JSON output');
  lines.push(
    '  --strict-version         Fail instead of warning when an unverified patch falls back to same-minor'
  );
  lines.push('  --offline                Read strictly from local cache without network requests');
  lines.push('  --cache-dir <dir>        Override shared documentation cache directory');
  lines.push('  --snapshot-source <src>  Override snapshot CDN URL or local snapshot directory');
  lines.push('  --json                   Output structured JSON envelope (apiVersion: 1)');
  lines.push('  -h, --help               Show this help text');
  return lines.join('\n') + '\n';
}

function parseLibraryArg(raw: string | undefined): LibraryId | undefined {
  if (!raw) {
    return undefined;
  }
  const lower = raw.toLowerCase();
  if (lower === 's2' || lower === 'spectrum') {
    return 's2';
  }
  if (lower === 'rac' || lower === 'react-aria-components') {
    return 'rac';
  }
  if (lower === 'react-aria' || lower === 'aria') {
    return 'react-aria';
  }
  if (lower === 'react-stately' || lower === 'stately') {
    return 'react-stately';
  }
  if (lower === 'internationalized' || lower === 'i18n') {
    return 'internationalized';
  }
  throw new AgentDocsError(
    'ERR_INVALID_ARGS',
    `Unsupported --library '${raw}'. Expected one of: s2, rac, react-aria, react-stately, internationalized.`,
    EXIT_CODES.INVALID_ARGS
  );
}

function toAgentDocsError(err: unknown): AgentDocsError {
  if (err instanceof AgentDocsError) {
    return err;
  }
  const message = err instanceof Error ? err.message : String(err);
  const nodeCode = (err as {code?: unknown} | null)?.code;
  if (typeof nodeCode === 'string' && nodeCode.startsWith('ERR_PARSE_ARGS')) {
    return new AgentDocsError('ERR_INVALID_ARGS', message, EXIT_CODES.INVALID_ARGS);
  }
  return new AgentDocsError('ERR_INTERNAL', message, EXIT_CODES.INTERNAL_ERROR);
}

function parseIntegerArg(
  flag: string,
  raw: string | undefined,
  min: number,
  max = Number.MAX_SAFE_INTEGER
): number | undefined {
  if (raw === undefined) {
    return undefined;
  }
  const value = Number(raw.trim());
  if (!/^\d+$/.test(raw.trim()) || value < min || value > max) {
    const range = max === Number.MAX_SAFE_INTEGER ? `>= ${min}` : `between ${min} and ${max}`;
    throw new AgentDocsError(
      'ERR_INVALID_ARGS',
      `Invalid ${flag} '${raw}'. Expected an integer ${range}.`,
      EXIT_CODES.INVALID_ARGS
    );
  }
  return value;
}

const VALID_SECTIONS = new Set<SectionFilter>([
  'usage',
  'api',
  'accessibility',
  'styling',
  'testing',
  'guide',
  'all'
]);

function parseSectionsArg(raw: string | undefined): SectionFilter[] | undefined {
  if (!raw) {
    return undefined;
  }
  const items = raw
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean) as SectionFilter[];
  for (const item of items) {
    if (!VALID_SECTIONS.has(item)) {
      throw new AgentDocsError(
        'ERR_INVALID_ARGS',
        `Unsupported section '${item}' in --sections. Allowed: ${Array.from(VALID_SECTIONS).join(', ')}.`,
        EXIT_CODES.INVALID_ARGS
      );
    }
  }
  return items;
}

export async function runAgentDocsCli(
  brand: BrandId,
  packageVersion: string,
  argv: string[] = process.argv.slice(2),
  io: {stdout?: (text: string) => void; stderr?: (text: string) => void} = {}
): Promise<number> {
  const writeOut = io.stdout || ((text: string) => process.stdout.write(text));
  const writeErr = io.stderr || ((text: string) => process.stderr.write(text));
  const defaultLibrary: LibraryId = brand === 's2' ? 's2' : 'rac';
  const cliCommandPrefix = brand === 's2' ? 'spectrum' : 'react-aria';

  let wantJson = argv.includes('--json');

  try {
    const parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      strict: true,
      options: {
        help: {type: 'boolean', short: 'h'},
        version: {type: 'string'},
        'cli-version': {type: 'boolean', short: 'v'},
        json: {type: 'boolean'},
        cwd: {type: 'string'},
        library: {type: 'string'},
        sections: {type: 'string'},
        cursor: {type: 'string'},
        'json-content': {type: 'string'},
        'include-resolution': {type: 'boolean'},
        'max-tokens': {type: 'string'},
        limit: {type: 'string'},
        prop: {type: 'string'},
        export: {type: 'string'},
        'events-only': {type: 'boolean'},
        'render-props': {type: 'boolean'},
        property: {type: 'string'},
        illustrations: {type: 'boolean'},
        snapshot: {type: 'string'},
        'strict-version': {type: 'boolean'},
        offline: {type: 'boolean'},
        'allow-latest': {type: 'boolean'},
        'cache-dir': {type: 'string'},
        'snapshot-source': {type: 'string'}
      }
    });

    wantJson = Boolean(parsed.values.json);
    const [subcommand, ...restPositionals] = parsed.positionals;

    if (parsed.values['cli-version'] && !subcommand) {
      writeOut(`${packageVersion}\n`);
      return EXIT_CODES.OK;
    }

    if (parsed.values.help || !subcommand || subcommand === 'help') {
      writeOut(renderHelpText(brand, packageVersion));
      return EXIT_CODES.OK;
    }

    const common: CommonQueryOptions = {
      cwd: parsed.values.cwd,
      cacheDir: parsed.values['cache-dir'],
      snapshotSource: parsed.values['snapshot-source'],
      offline: Boolean(parsed.values.offline),
      allowLatestFallback: Boolean(parsed.values['allow-latest']),
      strictVersion: Boolean(parsed.values['strict-version']),
      versionOverride: parsed.values.version,
      snapshotOverride: parsed.values.snapshot,
      defaultLibrary
    };
    const includeResolution = parsed.values['include-resolution'];
    const jsonContent = parsed.values['json-content'];
    if (
      jsonContent !== undefined &&
      (subcommand !== 'read' ||
        !wantJson ||
        (jsonContent !== 'entry' && jsonContent !== 'markdown'))
    ) {
      throw new AgentDocsError(
        'ERR_INVALID_ARGS',
        '--json-content must be entry or markdown and requires read --json.',
        EXIT_CODES.INVALID_ARGS
      );
    }

    if (brand !== 's2' && (subcommand === 'tokens' || subcommand === 'icons')) {
      throw new AgentDocsError(
        'ERR_INVALID_ARGS',
        `Unknown command '${subcommand}'. S2 ${subcommand} are available through the 'spectrum' CLI (@react-spectrum/cli).`,
        EXIT_CODES.INVALID_ARGS
      );
    }

    switch (subcommand) {
      case 'manifest': {
        const manifest = getCapabilityManifest(brand, packageVersion);
        if (wantJson || argv.length === 1) {
          writeOut(JSON.stringify(manifest, null, 2) + '\n');
        } else {
          writeOut(JSON.stringify(manifest, null, 2) + '\n');
        }
        return EXIT_CODES.OK;
      }

      case 'resolve': {
        const resolution = await resolveWorkspace(common);
        if (wantJson) {
          writeOut(
            JSON.stringify(
              {
                apiVersion: API_VERSION,
                resolution,
                warnings: resolution.warnings
              },
              null,
              2
            ) + '\n'
          );
        } else {
          writeOut(formatResolutionMarkdown(resolution));
        }
        return EXIT_CODES.OK;
      }

      case 'search': {
        const query = restPositionals.join(' ').trim();
        const limit = parseIntegerArg('--limit', parsed.values.limit, 1, 50);
        const result = await searchDocs({
          ...common,
          query,
          library: parseLibraryArg(parsed.values.library),
          limit,
          cliCommandPrefix
        });
        if (wantJson) {
          writeOut(formatQueryJson(result, includeResolution));
        } else {
          writeOut(formatSearchMarkdown(result));
        }
        return EXIT_CODES.OK;
      }

      case 'read': {
        const maxTokens = parseIntegerArg('--max-tokens', parsed.values['max-tokens'], 1);
        const output: ReadOutputOptions = {
          format: wantJson ? 'json' : 'markdown',
          jsonContent,
          includeResolution
        };
        const result = await readDocs({
          ...common,
          ids: restPositionals,
          sections: parseSectionsArg(parsed.values.sections),
          maxTokens,
          cursor: parsed.values.cursor,
          output,
          cliCommandPrefix
        });
        writeOut(formatReadOutput(result, output));
        const anyOk = result.results.some(r => r.ok);
        return anyOk ? EXIT_CODES.OK : EXIT_CODES.NOT_FOUND;
      }

      case 'api': {
        const id = restPositionals[0];
        if (!id) {
          throw new AgentDocsError(
            'ERR_INVALID_ARGS',
            `Usage: ${cliCommandPrefix} api <id> [--export Name] [--prop filter]`,
            EXIT_CODES.INVALID_ARGS
          );
        }
        const result = await queryApi({
          ...common,
          id,
          exportName: parsed.values.export,
          propFilter: parsed.values.prop,
          eventsOnly: Boolean(parsed.values['events-only']),
          renderPropsOnly: Boolean(parsed.values['render-props'])
        });
        if (wantJson) {
          writeOut(formatQueryJson(result, includeResolution));
        } else {
          writeOut(result.markdown);
        }
        return EXIT_CODES.OK;
      }

      case 'tokens': {
        const query = restPositionals.join(' ').trim() || undefined;
        const result = await queryTokens({
          ...common,
          query,
          propertyFilter: parsed.values.property
        });
        if (wantJson) {
          writeOut(formatQueryJson(result, includeResolution));
        } else {
          writeOut(result.markdown);
        }
        return EXIT_CODES.OK;
      }

      case 'icons': {
        const result = await queryIcons({
          ...common,
          terms: restPositionals,
          illustrations: Boolean(parsed.values.illustrations)
        });
        if (wantJson) {
          writeOut(formatQueryJson(result, includeResolution));
        } else {
          writeOut(result.markdown);
        }
        return EXIT_CODES.OK;
      }

      case 'prefetch': {
        const result = await prefetchDocs(common);
        if (wantJson) {
          writeOut(formatQueryJson(result, includeResolution));
        } else {
          writeOut(formatPrefetchMarkdown(result));
        }
        return EXIT_CODES.OK;
      }

      default:
        throw new AgentDocsError(
          'ERR_INVALID_ARGS',
          `Unknown command '${subcommand}'. Run '${cliCommandPrefix} --help' for usage.`,
          EXIT_CODES.INVALID_ARGS
        );
    }
  } catch (err) {
    const agentErr = toAgentDocsError(err);

    if (wantJson) {
      writeOut(
        JSON.stringify(
          {
            apiVersion: API_VERSION,
            ok: false,
            error: {
              code: agentErr.code,
              message: agentErr.message,
              suggestions: agentErr.suggestions,
              details: agentErr.details
            }
          },
          null,
          2
        ) + '\n'
      );
    } else {
      writeErr(`[${agentErr.code}] ${agentErr.message}\n`);
      if (agentErr.suggestions && agentErr.suggestions.length > 0) {
        writeErr(`Available / suggested: ${agentErr.suggestions.join(', ')}\n`);
      }
    }
    return agentErr.exitCode;
  }
}
