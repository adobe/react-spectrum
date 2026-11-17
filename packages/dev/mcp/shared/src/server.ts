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
  CommonQueryOptions,
  EVERGREEN_SKILL_METADATA,
  EvergreenSkillBrand,
  EXIT_CODES,
  formatQueryJson,
  formatReadOutput,
  formatSearchMarkdown,
  getEvergreenSkillMarkdown,
  LibraryId,
  queryApi,
  queryIcons,
  queryTokens,
  readDocs,
  ReadOutputOptions,
  ResolutionState,
  resolveWorkspace,
  searchDocs,
  SectionFilter
} from '../../../agent-docs-core/src/index.js';
import {dirname, join, parse} from 'path';
import {existsSync} from 'fs';
import {fileURLToPath} from 'url';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {z} from 'zod';

export type ServerBrand = EvergreenSkillBrand;

export interface StartServerOptions {
  defaultCwd?: string;
}

const LIBRARY_ENUM = z.enum(['s2', 'rac', 'react-aria', 'react-stately', 'internationalized']);
const SECTION_ENUM = z.enum([
  'usage',
  'api',
  'accessibility',
  'styling',
  'testing',
  'guide',
  'all'
]);
const FORMAT_ENUM = z.enum(['markdown', 'json']);

const VERSION_SOURCE_ENUM = z.enum(['installed', 'lockfile', 'override', 'latest-fallback']);
const RESOLUTION_SCHEMA = z.object({
  cwd: z.string(),
  workspaceDir: z.string().nullable(),
  workspacePackageName: z.string().nullable(),
  lockfilePath: z.string().nullable(),
  lockfileKind: z.enum(['npm', 'yarn-berry', 'yarn-classic', 'pnpm', 'unsupported']).nullable(),
  packages: z.record(
    z.string(),
    z.object({
      packageName: z.string(),
      packageVersion: z.string(),
      requestedVersion: z.string(),
      importer: z.string(),
      source: VERSION_SOURCE_ENUM,
      snapshotId: z.string(),
      exactMatch: z.boolean(),
      matchedViaVerifiedPatch: z.string().optional(),
      slicePath: z.string(),
      sliceSha256: z.string(),
      availableVersions: z.array(z.string()).optional()
    })
  ),
  instances: z.array(
    z.object({
      packageName: z.string(),
      version: z.string(),
      importer: z.string(),
      source: VERSION_SOURCE_ENUM,
      resolvedPath: z.string().optional()
    })
  ),
  warnings: z.array(
    z.object({
      code: z.string(),
      message: z.string(),
      packageName: z.string().optional(),
      details: z.record(z.string(), z.unknown()).optional()
    })
  )
});

function findNearestPackageJsonDir(startDir: string): string | null {
  let current = startDir;
  const root = parse(current).root;
  while (true) {
    if (existsSync(join(current, 'package.json'))) {
      return current;
    }
    if (current === root) {
      return null;
    }
    current = dirname(current);
  }
}

function serializePackageVersionsOverride(
  packageVersions?: Record<string, string>,
  version?: string
): string | undefined {
  if (packageVersions && Object.keys(packageVersions).length > 0) {
    return Object.entries(packageVersions)
      .map(([pkg, ver]) => (pkg === '*' ? ver : `${pkg}@${ver}`))
      .join(',');
  }
  if (version && version.trim()) {
    return version.trim();
  }
  return undefined;
}

function fileUriToPathSafe(uri: string): string | null {
  if (!uri.startsWith('file://')) {
    return null;
  }
  try {
    return fileURLToPath(uri);
  } catch {
    return null;
  }
}

async function discoverMcpClientRoots(server: McpServer): Promise<string[]> {
  const caps = server.server.getClientCapabilities();
  if (!caps?.roots) {
    return [];
  }
  try {
    const res = await server.server.listRoots();
    const paths: string[] = [];
    for (const root of res.roots || []) {
      const fsPath = fileUriToPathSafe(root.uri);
      if (fsPath) {
        paths.push(fsPath);
      }
    }
    return paths;
  } catch {
    return [];
  }
}

