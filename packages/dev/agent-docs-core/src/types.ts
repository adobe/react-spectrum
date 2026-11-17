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

export const API_VERSION = 1 as const;
export const READER_SCHEMA_VERSION = 1 as const;
export const DEFAULT_SNAPSHOT_CDN_URL = 'https://react-spectrum.adobe.com/snapshots';

export type BrandId = 's2' | 'rac';
export type LibraryId = 's2' | 'rac' | 'react-aria' | 'react-stately' | 'internationalized';

export const EXIT_CODES = {
  OK: 0,
  INTERNAL_ERROR: 1,
  INVALID_ARGS: 2,
  NOT_FOUND: 3,
  OFFLINE_OR_NETWORK: 4,
  INTEGRITY_OR_SCHEMA: 5
} as const;

export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];

export class AgentDocsError extends Error {
  readonly code: string;
  readonly exitCode: ExitCode;
  readonly suggestions?: string[];
  readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    exitCode: ExitCode = EXIT_CODES.INVALID_ARGS,
    options?: {suggestions?: string[]; details?: Record<string, unknown>}
  ) {
    super(message);
    this.name = 'AgentDocsError';
    this.code = code;
    this.exitCode = exitCode;
    this.suggestions = options?.suggestions;
    this.details = options?.details;
  }
}

export interface DocWarning {
  code: string;
  message: string;
  packageName?: string;
  details?: Record<string, unknown>;
}

export interface PackageSlicePointer {
  packageName: string;
  packageVersion: string;
  snapshotId: string;
  docRevision: number;
  schemaVersion: number;
  minReaderSchemaVersion: number;
  docsLayout: string;
  entryCount: number;
  sliceRelPath: string;
  sliceSha256: string;
  sliceBytes: number;
  verifiedEquivalentPatches: string[];
}

export interface SnapshotSummaryInfo {
  snapshotId: string;
  docRevision: number;
  sourceTag: string | null;
  sourceCommit: string;
  extractorCommit: string;
  docsLayouts: Record<string, string>;
  packages: Record<string, string>;
  manifestPath: string;
  manifestSha256?: string;
  manifestBytes?: number;
  catalogPath: string;
  catalogSha256: string;
  catalogBytes: number;
}

export interface SnapshotManifest {
  schemaVersion: number;
  minReaderSchemaVersion: number;
  snapshotId: string;
  slices: Record<string, PackageSlicePointer>;
}

export interface SnapshotIndex {
  schemaVersion: number;
  minReaderSchemaVersion: number;
  updatedAt: string;
  latest: Record<string, string>;
  packages: Record<string, Record<string, PackageSlicePointer>>;
  snapshots: Record<string, SnapshotSummaryInfo>;
}

export interface PropIR {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description: string;
  inheritedFrom?: string;
}

export interface RenderPropIR {
  name: string;
  type: string;
  selector?: string;
  description: string;
}

export interface GenericParamIR {
  name: string;
  constraint?: string;
  defaultType?: string;
}

export interface ExportApiIR {
  name: string;
  exportKind: 'component' | 'hook' | 'function' | 'class' | 'interface' | 'type';
  typeParameters: GenericParamIR[];
  props: PropIR[];
  events: PropIR[];
  renderProps: RenderPropIR[];
  slots: string[];
  callSignatures: Array<{
    signature: string;
    parameters: Array<{name: string; type: string; optional: boolean; description: string}>;
    returnType: string;
  }>;
  constraints: Array<{
    kind: 'controlled-pair' | 'mutual-exclusion' | 'style-restriction';
    props: string[];
    description: string;
  }>;
  typeText?: string;
  description?: string;
}

export interface ImportPatternIR {
  preferred: string;
  alternative: string | null;
  supportsSubpathExports: boolean;
}

export interface CatalogExampleIR {
  title: string;
  section: string;
  lang: string;
  code: string;
}

export interface CatalogSectionIR {
  id: string;
  heading: string;
  category: 'usage' | 'api' | 'accessibility' | 'styling' | 'testing' | 'guide';
  level?: number;
  markdown: string;
}

export interface CatalogEntryIR {
  schemaVersion: number;
  id: string;
  slug: string;
  library: LibraryId;
  packageName: string;
  packageVersion: string;
  kind: string;
  title: string;
  summary: string;
  keywords: string[];
  sourceUrl: string;
  imports: string[];
  compositionRules: string[];
  exports: ExportApiIR[];
  sections: CatalogSectionIR[];
}

export interface SearchIndexRecord {
  id: string;
  slug: string;
  library: LibraryId;
  packageName: string;
  packageVersion: string;
  kind: string;
  title: string;
  summary: string;
  keywords: string[];
  exports: string[];
  imports: string[];
  sourceUrl: string;
}

export interface S2Assets {
  schemaVersion: number;
  packageName: string;
  packageVersion: string;
  icons: string[];
  iconAliases: Record<string, string[]>;
  illustrations: Array<{id: string; subpath: string}>;
  styleMacro: {
    categories: Record<
      string,
      Record<
        string,
        {
          values?: string[];
          additionalTypes?: string[];
          mapping?: Record<string, string>;
          description?: string;
        }
      >
    >;
    spacingScale: Record<string, Array<string | number>>;
  };
}

export interface PackageInstanceResolution {
  packageName: string;
  version: string;
  importer: 'workspace' | string;
  source: 'installed' | 'lockfile' | 'override' | 'latest-fallback';
  resolvedPath?: string;
}

