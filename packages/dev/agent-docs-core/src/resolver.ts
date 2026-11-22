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
  CommonQueryOptions,
  DocWarning,
  EXIT_CODES,
  LibraryId,
  PackageInstanceResolution,
  PackageSlicePointer,
  ResolutionState,
  ResolvedPackageProvenance,
  SnapshotIndex
} from './types.js';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import {loadSnapshotIndex, loadSnapshotManifest} from './cache.js';
import path from 'node:path';
import {resolveFromWorkspaceLockfile} from './lockfiles.js';

export const DOCUMENTED_PACKAGES = [
  '@react-spectrum/s2',
  'react-aria-components',
  'react-aria',
  'react-stately',
  '@internationalized/date',
  '@internationalized/number'
] as const;

export const LIBRARY_TO_PACKAGES: Record<LibraryId, string[]> = {
  s2: ['@react-spectrum/s2'],
  rac: ['react-aria-components'],
  'react-aria': ['react-aria'],
  'react-stately': ['react-stately'],
  internationalized: ['@internationalized/date', '@internationalized/number']
};

function findNearestPackageJson(startDir: string): string | null {
  let curr = path.resolve(startDir);
  while (true) {
    const candidate = path.join(curr, 'package.json');
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(curr);
    if (parent === curr) {
      return null;
    }
    curr = parent;
  }
}

function findPackageJsonForResolvedModule(
  resolvedEntryPath: string,
  expectedName: string
): string | null {
  let curr = path.dirname(resolvedEntryPath);
  while (true) {
    const pkgJsonPath = path.join(curr, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        if (parsed.name === expectedName && typeof parsed.version === 'string') {
          return pkgJsonPath;
        }
      } catch {
        // continue walking upward
      }
    }
    const parent = path.dirname(curr);
    if (parent === curr) {
      return null;
    }
    curr = parent;
  }
}

function resolveInstalledPackageFromAnchor(
  anchorPkgJsonPath: string,
  pkgName: string
): {version: string; pkgJsonPath: string} | null {
  const req = createRequire(anchorPkgJsonPath);
  try {
    const directPkgJson = req.resolve(`${pkgName}/package.json`);
    const parsed = JSON.parse(fs.readFileSync(directPkgJson, 'utf8'));
    if (parsed.name === pkgName && typeof parsed.version === 'string') {
      return {version: parsed.version, pkgJsonPath: directPkgJson};
    }
  } catch {
    // Package may restrict `./package.json` in `exports`; fall back to main entry resolution
  }

  try {
    const mainEntry = req.resolve(pkgName);
    const foundPkgJson = findPackageJsonForResolvedModule(mainEntry, pkgName);
    if (foundPkgJson) {
      const parsed = JSON.parse(fs.readFileSync(foundPkgJson, 'utf8'));
      return {version: parsed.version, pkgJsonPath: foundPkgJson};
    }
  } catch {
    // Not installed relative to this importer anchor
  }

  return null;
}

interface ParsedSemver {
  major: number;
  minor: number;
  patch: number;
  prerelease: string[];
}

function parseSemverTuple(ver: string): ParsedSemver | null {
  const m = ver.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+.*)?$/);
  if (!m) {
    return null;
  }
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    prerelease: m[4] ? m[4].split('.') : []
  };
}

function comparePrereleaseAsc(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) {
    return 0;
  }
  if (a.length === 0) {
    return 1;
  }
  if (b.length === 0) {
    return -1;
  }
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] === b[i]) {
      continue;
    }
    const aNum = /^\d+$/.test(a[i]);
    const bNum = /^\d+$/.test(b[i]);
    if (aNum && bNum) {
      return Number(a[i]) - Number(b[i]);
    }
    if (aNum !== bNum) {
      return aNum ? -1 : 1;
    }
    return a[i].localeCompare(b[i]);
  }
  return a.length - b.length;
}

