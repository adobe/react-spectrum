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

/**
 * Parses npm `package-lock.json` v2/v3 `packages` map relative to `workspaceDir`.
 * Returns null when the lockfile belongs to an ancestor project that doesn't include the workspace.
 */
function parseNpmPackageLock(
  lockPath: string,
  lockRootDir: string,
  workspaceDir: string,
  candidatePkgNames: string[]
): LockfileResolutionResult | null {
  const json = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  const packagesMap: Record<string, {version?: string}> = json.packages || {};
  const wsRel = normalizePosixRel(lockRootDir, workspaceDir);
  if (wsRel !== '.' && !packagesMap[wsRel]) {
    return null;
  }
  const wsPrefix = wsRel === '.' ? '' : `${wsRel}/`;

  const workspacePackages: Record<string, string> = {};
  const nestedPackages: Record<string, Record<string, string>> = {};

  for (const pkgName of candidatePkgNames) {
    const localKey = `${wsPrefix}node_modules/${pkgName}`;
    const rootKey = `node_modules/${pkgName}`;
    const entry = packagesMap[localKey] || packagesMap[rootKey];
    const resolvedBaseKey = packagesMap[localKey]
      ? localKey
      : packagesMap[rootKey]
        ? rootKey
        : null;
    if (entry?.version && resolvedBaseKey) {
      workspacePackages[pkgName] = entry.version;
      for (const nestedCandidate of candidatePkgNames) {
        if (nestedCandidate === pkgName) {
          continue;
        }
        const nestedKey = `${resolvedBaseKey}/node_modules/${nestedCandidate}`;
        if (packagesMap[nestedKey]?.version) {
          nestedPackages[pkgName] ??= {};
          nestedPackages[pkgName][nestedCandidate] = packagesMap[nestedKey].version!;
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

  const lines = text.split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith('#'));
  const hasImporters = lines.some(l => /^importers:\s*$/.test(l));
  if (!hasImporters && wsRel !== '.') {
    return null;
  }

  if (hasImporters) {
    const importersIdx = lines.findIndex(l => /^importers:\s*$/.test(l));
    if (importersIdx !== -1) {
      let targetIdx = -1;
      for (let i = importersIdx + 1; i < lines.length; i++) {
        if (/^\S/.test(lines[i])) {
          break;
        }
        const m = lines[i].match(/^ {2}['"]?([^'"\s:]+)['"]?:\s*$/);
        if (m && m[1] === wsRel) {
          targetIdx = i + 1;
          break;
        }
      }
      if (targetIdx === -1) {
        return null;
      }
      parsePnpmDepBlockLines(lines.slice(targetIdx), 6, 8, candidateSet, workspacePackages, true);
    }
  } else {
    parsePnpmDepBlockLines(lines, 2, 4, candidateSet, workspacePackages, false);
  }

  return {
    lockfilePath: lockPath,
    lockfileKind: 'pnpm',
    workspacePackages,
    nestedPackages: {}
  };
}

function parsePnpmDepBlockLines(
  lines: string[],
  headerIndent: number,
  versionIndent: number,
  candidateSet: Set<string>,
  workspacePackages: Record<string, string>,
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
    if (stopAtImporterIndent && (/^ {2}['"]?[^'"\s:]+['"]?:\s*$/.test(line) || /^\S/.test(line))) {
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
      const ver = stripPeerSuffix(inlineVal);
      if (isExactSemver(ver)) {
        workspacePackages[name] = ver;
      }
      pendingPkg = null;
      continue;
    }
    if (pendingPkg) {
      const verMatch = line.match(verLineRe);
      if (verMatch) {
        const ver = stripPeerSuffix(verMatch[1]);
        if (isExactSemver(ver)) {
          workspacePackages[pendingPkg] = ver;
        }
        pendingPkg = null;
      }
    }
  }
}

/**
 * Parses Yarn Berry (v2–v4) and Yarn Classic (v1) `yarn.lock` matched strictly against
 * the selected workspace's declared dependency specifiers in `package.json`.
 */
function parseYarnLock(
  lockPath: string,
  declaredWorkspaceSpecs: Record<string, string>,
  candidatePkgNames: string[]
): LockfileResolutionResult {
  const text = fs.readFileSync(lockPath, 'utf8');
  const isBerry = text.includes('__metadata:');
  const workspacePackages: Record<string, string> = {};

  // Build exact descriptor -> resolved version lookup from yarn.lock blocks
  const descriptorToVersion = new Map<string, string>();
  const lines = text.split(/\r?\n/);
  let activeDescriptors: string[] = [];

  for (const line of lines) {
    if (!line.trim() || line.startsWith('#')) {
      continue;
    }
    if (!line.startsWith(' ') && line.endsWith(':')) {
      const header = line.slice(0, -1).trim();
      activeDescriptors = header.split(',').map(part => part.trim().replace(/^['"]|['"]$/g, ''));
      continue;
    }
    if (activeDescriptors.length > 0) {
      const berryVer = line.match(/^\s{2}version:\s*['"]?([^'"]+)['"]?\s*$/);
      const classicVer = line.match(/^\s{2}version\s+"([^"]+)"\s*$/);
      const ver = berryVer?.[1] || classicVer?.[1];
      if (ver && isExactSemver(ver)) {
        for (const desc of activeDescriptors) {
          descriptorToVersion.set(desc, ver);
        }
        activeDescriptors = [];
      }
    }
  }

  for (const pkgName of candidatePkgNames) {
    const spec = declaredWorkspaceSpecs[pkgName];
    if (!spec) {
      continue;
    }
    const cleanSpec = spec.startsWith('npm:') ? spec.slice(4) : spec;
    const berryDesc = `${pkgName}@npm:${cleanSpec}`;
    const classicDesc = `${pkgName}@${cleanSpec}`;
    const resolved = descriptorToVersion.get(berryDesc) || descriptorToVersion.get(classicDesc);
    if (resolved) {
      workspacePackages[pkgName] = resolved;
    }
  }

  return {
    lockfilePath: lockPath,
    lockfileKind: isBerry ? 'yarn-berry' : 'yarn-classic',
    workspacePackages,
    nestedPackages: {}
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
      return parseNpmPackageLock(npmLock, curr, startDir, candidatePkgNames);
    }
    const npmShrinkwrap = path.join(curr, 'npm-shrinkwrap.json');
    if (fs.existsSync(npmShrinkwrap)) {
      return parseNpmPackageLock(npmShrinkwrap, curr, startDir, candidatePkgNames);
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