export interface ResolvedPackageProvenance {
  packageName: string;
  packageVersion: string;
  requestedVersion: string;
  importer: 'workspace' | string;
  source: 'installed' | 'lockfile' | 'override' | 'latest-fallback';
  snapshotId: string;
  exactMatch: boolean;
  matchedViaVerifiedPatch?: string;
  slicePath: string;
  sliceSha256: string;
  availableVersions?: string[];
}

export interface ResolutionState {
  cwd: string;
  workspaceDir: string | null;
  workspacePackageName: string | null;
  lockfilePath: string | null;
  lockfileKind: 'npm' | 'yarn-berry' | 'yarn-classic' | 'pnpm' | 'unsupported' | null;
  packages: Record<string, ResolvedPackageProvenance>;
  instances: PackageInstanceResolution[];
  warnings: DocWarning[];
}

export interface SnapshotEnvelopeRef {
  snapshotId: string;
  schemaVersion: number;
  sourceTag: string | null;
  sourceCommit: string;
  docRevision: number;
  packages: Record<string, string>;
}

export type SectionFilter =
  | 'usage'
  | 'api'
  | 'accessibility'
  | 'styling'
  | 'testing'
  | 'guide'
  | 'all';

export interface CommonQueryOptions {
  cwd?: string;
  resolution?: ResolutionState;
  cacheDir?: string;
  snapshotSource?: string;
  offline?: boolean;
  allowLatestFallback?: boolean;
  strictVersion?: boolean;
  versionOverride?: string;
  snapshotOverride?: string;
  defaultLibrary?: LibraryId;
}

export interface SearchHit {
  id: string;
  title: string;
  kind: string;
  library: LibraryId;
  summary: string;
  score: number;
  exports: string[];
  sourceUrl: string;
  provenance: {
    packageName: string;
    packageVersion: string;
    snapshotId: string;
    exactMatch: boolean;
  };
  followUpCommands: string[];
}

export interface SearchDocsResult {
  apiVersion: typeof API_VERSION;
  query: string;
  libraryFilter: LibraryId | null;
  snapshots: Record<string, SnapshotEnvelopeRef>;
  resolution: ResolutionState;
  warnings: DocWarning[];
  /** Context flags that every `followUpCommands` entry ends with; empty when there are none. */
  followUpFlags: string;
  results: SearchHit[];
}

export type ReadItemResult =
  | {
      requestedId: string;
      ok: true;
      id: string;
      provenance: {
        packageName: string;
        packageVersion: string;
        snapshotId: string;
        exactMatch: boolean;
        sourceUrl: string;
      };
      entry: CatalogEntryIR;
      markdown: string;
      includedSections: string[];
      omittedSections: string[];
      truncated: boolean;
      nextCursor?: string;
      continueCommand?: string;
    }
  | {
      requestedId: string;
      ok: false;
      error: {
        code: string;
        message: string;
        suggestions?: string[];
      };
    };

export interface ReadDocsResult {
  apiVersion: typeof API_VERSION;
  snapshots: Record<string, SnapshotEnvelopeRef>;
  resolution: ResolutionState;
  warnings: DocWarning[];
  results: ReadItemResult[];
}

export interface ApiDocsResult {
  apiVersion: typeof API_VERSION;
  requestedId: string;
  resolvedId: string;
  provenance: {
    packageName: string;
    packageVersion: string;
    snapshotId: string;
    exactMatch: boolean;
    sourceUrl: string;
  };
  snapshots: Record<string, SnapshotEnvelopeRef>;
  resolution: ResolutionState;
  warnings: DocWarning[];
  imports: string[];
  exports: ExportApiIR[];
  markdown: string;
}

export interface TokensDocsResult {
  apiVersion: typeof API_VERSION;
  query: string | null;
  propertyFilter: string | null;
  provenance: {
    packageName: string;
    packageVersion: string;
    snapshotId: string;
    exactMatch: boolean;
  };
  snapshots: Record<string, SnapshotEnvelopeRef>;
  resolution: ResolutionState;
  warnings: DocWarning[];
  properties: Array<{
    property: string;
    description: string;
    matchedValues: string[];
    totalValueCount: number;
  }>;
  markdown: string;
}

export interface IconsDocsResult {
  apiVersion: typeof API_VERSION;
  terms: string[];
  assetKind: 'icons' | 'illustrations';
  provenance: {
    packageName: string;
    packageVersion: string;
    snapshotId: string;
    exactMatch: boolean;
  };
  snapshots: Record<string, SnapshotEnvelopeRef>;
  resolution: ResolutionState;
  warnings: DocWarning[];
  matches: string[];
  /** Search terms that matched no asset name or alias. */
  unmatchedTerms: string[];
  importExample: string;
  markdown: string;
}

export interface PrefetchDocsResult {
  apiVersion: typeof API_VERSION;
  cacheDir: string;
  resolution: ResolutionState;
  warnings: DocWarning[];
  prefetchedSlices: Array<{
    packageName: string;
    packageVersion: string;
    snapshotId: string;
    sliceSha256: string;
    localDir: string;
  }>;
}

export interface CliCapabilityManifest {
  apiVersion: typeof API_VERSION;
  readerSchemaVersion: typeof READER_SCHEMA_VERSION;
  cliName: string;
  packageName: string;
  packageVersion: string;
  defaultLibrary: LibraryId;
  supportedSnapshotSchemaVersions: number[];
  commands: Array<{
    name: string;
    summary: string;
    usage: string;
    flags: string[];
  }>;
  exitCodes: Record<string, number>;
}