export function compareSemverAsc(a: string, b: string): number {
  const pa = parseSemverTuple(a);
  const pb = parseSemverTuple(b);
  if (!pa || !pb) {
    return a.localeCompare(b);
  }
  if (pa.major !== pb.major) {
    return pa.major - pb.major;
  }
  if (pa.minor !== pb.minor) {
    return pa.minor - pb.minor;
  }
  if (pa.patch !== pb.patch) {
    return pa.patch - pb.patch;
  }
  return comparePrereleaseAsc(pa.prerelease, pb.prerelease);
}

export function compareSemverDesc(a: string, b: string): number {
  return compareSemverAsc(b, a);
}

/**
 * Matches an exact requested package version against published per-package snapshot slices.
 * Never silently substitutes `HEAD`/`latest` for an unavailable historical version.
 */
export function matchPackageSliceInIndex(
  index: SnapshotIndex,
  packageName: string,
  requestedVersion: string,
  options: {
    strictVersion?: boolean;
    snapshotOverride?: string;
    snapshotSlices?: Record<string, PackageSlicePointer>;
  } = {}
): {
  pointer: PackageSlicePointer;
  matchedVersion: string;
  exactMatch: boolean;
  matchedViaVerifiedPatch?: string;
  warning?: DocWarning;
  availableVersions: string[];
} {
  const pkgMap = index.packages[packageName] || {};
  const availableVersions = Object.keys(pkgMap).sort(compareSemverDesc);

  if (options.snapshotOverride) {
    const pointer = options.snapshotSlices
      ? options.snapshotSlices[packageName]
      : Object.values(pkgMap).find(ptr => ptr.snapshotId === options.snapshotOverride);
    if (!pointer) {
      throw new AgentDocsError(
        'ERR_SNAPSHOT_NOT_FOUND',
        `Snapshot '${options.snapshotOverride}' does not contain package '${packageName}'. Available versions: ${availableVersions.join(', ') || 'none'}.`,
        EXIT_CODES.NOT_FOUND,
        {suggestions: availableVersions}
      );
    }
    return {
      pointer,
      matchedVersion: pointer.packageVersion,
      exactMatch: pointer.packageVersion === requestedVersion,
      availableVersions
    };
  }

  // 1. Exact version slice match
  if (pkgMap[requestedVersion]) {
    return {
      pointer: pkgMap[requestedVersion],
      matchedVersion: requestedVersion,
      exactMatch: true,
      availableVersions
    };
  }

  // 2. Verified equivalent patch match (surface-identical API + docs hash verified at publish time)
  for (const [baseVersion, ptr] of Object.entries(pkgMap)) {
    if (ptr.verifiedEquivalentPatches?.includes(requestedVersion)) {
      return {
        pointer: ptr,
        matchedVersion: baseVersion,
        exactMatch: true,
        matchedViaVerifiedPatch: baseVersion,
        availableVersions
      };
    }
  }

  // 3. Unverified patch in the SAME minor line -> explicit warning (or error under --strict-version), NEVER silent HEAD!
  const reqTuple = parseSemverTuple(requestedVersion);
  const sameMinorCandidates = reqTuple
    ? availableVersions.filter(v => {
        const t = parseSemverTuple(v);
        return t && t.major === reqTuple.major && t.minor === reqTuple.minor;
      })
    : [];

  if (sameMinorCandidates.length > 0 && !options.strictVersion) {
    // Prefer highest version <= requestedVersion in same minor (respecting SemVer prerelease precedence), otherwise closest higher version in same minor
    const lowerOrEqual = sameMinorCandidates.find(v => compareSemverAsc(v, requestedVersion) <= 0);
    const chosen = lowerOrEqual || sameMinorCandidates[sameMinorCandidates.length - 1];
    return {
      pointer: pkgMap[chosen],
      matchedVersion: chosen,
      exactMatch: false,
      availableVersions,
      warning: {
        code: 'WARN_EXACT_PATCH_UNAVAILABLE',
        packageName,
        message: `Exact documentation snapshot for ${packageName}@${requestedVersion} is not published or patch-verified; using nearest same-minor snapshot ${packageName}@${chosen} (snapshot ${pkgMap[chosen].snapshotId}). Pass --strict-version to fail instead.`,
        details: {
          requestedVersion,
          fallbackVersion: chosen,
          availableVersions
        }
      }
    };
  }

  throw new AgentDocsError(
    'ERR_EXACT_PATCH_UNAVAILABLE',
    `No compatible documentation snapshot is available for ${packageName}@${requestedVersion}. Published snapshots for ${packageName}: ${availableVersions.join(', ') || 'none'}. Refusing to silently substitute latest docs.`,
    EXIT_CODES.NOT_FOUND,
    {
      suggestions: availableVersions.slice(0, 5),
      details: {packageName, requestedVersion, availableVersions}
    }
  );
}

