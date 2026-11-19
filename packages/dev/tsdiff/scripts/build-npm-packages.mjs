#!/usr/bin/env node
'use strict';

/**
 * Build the publishable npm tree for `tsdiff` under `npm/`.
 *
 * `tsdiff` is a native binary, so it ships the way Parcel, esbuild and friends
 * do: one package per platform carrying just the executable, marked with `os`,
 * `cpu` and `libc` so a package manager downloads only the one it can run, and
 * a thin wrapper that depends on all of them through `optionalDependencies`
 * and execs whichever arrived.
 *
 * The wrapper is generated here rather than committed with those
 * `optionalDependencies` already in place, because they cannot be resolved
 * until the platform packages exist on the registry — and an unresolvable
 * optional dependency is a hard error for both npm and Yarn, which would break
 * `yarn install` for the whole react-spectrum monorepo. Keeping the committed
 * manifest free of them keeps the repo installable; this script produces the
 * published shape.
 *
 *   node scripts/build-npm-packages.mjs            # cross-compile, then stage
 *   node scripts/build-npm-packages.mjs --no-build # stage prebuilt CI artifacts
 *   node scripts/build-npm-packages.mjs --targets=darwin-arm64,linux-x64
 *
 * With --no-build the binaries are expected at target/<rust-target>/release/,
 * which is where `cargo build --target` leaves them and therefore what CI
 * should collect from each runner. `--targets` narrows the matrix, which is
 * how a single runner stages just the platform it built; note that a wrapper
 * generated from a narrowed matrix only lists the targets it was given, so the
 * publishable wrapper has to come from a full run.
 */

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const CRATE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(CRATE_DIR, 'npm');

/**
 * The platform matrix.
 *
 * `os`, `cpu` and `libc` are npm's own vocabulary and must match what
 * `process.platform`/`process.arch` report, because `bin/tsdiff` derives the
 * package name it looks for from those at runtime rather than reading this
 * table. Adding a target here and to CI is all a new platform needs.
 *
 * Windows is deliberately absent: the extractor builds its Parcel work
 * directory out of symlinks and currently refuses to run there, so publishing a
 * win32 binary would only turn a clear "not supported" into a confusing
 * runtime failure.
 */
const TARGETS = [
  {suffix: 'darwin-arm64', rust: 'aarch64-apple-darwin', os: 'darwin', cpu: 'arm64'},
  {suffix: 'darwin-x64', rust: 'x86_64-apple-darwin', os: 'darwin', cpu: 'x64'},
  {suffix: 'linux-x64', rust: 'x86_64-unknown-linux-gnu', os: 'linux', cpu: 'x64', libc: 'glibc'},
  {suffix: 'linux-arm64', rust: 'aarch64-unknown-linux-gnu', os: 'linux', cpu: 'arm64', libc: 'glibc'},
  {suffix: 'linux-x64-musl', rust: 'x86_64-unknown-linux-musl', os: 'linux', cpu: 'x64', libc: 'musl'},
  {suffix: 'linux-arm64-musl', rust: 'aarch64-unknown-linux-musl', os: 'linux', cpu: 'arm64', libc: 'musl'}
];

const manifest = readJson(path.join(CRATE_DIR, 'package.json'));
const {name, version} = manifest;
const shouldBuild = !process.argv.includes('--no-build');
const targets = selectedTargets();

fs.rmSync(OUT_DIR, {recursive: true, force: true});
fs.mkdirSync(OUT_DIR, {recursive: true});

const staged = [];
for (const target of targets) {
  if (shouldBuild) {
    build(target);
  }
  const binary = path.join(CRATE_DIR, 'target', target.rust, 'release', name);
  if (!fs.existsSync(binary)) {
    // Staging a wrapper that promises a package we never built would fail at
    // publish time or, worse, install a broken tree.
    throw new Error(
      `missing binary for ${target.suffix} at ${path.relative(CRATE_DIR, binary)}\n` +
        (shouldBuild ? '' : 'Run without --no-build, or collect the CI artifact for this target first.')
    );
  }
  staged.push(stagePlatformPackage(target, binary));
}

stageWrapper(staged);

console.log(`\nStaged ${staged.length + 1} packages in ${path.relative(process.cwd(), OUT_DIR)}`);
console.log('Publish the platform packages before the wrapper, or its optionalDependencies will not resolve.');

function build(target) {
  console.log(`building ${target.rust}`);
  execFileSync('cargo', ['build', '--release', '--target', target.rust], {
    cwd: CRATE_DIR,
    stdio: 'inherit'
  });
}

/** The matrix, narrowed by `--targets=` when given. */
function selectedTargets() {
  const arg = process.argv.find((a) => a.startsWith('--targets='));
  if (!arg) {
    return TARGETS;
  }

  const wanted = arg.slice('--targets='.length).split(',').filter(Boolean);
  const unknown = wanted.filter((w) => !TARGETS.some((t) => t.suffix === w));
  if (unknown.length > 0) {
    throw new Error(
      `unknown target(s): ${unknown.join(', ')}\nKnown: ${TARGETS.map((t) => t.suffix).join(', ')}`
    );
  }
  return TARGETS.filter((t) => wanted.includes(t.suffix));
}

/** One package per platform, carrying only the executable. */
function stagePlatformPackage(target, binary) {
  const pkgName = `${name}-${target.suffix}`;
  const dir = path.join(OUT_DIR, pkgName);
  fs.mkdirSync(dir, {recursive: true});

  writeJson(path.join(dir, 'package.json'), {
    name: pkgName,
    version,
    description: `The ${name} binary for ${target.os} ${target.cpu}.`,
    license: manifest.license,
    repository: manifest.repository,
    publishConfig: manifest.publishConfig,
    os: [target.os],
    cpu: [target.cpu],
    ...(target.libc ? {libc: [target.libc]} : {}),
    // Yarn PnP would otherwise keep the package zipped, and an executable has
    // to exist on disk to be executed.
    preferUnplugged: true,
    files: [name]
  });

  // Copy rather than link so the staged tree is self-contained, and restore the
  // executable bit that a copy does not always carry.
  const dest = path.join(dir, name);
  fs.copyFileSync(binary, dest);
  fs.chmodSync(dest, 0o755);

  console.log(`  staged ${pkgName}`);
  return pkgName;
}

/** The wrapper users actually install. */
function stageWrapper(platformPackages) {
  const dir = path.join(OUT_DIR, name);
  fs.mkdirSync(path.join(dir, 'bin'), {recursive: true});

  const published = {...manifest};
  // `private` exists only to keep the in-repo copy from being published by
  // accident; publishing the generated one is the whole point.
  delete published.private;
  // Build scripts are meaningless to a consumer and reference files that are
  // not published.
  delete published.scripts;
  published.optionalDependencies = Object.fromEntries(
    platformPackages.map((pkg) => [pkg, version])
  );

  writeJson(path.join(dir, 'package.json'), published);
  fs.copyFileSync(path.join(CRATE_DIR, 'bin', name), path.join(dir, 'bin', name));
  fs.chmodSync(path.join(dir, 'bin', name), 0o755);
  fs.copyFileSync(path.join(CRATE_DIR, 'README.md'), path.join(dir, 'README.md'));

  console.log(`  staged ${name}`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
