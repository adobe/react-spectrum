#!/usr/bin/env node
import fg from 'fast-glob';
import {fileURLToPath, pathToFileURL} from 'url';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../../..');
const OUT_DIR = path.resolve(__dirname, '../dist/data');

const ICONS_DIR = path.resolve(REPO_ROOT, 'packages/@react-spectrum/s2/s2wf-icons');
const ILLUSTRATIONS_DIR = path.resolve(REPO_ROOT, 'packages/@react-spectrum/s2/spectrum-illustrations/linear');
const ICON_ALIASES_JS = path.resolve(REPO_ROOT, 'packages/dev/s2-docs/src/iconAliases.js');
const ILLUSTRATION_ALIASES_JS = path.resolve(REPO_ROOT, 'packages/dev/s2-docs/src/illustrationAliases.js');

function ensureDir(p) {
  fs.mkdirSync(p, {recursive: true});
}

function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('Wrote', path.relative(REPO_ROOT, file));
}

function buildIconNames() {
  if (!fs.existsSync(ICONS_DIR)) {
    throw new Error(`Icons directory not found: ${ICONS_DIR}`);
  }
  const files = fg.sync('*.svg', {cwd: ICONS_DIR, absolute: false, suppressErrors: true});
  if (files.length === 0) {
    throw new Error(`No icon SVG files found in: ${ICONS_DIR}`);
  }
  const ids = Array.from(new Set(
    files.map(f => f.replace(/\.svg$/i, '').replace(/^S2_Icon_(.*?)(Size\d+)?_2.*/, '$1'))
  )).sort((a, b) => a.localeCompare(b));
  return ids;
}

function buildIllustrationNames() {
  if (!fs.existsSync(ILLUSTRATIONS_DIR)) {
    throw new Error(`Illustrations directory not found: ${ILLUSTRATIONS_DIR}`);
  }
  const files = fg.sync('**/*.svg', {cwd: ILLUSTRATIONS_DIR, absolute: false, suppressErrors: true});
  if (files.length === 0) {
    throw new Error(`No illustration SVG files found in: ${ILLUSTRATIONS_DIR}`);
  }
  const ids = Array.from(new Set(
    files.map(f => {
      const base = f.replace(/\.svg$/i, '').replace(/^S2_lin_(.*)_\d+$/, '$1');
      return base ? (base.charAt(0).toUpperCase() + base.slice(1)) : base;
    })
  )).sort((a, b) => a.localeCompare(b));
  return ids;
}

async function loadAliases(modPath, exportName) {
  if (!fs.existsSync(modPath)) {return {};} 
  const mod = await import(pathToFileURL(modPath).href);
  return mod[exportName] ?? {};
}

async function main() {
  const icons = buildIconNames();
  const illustrations = buildIllustrationNames();
  const iconAliases = await loadAliases(ICON_ALIASES_JS, 'iconAliases');
  const illustrationAliases = await loadAliases(ILLUSTRATION_ALIASES_JS, 'illustrationAliases');

  writeJson(path.join(OUT_DIR, 'icons.json'), icons);
  writeJson(path.join(OUT_DIR, 'illustrations.json'), illustrations);
  writeJson(path.join(OUT_DIR, 'iconAliases.json'), iconAliases);
  writeJson(path.join(OUT_DIR, 'illustrationAliases.json'), illustrationAliases);
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
