#!/usr/bin/env node
import {createRequire} from 'module';
import fg from 'fast-glob';
import {fileURLToPath, pathToFileURL} from 'url';
import fs from 'fs';
import path from 'path';
// eslint-disable-next-line rulesdir/imports
import * as ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../../..');
const OUT_DIR = path.resolve(__dirname, '../dist/data');

const ICONS_DIR = path.resolve(REPO_ROOT, 'packages/@react-spectrum/s2/s2wf-icons');
const ILLUSTRATIONS_DIR = path.resolve(REPO_ROOT, 'packages/@react-spectrum/s2/spectrum-illustrations/linear');
const ICON_ALIASES_JS = path.resolve(REPO_ROOT, 'packages/dev/s2-docs/src/iconAliases.js');
const ILLUSTRATION_ALIASES_JS = path.resolve(REPO_ROOT, 'packages/dev/s2-docs/src/illustrationAliases.js');
const STYLE_PROPERTIES_TS = path.resolve(REPO_ROOT, 'packages/dev/s2-docs/src/styleProperties.ts');

function ensureDir(p) {
  fs.mkdirSync(p, {recursive: true});
}

function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('Wrote', path.relative(REPO_ROOT, file));
}

async function importTsModule(tsFilePath) {
  if (!fs.existsSync(tsFilePath)) {
    throw new Error(`TS module not found: ${tsFilePath}`);
  }
  const sourceText = fs.readFileSync(tsFilePath, 'utf8');
  const result = ts.transpileModule(sourceText, {
    fileName: tsFilePath,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      esModuleInterop: true
    }
  });
  const url = `data:text/javascript;base64,${Buffer.from(result.outputText, 'utf8').toString('base64')}`;
  return import(url);
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

function buildBaseColorKeysFromSpectrumTokens(tokens) {
  const keys = new Set();

  // Matches spectrum-theme.ts
  keys.add('transparent');
  keys.add('black');
  keys.add('white');

  const addScale = (scale) => {
    const re = new RegExp(`^${scale}-\\d+$`);
    for (const tokenName of Object.keys(tokens)) {
      if (re.test(tokenName)) {
        // Match @react-spectrum/s2/style/tokens.ts behavior: strip "-color" in the middle.
        keys.add(tokenName.replace('-color', ''));
      }
    }
  };

  // Global color scales
  for (const scale of [
    'gray', 'blue', 'red', 'orange', 'yellow', 'chartreuse', 'celery', 'green',
    'seafoam', 'cyan', 'indigo', 'purple', 'fuchsia', 'magenta', 'pink',
    'turquoise', 'brown', 'silver', 'cinnamon'
  ]) {
    addScale(scale);
  }

  // Semantic color scales
  for (const scale of ['accent-color', 'informative-color', 'negative-color', 'notice-color', 'positive-color']) {
    addScale(scale);
  }

  // Simple transparent scales (names remain unchanged)
  for (const scale of ['transparent-white', 'transparent-black']) {
    const re = new RegExp(`^${scale}-\\d+$`);
    for (const tokenName of Object.keys(tokens)) {
      if (re.test(tokenName)) {
        keys.add(tokenName);
      }
    }
  }

  // Overlay scale keys (derived in tokens.ts, we only need the names here)
  for (const n of [25, 50, 75, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]) {
    keys.add(`transparent-overlay-${n}`);
  }

  // High contrast keywords (matches spectrum-theme.ts)
  for (const k of ['Background', 'ButtonBorder', 'ButtonFace', 'ButtonText', 'Field', 'Highlight', 'HighlightText', 'GrayText', 'Mark', 'LinkText']) {
    keys.add(k);
  }

  return Array.from(keys).sort((a, b) => a.localeCompare(b));
}

function buildExpandedStyleMacroPropertyValues(styleProperties, spacingTypeValues, baseColorKeys) {
  const out = {};

  for (const [propertyName, def] of Object.entries(styleProperties)) {
    const values = [];
    const seen = new Set();

    const pushUnique = (items) => {
      for (const v of items) {
        const s = String(v);
        if (!seen.has(s)) {
          seen.add(s);
          values.push(s);
        }
      }
    };

    // Expand 'baseColors' placeholder into actual color token names.
    const expandedBase = [];
    for (const v of def.values ?? []) {
      if (v === 'baseColors') {
        expandedBase.push(...baseColorKeys);
      } else {
        expandedBase.push(v);
      }
    }
    pushUnique(expandedBase);

    // Expand spacing type placeholders into the actual numeric values shown in docs.
    const additionalTypes = Array.isArray(def.additionalTypes) ? def.additionalTypes : [];
    if (additionalTypes.includes('baseSpacing')) {
      pushUnique(spacingTypeValues?.baseSpacing ?? []);
    }
    if (additionalTypes.includes('negativeSpacing')) {
      pushUnique(spacingTypeValues?.negativeSpacing ?? []);
    }

    out[propertyName] = {
      values,
      additionalTypes
    };
  }

  return out;
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

  // Style macro property definitions
  const stylePropsMod = await importTsModule(STYLE_PROPERTIES_TS);
  const propertyCategories = ['color', 'dimensions', 'text', 'effects', 'layout', 'misc', 'conditions'];
  const styleProperties = {};
  for (const category of propertyCategories) {
    Object.assign(styleProperties, stylePropsMod.getPropertyDefinitions(category));
  }
  writeJson(path.join(OUT_DIR, 'styleProperties.json'), styleProperties);

  const require = createRequire(import.meta.url);
  const spectrumTokens = require('@adobe/spectrum-tokens/dist/json/variables.json');
  const baseColorKeys = buildBaseColorKeysFromSpectrumTokens(spectrumTokens);
  const expanded = buildExpandedStyleMacroPropertyValues(styleProperties, stylePropsMod.spacingTypeValues, baseColorKeys);
  writeJson(path.join(OUT_DIR, 'styleMacroPropertyValues.json'), expanded);
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