/**
 * Parses `--version` override specs such as `1.2.0` (applies to default library package)
 * or `@react-spectrum/s2@1.2.0,react-aria-components@1.4.0`.
 */
function parseVersionOverrides(
  rawOverride: string | undefined,
  defaultLibrary: LibraryId = 's2'
): Record<string, string> {
  if (!rawOverride) {
    return {};
  }
  const overrides: Record<string, string> = {};
  const parts = rawOverride
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  for (const part of parts) {
    if (part === 'latest') {
      overrides['*'] = 'latest';
      continue;
    }
    const atIdx = part.lastIndexOf('@');
    if (atIdx > 0) {
      const pkg = part.slice(0, atIdx);
      const ver = part.slice(atIdx + 1);
      overrides[pkg] = ver;
    } else {
      const targetPkgs = LIBRARY_TO_PACKAGES[defaultLibrary] || ['@react-spectrum/s2'];
      for (const pkg of targetPkgs) {
        overrides[pkg] = part;
      }
    }
  }
  return overrides;
}

/**
 * Resolves workspace dependencies per documented package, preserving importer context
 * (detecting divergent direct vs. nested package instances) and lockfile fallbacks.
 */
export async function resolveWorkspace(options: CommonQueryOptions = {}): Promise<ResolutionState> {
  if (options.resolution) {
    return options.resolution;
  }

  const cwd = path.resolve(options.cwd || process.cwd());
  const index = await loadSnapshotIndex({
    cacheDir: options.cacheDir,
    snapshotSource: options.snapshotSource,
    offline: options.offline
  });
  let snapshotSlices: Record<string, PackageSlicePointer> | undefined;
  if (options.snapshotOverride) {
    const snapshot = index.snapshots[options.snapshotOverride];
    if (!snapshot) {
      throw new AgentDocsError(
        'ERR_SNAPSHOT_NOT_FOUND',
        `Unknown snapshot '${options.snapshotOverride}'.`,
        EXIT_CODES.NOT_FOUND
      );
    }
    snapshotSlices = (await loadSnapshotManifest(snapshot, options)).slices;
  }

  const warnings: DocWarning[] = [];
  const instances: PackageInstanceResolution[] = [];
  const resolvedPackages: Record<string, ResolvedPackageProvenance> = {};
  const overrides = parseVersionOverrides(options.versionOverride, options.defaultLibrary || 's2');

  const workspacePkgJsonPath = findNearestPackageJson(cwd);
  let workspaceDir: string | null = null;
  let workspacePackageName: string | null = null;
  let declaredSpecs: Record<string, string> = {};

  if (workspacePkgJsonPath) {
    workspaceDir = path.dirname(workspacePkgJsonPath);
    try {
      const pkgJson = JSON.parse(fs.readFileSync(workspacePkgJsonPath, 'utf8'));
      workspacePackageName = pkgJson.name || null;
      declaredSpecs = {
        ...(pkgJson.peerDependencies || {}),
        ...(pkgJson.devDependencies || {}),
        ...(pkgJson.dependencies || {})
      };
    } catch {
      // ignore malformed package.json
    }
  }

  // 1. Resolve installed packages from workspace anchor + nested importer anchors (e.g. inside @react-spectrum/s2)
  const installedByPkg = new Map<string, {version: string; pkgJsonPath: string}>();
  if (workspacePkgJsonPath) {
    for (const pkgName of DOCUMENTED_PACKAGES) {
      const found = resolveInstalledPackageFromAnchor(workspacePkgJsonPath, pkgName);
      if (found) {
        installedByPkg.set(pkgName, found);
        instances.push({
          packageName: pkgName,
          version: found.version,
          importer: 'workspace',
          source: 'installed',
          resolvedPath: found.pkgJsonPath
        });
      }
    }

    // Check nested importer context inside @react-spectrum/s2 (e.g. divergent react-aria-components or @internationalized/*)
    const s2Installed = installedByPkg.get('@react-spectrum/s2');
    if (s2Installed) {
      for (const nestedCandidate of [
        'react-aria-components',
        '@internationalized/date',
        '@internationalized/number'
      ]) {
        const nestedFound = resolveInstalledPackageFromAnchor(
          s2Installed.pkgJsonPath,
          nestedCandidate
        );
        if (!nestedFound) {
          continue;
        }
        const directFound = installedByPkg.get(nestedCandidate);
        if (directFound && directFound.version !== nestedFound.version) {
          instances.push({
            packageName: nestedCandidate,
            version: nestedFound.version,
            importer: '@react-spectrum/s2',
            source: 'installed',
            resolvedPath: nestedFound.pkgJsonPath
          });
          warnings.push({
            code: 'WARN_MULTIPLE_PACKAGE_INSTANCES',
            packageName: nestedCandidate,
            message: `Multiple versions of '${nestedCandidate}' detected: workspace resolves ${nestedCandidate}@${directFound.version} directly, while @react-spectrum/s2@${s2Installed.version} resolves nested ${nestedCandidate}@${nestedFound.version}. Direct '${nestedCandidate === 'react-aria-components' ? 'rac:' : 'internationalized:'}' queries use workspace version ${directFound.version}.`,
            details: {
              workspaceVersion: directFound.version,
              nestedImporter: '@react-spectrum/s2',
              nestedVersion: nestedFound.version
            }
          });
        } else if (!directFound) {
          // Transitive resolution via S2 when workspace doesn't directly list it
          installedByPkg.set(nestedCandidate, nestedFound);
          instances.push({
            packageName: nestedCandidate,
            version: nestedFound.version,
            importer: '@react-spectrum/s2',
            source: 'installed',
            resolvedPath: nestedFound.pkgJsonPath
          });
        }
      }
    }
  }

  // 2. Inspect workspace lockfile (fallback when node_modules is missing + mismatch detection when both exist)
  const lockInfo = workspaceDir
    ? resolveFromWorkspaceLockfile(workspaceDir, declaredSpecs, [...DOCUMENTED_PACKAGES])
    : null;

  if (lockInfo?.lockfileKind === 'unsupported' && installedByPkg.size === 0) {
    warnings.push({
      code: 'WARN_UNSUPPORTED_LOCKFILE',
      message: `Found unsupported lockfile '${lockInfo.lockfilePath}' without installed node_modules. Install dependencies or pass --version <pkg@ver>.`
    });
  }

  if (lockInfo && lockInfo.lockfileKind !== 'unsupported') {
    for (const [pkgName, lockVer] of Object.entries(lockInfo.workspacePackages)) {
      const inst = installedByPkg.get(pkgName);
      if (inst && inst.version !== lockVer) {
        warnings.push({
          code: 'WARN_LOCKFILE_MISMATCH',
          packageName: pkgName,
          message: `Installed ${pkgName}@${inst.version} differs from ${path.basename(lockInfo.lockfilePath)} (${lockVer}); using installed version ${inst.version}.`,
          details: {installedVersion: inst.version, lockfileVersion: lockVer}
        });
      } else if (!inst) {
        instances.push({
          packageName: pkgName,
          version: lockVer,
          importer: 'workspace',
          source: 'lockfile'
        });
      }
    }
    const s2NestedLock = lockInfo.nestedPackages['@react-spectrum/s2'] || {};
    for (const [nestedPkg, nestedLockVer] of Object.entries(s2NestedLock)) {
      const wsVer = installedByPkg.get(nestedPkg)?.version || lockInfo.workspacePackages[nestedPkg];
      const alreadyWarned = warnings.some(
        w => w.code === 'WARN_MULTIPLE_PACKAGE_INSTANCES' && w.packageName === nestedPkg
      );
      if (wsVer && wsVer !== nestedLockVer && !alreadyWarned) {
        instances.push({
          packageName: nestedPkg,
          version: nestedLockVer,
          importer: '@react-spectrum/s2',
          source: 'lockfile'
        });
        warnings.push({
          code: 'WARN_MULTIPLE_PACKAGE_INSTANCES',
          packageName: nestedPkg,
          message: `Multiple versions of '${nestedPkg}' in lockfile: workspace uses ${wsVer}, while @react-spectrum/s2 uses nested ${nestedLockVer}.`,
          details: {
            workspaceVersion: wsVer,
            nestedImporter: '@react-spectrum/s2',
            nestedVersion: nestedLockVer
          }
        });
      } else if (!wsVer && !installedByPkg.has(nestedPkg)) {
        instances.push({
          packageName: nestedPkg,
          version: nestedLockVer,
          importer: '@react-spectrum/s2',
          source: 'lockfile'
        });
      }
    }
  }

  // 3. Match each discovered or overridden package against the per-package snapshot index
  const effectiveRequest = new Map<
    string,
    {
      version: string;
      importer: string;
      source: 'installed' | 'lockfile' | 'override' | 'latest-fallback';
    }
  >();

  for (const inst of instances) {
    // Workspace direct dependency takes precedence over transitive nested dependency for direct lookups
    if (!effectiveRequest.has(inst.packageName) || inst.importer === 'workspace') {
      effectiveRequest.set(inst.packageName, {
        version: inst.version,
        importer: inst.importer,
        source: inst.source
      });
    }
  }

  if (overrides['*'] === 'latest') {
    effectiveRequest.clear();
    for (const [latestPkg, latestVer] of Object.entries(index.latest)) {
      effectiveRequest.set(latestPkg, {
        version: latestVer,
        importer: 'workspace',
        source: 'override'
      });
    }
  }

  for (const [pkg, ver] of Object.entries(overrides)) {
    if (pkg === '*' && ver === 'latest') {
      continue;
    } else if (ver === 'latest') {
      const latestVer = index.latest[pkg];
      if (!latestVer) {
        throw new AgentDocsError(
          'ERR_SNAPSHOT_NOT_FOUND',
          `No latest snapshot published for package '${pkg}'.`,
          EXIT_CODES.NOT_FOUND
        );
      }
      effectiveRequest.set(pkg, {
        version: latestVer,
        importer: 'workspace',
        source: 'override'
      });
    } else {
      effectiveRequest.set(pkg, {
        version: ver,
        importer: 'workspace',
        source: 'override'
      });
    }
  }

  // Snapshot override without package versions selects all packages in that snapshot
  if (options.snapshotOverride && effectiveRequest.size === 0) {
    const snap = index.snapshots[options.snapshotOverride];
    if (!snap) {
      throw new AgentDocsError(
        'ERR_SNAPSHOT_NOT_FOUND',
        `Unknown snapshot '${options.snapshotOverride}'.`,
        EXIT_CODES.NOT_FOUND
      );
    }
    for (const [pkg, ver] of Object.entries(snap.packages)) {
      effectiveRequest.set(pkg, {
        version: ver,
        importer: 'workspace',
        source: 'override'
      });
    }
  }

  // Outside any workspace or in a workspace with no Spectrum/Aria deps yet:
  if (effectiveRequest.size === 0) {
    if (options.allowLatestFallback) {
      for (const [pkg, latestVer] of Object.entries(index.latest)) {
        effectiveRequest.set(pkg, {
          version: latestVer,
          importer: 'workspace',
          source: 'latest-fallback'
        });
      }
      warnings.push({
        code: 'WARN_USING_LATEST_FALLBACK',
        message: `No @react-spectrum/* or react-aria* dependencies found in '${cwd}'; explicitly falling back to latest published snapshots.`
      });
    } else if (lockInfo?.lockfileKind === 'unsupported' && installedByPkg.size === 0) {
      throw new AgentDocsError(
        'ERR_UNSUPPORTED_LOCKFILE',
        `Found unsupported lockfile '${lockInfo.lockfilePath}' without installed node_modules. Install dependencies or pass --version <pkg@ver>.`,
        EXIT_CODES.INVALID_ARGS,
        {details: {lockfilePath: lockInfo.lockfilePath}}
      );
    } else {
      throw new AgentDocsError(
        'ERR_WORKSPACE_REQUIRED',
        `No @react-spectrum/s2, react-aria-components, or react-aria dependencies were found from '${cwd}'. Run inside an application workspace, pass --cwd <app-dir>, or pass --version latest.`,
        EXIT_CODES.INVALID_ARGS
      );
    }
  }

  const deferredAuxErrors: AgentDocsError[] = [];
  for (const [pkgName, req] of effectiveRequest.entries()) {
    const isPrimary =
      pkgName === '@react-spectrum/s2' ||
      pkgName === 'react-aria-components' ||
      req.source === 'override';
    const isSnapshotOmittedWorkspacePkg =
      Boolean(options.snapshotOverride) &&
      req.source !== 'override' &&
      Boolean(snapshotSlices && !snapshotSlices[pkgName]);
    try {
      const matched = matchPackageSliceInIndex(index, pkgName, req.version, {
        strictVersion: options.strictVersion,
        snapshotOverride: options.snapshotOverride,
        snapshotSlices
      });
      if (matched.warning) {
        warnings.push(matched.warning);
      }
      resolvedPackages[pkgName] = {
        packageName: pkgName,
        packageVersion: matched.matchedVersion,
        requestedVersion: req.version,
        importer: req.importer,
        source: req.source,
        snapshotId: matched.pointer.snapshotId,
        exactMatch: matched.exactMatch,
        matchedViaVerifiedPatch: matched.matchedViaVerifiedPatch,
        slicePath: matched.pointer.sliceRelPath,
        sliceSha256: matched.pointer.sliceSha256,
        availableVersions: matched.availableVersions
      };
    } catch (err) {
      if (
        ((!isPrimary && !options.strictVersion) ||
          (isSnapshotOmittedWorkspacePkg &&
            (!options.strictVersion || req.importer !== 'workspace'))) &&
        err instanceof AgentDocsError
      ) {
        deferredAuxErrors.push(err);
        warnings.push({
          code: 'WARN_AUX_PACKAGE_SLICE_UNAVAILABLE',
          packageName: pkgName,
          message: err.message
        });
      } else {
        throw err;
      }
    }
  }
  if (Object.keys(resolvedPackages).length === 0 && deferredAuxErrors.length > 0) {
    throw deferredAuxErrors[0];
  }

  // Use auxiliary versions from the primary package's snapshot when the
  // workspace has no resolved dependency or override for that package.
  const s2Prov =
    resolvedPackages['@react-spectrum/s2'] || resolvedPackages['react-aria-components'];
  const primaryProv = s2Prov || resolvedPackages['react-aria'];
  const snapSummary = primaryProv ? index.snapshots[primaryProv.snapshotId] : undefined;
  if (primaryProv && snapSummary) {
    const auxiliaryPackages = s2Prov
      ? ['@internationalized/date', '@internationalized/number', 'react-aria', 'react-stately']
      : ['@internationalized/date', '@internationalized/number', 'react-stately'];
    for (const auxPkg of auxiliaryPackages) {
      const auxVer = !effectiveRequest.has(auxPkg) ? snapSummary.packages[auxPkg] : undefined;
      const auxPtr = options.snapshotOverride
        ? snapshotSlices?.[auxPkg]
        : auxVer
          ? index.packages[auxPkg]?.[auxVer]
          : undefined;
      if (auxVer && auxPtr) {
        resolvedPackages[auxPkg] = {
          packageName: auxPkg,
          packageVersion: auxVer,
          requestedVersion: auxVer,
          importer: primaryProv.packageName,
          source: primaryProv.source,
          snapshotId: auxPtr.snapshotId,
          exactMatch: primaryProv.exactMatch,
          slicePath: auxPtr.sliceRelPath,
          sliceSha256: auxPtr.sliceSha256
        };
      }
    }
  }

  return {
    cwd,
    workspaceDir,
    workspacePackageName,
    lockfilePath: lockInfo?.lockfilePath || null,
    lockfileKind: lockInfo?.lockfileKind || null,
    packages: resolvedPackages,
    instances,
    warnings
  };
}