async function resolveMcpQueryOptions(
  server: McpServer,
  defaultLibrary: LibraryId,
  serverDefaultCwd: string | undefined,
  toolArgs: {
    cwd?: string;
    version?: string;
    packageVersions?: Record<string, string>;
    snapshot?: string;
    resolution?: unknown;
    offline?: boolean;
  }
): Promise<CommonQueryOptions> {
  const versionOverride = serializePackageVersionsOverride(
    toolArgs.packageVersions,
    toolArgs.version
  );

  // 1. Reusable `resolution` object from a prior `resolve_versions` call
  if (toolArgs.resolution !== undefined) {
    if (toolArgs.cwd || versionOverride || toolArgs.snapshot) {
      throw new AgentDocsError(
        'ERR_INVALID_ARGS',
        "'resolution' cannot be combined with 'cwd', 'version', 'packageVersions', or 'snapshot'. Pass either a resolution from resolve_versions or the workspace/version arguments.",
        EXIT_CODES.INVALID_ARGS
      );
    }
    const parsed = RESOLUTION_SCHEMA.safeParse(toolArgs.resolution);
    if (!parsed.success) {
      throw new AgentDocsError(
        'ERR_INVALID_ARGS',
        `Invalid 'resolution' object; pass the value returned by resolve_versions unmodified. ${parsed.error.message}`,
        EXIT_CODES.INVALID_ARGS
      );
    }
    return {
      resolution: parsed.data as ResolutionState,
      offline: toolArgs.offline,
      defaultLibrary
    };
  }

  // 2. Explicit `cwd` or explicit version/snapshot override in tool arguments
  if (toolArgs.cwd || versionOverride || toolArgs.snapshot) {
    return {
      cwd: toolArgs.cwd || serverDefaultCwd || process.cwd(),
      versionOverride,
      snapshotOverride: toolArgs.snapshot,
      offline: toolArgs.offline,
      defaultLibrary
    };
  }

  // 3. Server-level `--cwd` or `RSP_WORKSPACE_ROOT`
  const configuredRoot = serverDefaultCwd || process.env.RSP_WORKSPACE_ROOT;
  if (configuredRoot) {
    return {
      cwd: configuredRoot,
      offline: toolArgs.offline,
      defaultLibrary
    };
  }

  // 4. MCP `roots/list` workspace discovery
  const clientRoots = await discoverMcpClientRoots(server);
  if (clientRoots.length === 1) {
    return {
      cwd: clientRoots[0],
      offline: toolArgs.offline,
      defaultLibrary
    };
  }
  if (clientRoots.length > 1) {
    const candidateResolutions: Array<{root: string; state: ResolutionState}> = [];
    for (const root of clientRoots) {
      try {
        const state = await resolveWorkspace({
          cwd: root,
          offline: toolArgs.offline,
          defaultLibrary
        });
        candidateResolutions.push({root, state});
      } catch {
        // Root does not contain Spectrum/Aria dependencies
      }
    }
    if (candidateResolutions.length === 1) {
      return {
        resolution: candidateResolutions[0].state,
        offline: toolArgs.offline,
        defaultLibrary
      };
    }
    if (candidateResolutions.length > 1) {
      throw new AgentDocsError(
        'ERR_AMBIGUOUS_WORKSPACE_ROOTS',
        `Multiple MCP workspace roots contain React Spectrum / React Aria dependencies (${candidateResolutions.map(c => c.root).join(', ')}). Pass 'cwd' explicitly to select the target workspace.`,
        EXIT_CODES.INVALID_ARGS
      );
    }
  }

  // 5. Fallback to process.cwd() only when inside a project directory
  const processProjectDir = findNearestPackageJsonDir(process.cwd());
  if (processProjectDir) {
    return {
      cwd: process.cwd(),
      offline: toolArgs.offline,
      defaultLibrary
    };
  }

  throw new AgentDocsError(
    'ERR_WORKSPACE_REQUIRED',
    'Could not determine target workspace automatically over stdio. Pass `cwd` pointing to your project directory, or pass `version: "latest"` / `packageVersions`.',
    EXIT_CODES.INVALID_ARGS
  );
}

