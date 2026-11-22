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

import fs from 'node:fs';
import path from 'node:path';

export interface LockfileResolutionResult {
  lockfilePath: string;
  lockfileKind: 'npm' | 'yarn-berry' | 'yarn-classic' | 'pnpm' | 'unsupported';
  workspacePackages: Record<string, string>;
  nestedPackages: Record<string, Record<string, string>>;
}

function normalizePosixRel(rootDir: string, targetDir: string): string {
  const rel = path.relative(rootDir, targetDir).replace(/\\/g, '/');
  return rel === '' ? '.' : rel;
}

function stripPeerSuffix(rawSpec: string): string {
  const cleaned = rawSpec.trim().replace(/^['"]|['"]$/g, '');
  const parenIdx = cleaned.indexOf('(');
  const core = parenIdx === -1 ? cleaned : cleaned.slice(0, parenIdx);
  if (core.startsWith('npm:')) {
    const atIdx = core.lastIndexOf('@');
    return atIdx > 4 ? core.slice(atIdx + 1) : core;
  }
  return core;
}

function isExactSemver(ver: string): boolean {
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(ver);
}

interface NpmLockPackageEntry {
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

interface NpmV1DepEntry {
  version?: string;
  dependencies?: Record<string, NpmV1DepEntry>;
}

function collectEntryDeclaredDeps(entry: NpmLockPackageEntry | undefined): string[] {
  if (!entry) {
    return [];
  }
  return [
    ...Object.keys(entry.dependencies || {}),
    ...Object.keys(entry.devDependencies || {}),
    ...Object.keys(entry.optionalDependencies || {}),
    ...Object.keys(entry.peerDependencies || {})
  ];
}

/**
 * Parses npm `package-lock.json` v2/v3 `packages` map (and v1 `dependencies` tree at root)
 * relative to `workspaceDir`. Returns null when the lockfile belongs to an ancestor project that
 * doesn't include the workspace, and avoids attributing root-hoisted sibling workspace packages
 * that the target workspace didn't declare.
 */
function parseNpmPackageLock(
  lockPath: string,
  lockRootDir: string,
  workspaceDir: string,
  declaredWorkspaceSpecs: Record<string, string>,
  candidatePkgNames: string[]
): LockfileResolutionResult | null {
  const json = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  const wsRel = normalizePosixRel(lockRootDir, workspaceDir);

  // npm lockfile v1 (`dependencies` tree, no `packages` map; npm v1 did not support workspaces)
  if (!json.packages) {
    if (wsRel !== '.') {
      return null;
    }
    if (!json.dependencies || typeof json.dependencies !== 'object') {
      return {
        lockfilePath: lockPath,
        lockfileKind: 'unsupported',
        workspacePackages: {},
        nestedPackages: {}
      };
    }
    const depsMap = json.dependencies as Record<string, NpmV1DepEntry>;
    const workspacePackages: Record<string, string> = {};
    const nestedPackages: Record<string, Record<string, string>> = {};
    for (const pkgName of candidatePkgNames) {
      const entry = depsMap[pkgName];
      if (!entry?.version || !isExactSemver(entry.version)) {
        continue;
      }
      workspacePackages[pkgName] = entry.version;
      for (const nestedCandidate of candidatePkgNames) {
        if (nestedCandidate === pkgName) {
          continue;
        }
        const nestedVer = entry.dependencies?.[nestedCandidate]?.version;
        if (nestedVer && isExactSemver(nestedVer)) {
          nestedPackages[pkgName] ??= {};
          nestedPackages[pkgName][nestedCandidate] = nestedVer;
        }
      }
    }
    return {
      lockfilePath: lockPath,
      lockfileKind: 'npm',
      workspacePackages,
      nestedPackages
    };
  }

  const packagesMap: Record<string, NpmLockPackageEntry> = json.packages;
  if (wsRel !== '.' && !packagesMap[wsRel]) {
    return null;
  }
  const wsPrefix = wsRel === '.' ? '' : `${wsRel}/`;
  const wsDeclaredSet = new Set<string>([
    ...Object.keys(declaredWorkspaceSpecs),
    ...collectEntryDeclaredDeps(packagesMap[wsRel])
  ]);
  const restrictRootHoistToDeclared = wsRel !== '.';

  const workspacePackages: Record<string, string> = {};
  const nestedPackages: Record<string, Record<string, string>> = {};

  for (const pkgName of candidatePkgNames) {
    const localKey = `${wsPrefix}node_modules/${pkgName}`;
    const rootKey = `node_modules/${pkgName}`;
    const hasLocal = Boolean(packagesMap[localKey]?.version);
    const canUseRoot = !restrictRootHoistToDeclared || wsDeclaredSet.has(pkgName);
    const hasRoot = canUseRoot && Boolean(packagesMap[rootKey]?.version);
    const resolvedBaseKey = hasLocal ? localKey : hasRoot ? rootKey : null;
    const entry = resolvedBaseKey ? packagesMap[resolvedBaseKey] : undefined;
    if (entry?.version && resolvedBaseKey) {
      workspacePackages[pkgName] = entry.version;
      const entryDeps = new Set([
        ...Object.keys(entry.dependencies || {}),
        ...Object.keys(entry.optionalDependencies || {})
      ]);
      for (const nestedCandidate of candidatePkgNames) {
        if (nestedCandidate === pkgName) {
          continue;
        }
        const nestedKey = `${resolvedBaseKey}/node_modules/${nestedCandidate}`;
        if (packagesMap[nestedKey]?.version) {
          nestedPackages[pkgName] ??= {};
          nestedPackages[pkgName][nestedCandidate] = packagesMap[nestedKey].version!;
        } else if (
          entryDeps.has(nestedCandidate) &&
          packagesMap[`node_modules/${nestedCandidate}`]?.version
        ) {
          nestedPackages[pkgName] ??= {};
          nestedPackages[pkgName][nestedCandidate] =
            packagesMap[`node_modules/${nestedCandidate}`].version!;
        }
      }
    }
  }

  return {
    lockfilePath: lockPath,
    lockfileKind: 'npm',
    workspacePackages,
    nestedPackages
  };
}

/**
 * Parses pnpm `pnpm-lock.yaml` `importers:` block for the selected workspace.
 * Returns null when the lockfile belongs to an ancestor project that doesn't include the workspace.
 */
function parsePnpmLock(
  lockPath: string,
  lockRootDir: string,
  workspaceDir: string,
  candidatePkgNames: string[]
): LockfileResolutionResult | null {
  const text = fs.readFileSync(lockPath, 'utf8');
  const wsRel = normalizePosixRel(lockRootDir, workspaceDir);
  const candidateSet = new Set(candidatePkgNames);
  const workspacePackages: Record<string, string> = {};
  const workspaceRawVersions: Record<string, string> = {};

  const lines = text.split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith('#'));
  const hasImporters = lines.some(l => /^importers:\s*$/.test(l));
  if (!hasImporters && wsRel !== '.') {
    return null;
  }

  if (hasImporters) {
    const importersIdx = lines.findIndex(l => /^importers:\s*$/.test(l));
    if (importersIdx !== -1) {
      let targetIdx = -1;
      let targetIsEmptyInline = false;
      for (let i = importersIdx + 1; i < lines.length; i++) {
        if (/^\S/.test(lines[i])) {
          break;
        }
        const m = lines[i].match(/^ {2}(?:['"]([^'"]+)['"]|([^\s:'"]+)):\s*(\{\})?\s*$/);
        const importerKey = m ? (m[1] ?? m[2]) : null;
        if (importerKey === wsRel) {
          targetIdx = i + 1;
          targetIsEmptyInline = Boolean(m?.[3]);
          break;
        }
      }
      if (targetIdx === -1) {
        return null;
      }
      if (!targetIsEmptyInline) {
        parsePnpmDepBlockLines(
          lines.slice(targetIdx),
          6,
          8,
          candidateSet,
          workspacePackages,
          workspaceRawVersions,
          true
        );
      }
    }
  } else {
    parsePnpmDepBlockLines(
      lines,
      2,
      4,
      candidateSet,
      workspacePackages,
      workspaceRawVersions,
      false
    );
  }

  const nestedPackages = parsePnpmNestedPackages(
    lines,
    workspacePackages,
    workspaceRawVersions,
    candidateSet
  );

  return {
    lockfilePath: lockPath,
    lockfileKind: 'pnpm',
    workspacePackages,
    nestedPackages
  };
}

function parsePnpmDepBlockLines(
  lines: string[],
  headerIndent: number,
  versionIndent: number,
  candidateSet: Set<string>,
  workspacePackages: Record<string, string>,
  workspaceRawVersions: Record<string, string>,
  stopAtImporterIndent: boolean
): void {
  let inDepsBlock = false;
  let pendingPkg: string | null = null;
  const blockHeaderRe = stopAtImporterIndent
    ? /^ {4}(dependencies|devDependencies|optionalDependencies):\s*$/
    : /^(dependencies|devDependencies|optionalDependencies):\s*$/;
  const resetBlockRe = stopAtImporterIndent ? /^ {4}[a-zA-Z_]+:/ : /^\S/;
  const pkgHeaderRe = new RegExp(`^ {${headerIndent}}['"]?([^'"\\s:]+)['"]?:\\s*(.*)$`);
  const verLineRe = new RegExp(`^ {${versionIndent}}version:\\s*(.+)$`);

  for (const line of lines) {
    if (
      stopAtImporterIndent &&
      (/^ {2}(?:['"][^'"]+['"]|[^\s:'"]+):\s*(?:\{\})?\s*$/.test(line) || /^\S/.test(line))
    ) {
      break;
    }
    if (blockHeaderRe.test(line)) {
      inDepsBlock = true;
      pendingPkg = null;
      continue;
    }
    if (resetBlockRe.test(line)) {
      inDepsBlock = false;
      pendingPkg = null;
      continue;
    }
    if (!inDepsBlock) {
      continue;
    }
    const pkgHeader = line.match(pkgHeaderRe);
    if (pkgHeader) {
      const name = pkgHeader[1];
      const inlineVal = pkgHeader[2].trim();
      if (!candidateSet.has(name)) {
        pendingPkg = null;
        continue;
      }
      if (!inlineVal) {
        pendingPkg = name;
        continue;
      }
      const raw = inlineVal.replace(/^['"]|['"]$/g, '').trim();
      const ver = stripPeerSuffix(raw);
      if (isExactSemver(ver)) {
        workspacePackages[name] = ver;
        workspaceRawVersions[name] = raw;
      }
      pendingPkg = null;
      continue;
    }
    if (pendingPkg) {
      const verMatch = line.match(verLineRe);
      if (verMatch) {
        const raw = verMatch[1].replace(/^['"]|['"]$/g, '').trim();
        const ver = stripPeerSuffix(raw);
        if (isExactSemver(ver)) {
          workspacePackages[pendingPkg] = ver;
          workspaceRawVersions[pendingPkg] = raw;
        }
        pendingPkg = null;
      }
    }
  }
}

function matchPnpmEntryOwner(
  entryKey: string,
  workspacePackages: Record<string, string>,
  workspaceRawVersions: Record<string, string>
): {pkgName: string; exactMatch: boolean} | null {
  const cleanKey = entryKey.replace(/^\/+/, '');
  for (const [pkgName, exactVer] of Object.entries(workspacePackages)) {
    const rawVer = workspaceRawVersions[pkgName] || exactVer;
    if (cleanKey === `${pkgName}@${rawVer}` || cleanKey === `${pkgName}/${rawVer}`) {
      return {pkgName, exactMatch: true};
    }
    if (
      cleanKey === `${pkgName}@${exactVer}` ||
      cleanKey === `${pkgName}/${exactVer}` ||
      cleanKey.startsWith(`${pkgName}@${exactVer}(`) ||
      cleanKey.startsWith(`${pkgName}/${exactVer}(`) ||
      cleanKey.startsWith(`${pkgName}/${exactVer}_`)
    ) {
      return {pkgName, exactMatch: false};
    }
  }
  return null;
}

function scanPnpmSectionNestedDeps(
  lines: string[],
  sectionName: 'snapshots' | 'packages',
  workspacePackages: Record<string, string>,
  workspaceRawVersions: Record<string, string>,
  candidateSet: Set<string>,
  nestedPackages: Record<string, Record<string, string>>,
  exactMatchedPkgs: Set<string>
): void {
  const sectionIdx = lines.findIndex(
    l => l === `${sectionName}:` || l.startsWith(`${sectionName}: `)
  );
  if (sectionIdx === -1) {
    return;
  }

  let activeOwner: string | null = null;
  let activeIsExact = false;
  let inDeps = false;

  for (let i = sectionIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^\S/.test(line)) {
      break;
    }
    const entryMatch = line.match(/^ {2}(?:['"]([^'"]+)['"]|([^\s:'"]+)):\s*(?:\{\})?\s*$/);
    if (entryMatch) {
      inDeps = false;
      const entryKey = entryMatch[1] ?? entryMatch[2];
      const match = matchPnpmEntryOwner(entryKey, workspacePackages, workspaceRawVersions);
      if (!match || (exactMatchedPkgs.has(match.pkgName) && !match.exactMatch)) {
        activeOwner = null;
        continue;
      }
      activeOwner = match.pkgName;
      activeIsExact = match.exactMatch;
      if (activeIsExact) {
        exactMatchedPkgs.add(activeOwner);
        nestedPackages[activeOwner] = {};
      }
      continue;
    }
    if (!activeOwner) {
      continue;
    }
    if (/^ {4}(dependencies|optionalDependencies):\s*$/.test(line)) {
      inDeps = true;
      continue;
    }
    if (/^ {4}[a-zA-Z_]+:/.test(line)) {
      inDeps = false;
      continue;
    }
    if (!inDeps) {
      continue;
    }
    const depMatch = line.match(/^ {6}['"]?([^'"\s:]+)['"]?:\s*['"]?(.+?)['"]?\s*$/);
    if (!depMatch) {
      continue;
    }
    const depName = depMatch[1];
    if (depName === activeOwner || !candidateSet.has(depName)) {
      continue;
    }
    const depVer = stripPeerSuffix(depMatch[2]);
    if (!isExactSemver(depVer)) {
      continue;
    }
    nestedPackages[activeOwner] ??= {};
    if (activeIsExact || !nestedPackages[activeOwner][depName]) {
      nestedPackages[activeOwner][depName] = depVer;
    }
  }
}

function parsePnpmNestedPackages(
  lines: string[],
  workspacePackages: Record<string, string>,
  workspaceRawVersions: Record<string, string>,
  candidateSet: Set<string>
): Record<string, Record<string, string>> {
  const nestedPackages: Record<string, Record<string, string>> = {};
  if (Object.keys(workspacePackages).length === 0) {
    return nestedPackages;
  }
  const exactMatchedPkgs = new Set<string>();
  // pnpm v9 stores resolved dependency edges under `snapshots:`; v6–v8 stores them under `packages:`.
  scanPnpmSectionNestedDeps(
    lines,
    'snapshots',
    workspacePackages,
    workspaceRawVersions,
    candidateSet,
    nestedPackages,
    exactMatchedPkgs
  );
  const missingFromSnapshots: Record<string, string> = {};
  for (const [pkg, ver] of Object.entries(workspacePackages)) {
    if (!nestedPackages[pkg] || Object.keys(nestedPackages[pkg]).length === 0) {
      missingFromSnapshots[pkg] = ver;
    }
  }
  if (Object.keys(missingFromSnapshots).length > 0) {
    scanPnpmSectionNestedDeps(
      lines,
      'packages',
      missingFromSnapshots,
      workspaceRawVersions,
      candidateSet,
      nestedPackages,
      exactMatchedPkgs
    );
  }
  return nestedPackages;
}

interface YarnLockBlock {
  version: string;
  dependencies: Record<string, string>;
}

function lookupYarnBlock(
  descriptorToBlock: Map<string, YarnLockBlock>,
  pkgName: string,
  spec: string
): YarnLockBlock | undefined {
  const cleanSpec = spec.startsWith('npm:') ? spec.slice(4) : spec;
  return (
    descriptorToBlock.get(`${pkgName}@npm:${cleanSpec}`) ||
    descriptorToBlock.get(`${pkgName}@${cleanSpec}`)
  );
}

/**
 * Parses Yarn Berry (v2–v4) and Yarn Classic (v1) `yarn.lock` matched strictly against
 * the selected workspace's declared dependency specifiers in `package.json`, including
 * direct transitive dependencies declared inside matched package blocks.
 */
function parseYarnLock(
  lockPath: string,
  declaredWorkspaceSpecs: Record<string, string>,
  candidatePkgNames: string[]
): LockfileResolutionResult {
  const text = fs.readFileSync(lockPath, 'utf8');
  const isBerry = text.includes('__metadata:');
  const candidateSet = new Set(candidatePkgNames);
  const workspacePackages: Record<string, string> = {};
  const nestedPackages: Record<string, Record<string, string>> = {};

  // Build exact descriptor -> {version, dependencies} lookup from yarn.lock blocks
  const descriptorToBlock = new Map<string, YarnLockBlock>();
  const lines = text.split(/\r?\n/);
  let activeDescriptors: string[] = [];
  let activeBlock: YarnLockBlock | null = null;
  let inDepsSection = false;

  const commitActiveBlock = () => {
    if (activeBlock && activeBlock.version && activeDescriptors.length > 0) {
      for (const desc of activeDescriptors) {
        descriptorToBlock.set(desc, activeBlock);
      }
    }
    activeDescriptors = [];
    activeBlock = null;
    inDepsSection = false;
  };

  for (const line of lines) {
    if (!line.trim() || line.startsWith('#')) {
      continue;
    }
    if (!line.startsWith(' ') && line.endsWith(':')) {
      commitActiveBlock();
      const header = line.slice(0, -1).trim();
      activeDescriptors = header.split(',').map(part => part.trim().replace(/^['"]|['"]$/g, ''));
      activeBlock = {version: '', dependencies: {}};
      continue;
    }
    if (!activeBlock) {
      continue;
    }
    const berryVer = line.match(/^ {2}version:\s*['"]?([^'"]+)['"]?\s*$/);
    const classicVer = line.match(/^ {2}version\s+"([^"]+)"\s*$/);
    const ver = berryVer?.[1] || classicVer?.[1];
    if (ver && isExactSemver(ver)) {
      activeBlock.version = ver;
      continue;
    }
    if (/^ {2}(dependencies|optionalDependencies):\s*$/.test(line)) {
      inDepsSection = true;
      continue;
    }
    if (/^ {2}\S/.test(line)) {
      inDepsSection = false;
      continue;
    }
    if (!inDepsSection) {
      continue;
    }
    const berryDep = line.match(/^ {4}['"]?([^'"\s:]+)['"]?:\s*['"]?([^'"]+?)['"]?\s*$/);
    const classicDep = !berryDep ? line.match(/^ {4}['"]?([^'"\s]+)['"]?\s+"([^"]+)"\s*$/) : null;
    const depMatch = berryDep || classicDep;
    if (depMatch) {
      activeBlock.dependencies[depMatch[1]] = depMatch[2].trim();
    }
  }
  commitActiveBlock();

  for (const pkgName of candidatePkgNames) {
    const spec = declaredWorkspaceSpecs[pkgName];
    if (!spec) {
      continue;
    }
    const block = lookupYarnBlock(descriptorToBlock, pkgName, spec);
    if (!block) {
      continue;
    }
    workspacePackages[pkgName] = block.version;
    for (const [depName, depSpec] of Object.entries(block.dependencies)) {
      if (depName === pkgName || !candidateSet.has(depName)) {
        continue;
      }
      const nestedBlock = lookupYarnBlock(descriptorToBlock, depName, depSpec);
      if (nestedBlock && isExactSemver(nestedBlock.version)) {
        nestedPackages[pkgName] ??= {};
        nestedPackages[pkgName][depName] = nestedBlock.version;
      }
    }
  }

  return {
    lockfilePath: lockPath,
    lockfileKind: isBerry ? 'yarn-berry' : 'yarn-classic',
    workspacePackages,
    nestedPackages
  };
}

function declaresWorkspaces(dir: string): boolean {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
    return Boolean(pkg?.workspaces);
  } catch {
    return false;
  }
}

/**
 * Walks upward from `workspaceDir` to find the nearest lockfile and resolves
 * workspace-specific dependency versions. A lockfile in an ancestor directory is only used when
 * it covers `workspaceDir` as a workspace; otherwise it belongs to an unrelated project and null
 * is returned.
 */
export function resolveFromWorkspaceLockfile(
  workspaceDir: string,
  declaredWorkspaceSpecs: Record<string, string>,
  candidatePkgNames: string[]
): LockfileResolutionResult | null {
  const startDir = path.resolve(workspaceDir);
  let curr = startDir;
  while (true) {
    const isAncestor = curr !== startDir;
    const npmLock = path.join(curr, 'package-lock.json');
    if (fs.existsSync(npmLock)) {
      return parseNpmPackageLock(
        npmLock,
        curr,
        startDir,
        declaredWorkspaceSpecs,
        candidatePkgNames
      );
    }
    const npmShrinkwrap = path.join(curr, 'npm-shrinkwrap.json');
    if (fs.existsSync(npmShrinkwrap)) {
      return parseNpmPackageLock(
        npmShrinkwrap,
        curr,
        startDir,
        declaredWorkspaceSpecs,
        candidatePkgNames
      );
    }
    const pnpmLock = path.join(curr, 'pnpm-lock.yaml');
    if (fs.existsSync(pnpmLock)) {
      return parsePnpmLock(pnpmLock, curr, startDir, candidatePkgNames);
    }
    const yarnLock = path.join(curr, 'yarn.lock');
    if (fs.existsSync(yarnLock)) {
      if (isAncestor && !declaresWorkspaces(curr)) {
        return null;
      }
      return parseYarnLock(yarnLock, declaredWorkspaceSpecs, candidatePkgNames);
    }
    for (const bunFile of ['bun.lockb', 'bun.lock']) {
      const bunLockPath = path.join(curr, bunFile);
      if (fs.existsSync(bunLockPath)) {
        if (isAncestor && !declaresWorkspaces(curr)) {
          return null;
        }
        return {
          lockfilePath: bunLockPath,
          lockfileKind: 'unsupported',
          workspacePackages: {},
          nestedPackages: {}
        };
      }
    }

    const parent = path.dirname(curr);
    if (parent === curr) {
      break;
    }
    curr = parent;
  }
  return null;
}