function toolSuccessText(text: string) {
  return {
    content: [{type: 'text' as const, text}]
  };
}

function toolErrorResult(err: unknown) {
  const payload =
    err instanceof AgentDocsError
      ? {
          apiVersion: API_VERSION,
          ok: false,
          error: {
            code: err.code,
            message: err.message,
            details: err.details
          }
        }
      : {
          apiVersion: API_VERSION,
          ok: false,
          error: {
            code: 'ERR_MCP_TOOL_FAILURE',
            message: err instanceof Error ? err.message : String(err)
          }
        };
  return {
    isError: true,
    content: [{type: 'text' as const, text: JSON.stringify(payload, null, 2)}]
  };
}

export async function createAgentDocsMcpServer(
  brand: ServerBrand,
  version: string,
  options: StartServerOptions = {}
): Promise<McpServer> {
  const isS2 = brand === 's2';
  const defaultLibrary: LibraryId = isS2 ? 's2' : 'rac';
  const skillMeta = EVERGREEN_SKILL_METADATA[brand];
  const serverName = isS2 ? '@react-spectrum/mcp' : '@react-aria/mcp';

  const server = new McpServer(
    {name: serverName, version},
    {
      instructions: `Version-aware documentation and API server for ${isS2 ? 'React Spectrum S2 and React Aria' : 'React Aria Components, hooks, React Stately, and @internationalized/*'}. Prefer batched 'read_docs' and 'search_docs'; pass 'cwd' when working across multiple workspace roots.`
    }
  );

  // Opportunistic SEP-2640 Skills-over-MCP resource
  server.registerResource(
    skillMeta.name,
    skillMeta.resourceUri,
    {
      title: `${isS2 ? 'React Spectrum S2' : 'React Aria'} Agent Skill`,
      description: skillMeta.description,
      mimeType: 'text/markdown'
    },
    async uri => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'text/markdown',
          text: getEvergreenSkillMarkdown(brand)
        }
      ]
    })
  );

  const commonContextSchema = {
    cwd: z
      .string()
      .optional()
      .describe(
        'Path to the target application or workspace directory for exact version resolution.'
      ),
    version: z
      .string()
      .optional()
      .describe(
        'Optional explicit version override (e.g. "latest" or "@react-spectrum/s2@1.8.2").'
      ),
    packageVersions: z
      .record(z.string(), z.string())
      .optional()
      .describe('Optional map of package names to exact semver versions (or "latest").'),
    snapshot: z.string().optional().describe('Optional immutable snapshotId override.'),
    resolution: RESOLUTION_SCHEMA.optional().describe(
      'Optional reusable resolution state returned by resolve_versions. Pass it unmodified; do not combine with cwd, version, packageVersions, or snapshot.'
    ),
    includeResolution: z
      .boolean()
      .optional()
      .describe('Include full workspace resolution in JSON output.'),
    offline: z.boolean().optional().describe('Use only cached snapshots without network requests.')
  };

  server.registerTool(
    'resolve_versions',
    {
      title: 'Resolve workspace package versions',
      description:
        'Resolves exact installed or lockfile package versions for the workspace and returns a reusable resolution object plus matched documentation snapshot provenance.',
      inputSchema: {
        cwd: commonContextSchema.cwd,
        version: commonContextSchema.version,
        packageVersions: commonContextSchema.packageVersions,
        snapshot: commonContextSchema.snapshot,
        offline: commonContextSchema.offline
      },
      annotations: {readOnlyHint: true}
    },
    async args => {
      try {
        const queryOpts = await resolveMcpQueryOptions(
          server,
          defaultLibrary,
          options.defaultCwd,
          args
        );
        const resolution = await resolveWorkspace(queryOpts);
        return toolSuccessText(
          JSON.stringify(
            {
              apiVersion: API_VERSION,
              ok: true,
              resolution,
              warnings: resolution.warnings
            },
            null,
            2
          )
        );
      } catch (err) {
        return toolErrorResult(err);
      }
    }
  );

  server.registerTool(
    'search_docs',
    {
      title: 'Search version-matched documentation',
      description:
        'Searches components, guides, hooks, utilities, and testing documentation matched to the workspace package versions.',
      inputSchema: {
        query: z.string().min(1).describe('Natural-language or identifier search query.'),
        library: LIBRARY_ENUM.optional().describe('Optional library namespace filter.'),
        limit: z.number().int().min(1).max(50).optional().describe('Maximum results (default 10).'),
        format: FORMAT_ENUM.optional().describe('Output format: "markdown" (default) or "json".'),
        ...commonContextSchema
      },
      annotations: {readOnlyHint: true}
    },
    async args => {
      try {
        const queryOpts = await resolveMcpQueryOptions(
          server,
          defaultLibrary,
          options.defaultCwd,
          args
        );
        const res = await searchDocs({
          ...queryOpts,
          query: args.query,
          library: args.library,
          limit: args.limit
        });
        return toolSuccessText(
          args.format === 'json'
            ? formatQueryJson(res, args.includeResolution)
            : formatSearchMarkdown(res)
        );
      } catch (err) {
        return toolErrorResult(err);
      }
    }
  );

  server.registerTool(
    'read_docs',
    {
      title: 'Batch-read version-matched documentation and APIs',
      description:
        'Reads one or more component, guide, hook, or testing entries in a single call, matched to the workspace package versions. Supports section filtering and partial-batch error reporting.',
      inputSchema: {
        ids: z
          .union([z.string(), z.array(z.string()).min(1)])
          .describe(
            'One or more entry IDs, e.g. ["s2:guide/implementation-guidance", "s2:ComboBox"].'
          ),
        sections: z
          .array(SECTION_ENUM)
          .optional()
          .describe('Optional section filter (e.g. ["usage", "api", "accessibility"]).'),
        maxTokens: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe('Optional budget for the rendered output (~4 UTF-8 bytes per token).'),
        cursor: z
          .string()
          .min(1)
          .optional()
          .describe(
            'Resume one document with its nextCursor and the same section and version options.'
          ),
        jsonContent: z
          .enum(['entry', 'markdown'])
          .optional()
          .describe('Content for JSON output: structured entry (default) or rendered Markdown.'),
        format: FORMAT_ENUM.optional().describe('Output format: "markdown" (default) or "json".'),
        ...commonContextSchema
      },
      annotations: {readOnlyHint: true}
    },
    async args => {
      try {
        const queryOpts = await resolveMcpQueryOptions(
          server,
          defaultLibrary,
          options.defaultCwd,
          args
        );
        const ids = Array.isArray(args.ids) ? args.ids : [args.ids];
        const output: ReadOutputOptions = {
          format: args.format ?? 'markdown',
          jsonContent: args.jsonContent,
          includeResolution: args.includeResolution,
          continuation: 'cursor'
        };
        const res = await readDocs({
          ...queryOpts,
          ids,
          sections: args.sections as SectionFilter[] | undefined,
          maxTokens: args.maxTokens,
          cursor: args.cursor,
          output
        });
        return toolSuccessText(formatReadOutput(res, output));
      } catch (err) {
        return toolErrorResult(err);
      }
    }
  );

  server.registerTool(
    'get_component_api',
    {
      title: 'Get version-matched TypeScript component/hook API',
      description:
        'Returns exact imports, TypeScript props, events, render props, slots, type parameters, and defaults for a component or hook in the workspace version.',
      inputSchema: {
        id: z
          .string()
          .min(1)
          .describe('Component or hook ID, e.g. "s2:ComboBox" or "rac:ComboBox".'),
        exportName: z
          .string()
          .optional()
          .describe('Optional specific sub-export name (e.g. "ComboBoxItem").'),
        props: z
          .array(z.string())
          .optional()
          .describe('Optional list of prop/event names to filter.'),
        format: FORMAT_ENUM.optional().describe('Output format: "markdown" (default) or "json".'),
        ...commonContextSchema
      },
      annotations: {readOnlyHint: true}
    },
    async args => {
      try {
        const queryOpts = await resolveMcpQueryOptions(
          server,
          defaultLibrary,
          options.defaultCwd,
          args
        );
        const res = await queryApi({
          ...queryOpts,
          id: args.id,
          exportName: args.exportName,
          propFilter: args.props ? args.props.join(',') : undefined
        });
        return toolSuccessText(
          args.format === 'json' ? formatQueryJson(res, args.includeResolution) : res.markdown
        );
      } catch (err) {
        return toolErrorResult(err);
      }
    }
  );

  if (isS2) {
    server.registerTool(
      'search_s2_tokens',
      {
        title: 'Search Spectrum 2 style macro properties and design tokens',
        description:
          'Searches version-matched Spectrum 2 style macro properties and allowed design token values.',
        inputSchema: {
          query: z
            .string()
            .optional()
            .describe('Search term across style properties and token values.'),
          property: z
            .string()
            .optional()
            .describe('Exact style macro property name (e.g. "backgroundColor").'),
          format: FORMAT_ENUM.optional().describe('Output format: "markdown" (default) or "json".'),
          ...commonContextSchema
        },
        annotations: {readOnlyHint: true}
      },
      async args => {
        try {
          const queryOpts = await resolveMcpQueryOptions(
            server,
            defaultLibrary,
            options.defaultCwd,
            args
          );
          const res = await queryTokens({
            ...queryOpts,
            query: args.query,
            propertyFilter: args.property
          });
          return toolSuccessText(
            args.format === 'json' ? formatQueryJson(res, args.includeResolution) : res.markdown
          );
        } catch (err) {
          return toolErrorResult(err);
        }
      }
    );

    server.registerTool(
      'search_s2_icons',
      {
        title: 'Search Spectrum 2 workflow icons and illustrations',
        description:
          'Searches version-matched Spectrum 2 workflow icons or illustrations by name or semantic alias.',
        inputSchema: {
          query: z
            .union([z.string(), z.array(z.string()).min(1)])
            .describe('One or more icon/illustration search terms.'),
          kind: z
            .enum(['icons', 'illustrations'])
            .optional()
            .describe('Asset set to search: "icons" (default) or "illustrations".'),
          format: FORMAT_ENUM.optional().describe('Output format: "markdown" (default) or "json".'),
          ...commonContextSchema
        },
        annotations: {readOnlyHint: true}
      },
      async args => {
        try {
          const queryOpts = await resolveMcpQueryOptions(
            server,
            defaultLibrary,
            options.defaultCwd,
            args
          );
          const terms = Array.isArray(args.query) ? args.query : [args.query];
          const res = await queryIcons({
            ...queryOpts,
            terms,
            illustrations: args.kind === 'illustrations'
          });
          return toolSuccessText(
            args.format === 'json' ? formatQueryJson(res, args.includeResolution) : res.markdown
          );
        } catch (err) {
          return toolErrorResult(err);
        }
      }
    );
  }

  return server;
}

export async function startServer(
  brand: ServerBrand,
  version = '2.0.0',
  options: StartServerOptions = {}
): Promise<McpServer> {
  const server = await createAgentDocsMcpServer(brand, version, options);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  return server;
}
