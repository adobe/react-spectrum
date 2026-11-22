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

import crypto from 'node:crypto';
import fs from 'node:fs';
import glob from 'fast-glob';
import {mdxToMarkdown} from 'mdast-util-mdx';
import {packTarGz} from './tarArchive.mjs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Project, SyntaxKind, ts} from 'ts-morph';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import {toMarkdown} from 'mdast-util-to-markdown';
import {unified} from 'unified';
import {visit} from 'unist-util-visit';
import vm from 'node:vm';

export const CATALOG_SCHEMA_VERSION = 1;
export const MIN_READER_SCHEMA_VERSION = 1;
export const EXTRACTOR_VERSION = '1.0.0';

const LICENSE_COMMENT_REGEX = /\{\/\*\s*Copyright[\s\S]*?\*\/\}\s*/m;
const MID_FILE_FRONTMATTER_REGEX = /(?:^|\n)---\r?\n([\s\S]*?)\r?\n---(?=\r?\n|$)/m;
const HIGHLIGHT_COMMENT_REGEX =
  /\s*\{\/\*-\s*(?:begin|end)\s+(?:highlight|collapse)\s*-\*\/\}|\s*\/\*-\s*(?:begin|end)\s+(?:highlight|collapse)\s*-\*\//g;

const OMITTED_PROP_NAMES = new Set(['UNSAFE_className', 'UNSAFE_style', 'key', 'ref']);

const GENERIC_INHERITED_INTERFACES = new Set([
  'DOMProps',
  'AriaLabelingProps',
  'AriaValidationProps',
  'FocusableDOMProps',
  'FocusableProps',
  'GlobalDOMAttributes',
  'HelpTextProps',
  'HoverEvents',
  'InputDOMProps',
  'KeyboardEvents',
  'LabelableProps',
  'LinkDOMProps',
  'PressEvents',
  'RouterOptions',
  'SpectrumLabelableProps',
  'StyleProps',
  'TextInputDOMEvents',
  'TextInputDOMProps',
  'ValueBase'
]);

const CONTROLLED_STATE_TRIPLETS = [
  ['selectedKey', 'defaultSelectedKey', 'onSelectionChange'],
  ['selectedKeys', 'defaultSelectedKeys', 'onSelectionChange'],
  ['inputValue', 'defaultInputValue', 'onInputChange'],
  ['value', 'defaultValue', 'onChange'],
  ['isSelected', 'defaultSelected', 'onChange'],
  ['isOpen', 'defaultOpen', 'onOpenChange'],
  ['isExpanded', 'defaultExpanded', 'onExpandedChange'],
  ['expandedKeys', 'defaultExpandedKeys', 'onExpandedChange']
];

export function sha256Hex(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function encodePackageSliceName(pkgName, pkgVersion) {
  return `${pkgName.replace(/^@/, '').replace(/\//g, '__')}@${pkgVersion}`;
}

function cleanTypeString(raw) {
  if (!raw) {
    return 'unknown';
  }
  return raw
    .replace(/import\([^)]+\)\./g, '')
    .replace(/\bReact\.ReactNode\b/g, 'ReactNode')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseSimpleYamlFrontmatter(yamlBlock) {
  let meta = {keywords: [], category: null, type: null};
  if (!yamlBlock) {
    return meta;
  }
  for (let line of yamlBlock.split(/\r?\n/)) {
    let m = line.match(/^([\w-]+)\s*:\s*(.+)$/);
    if (!m) {
      continue;
    }
    let [, key, rawVal] = m;
    let val = rawVal.trim();
    if (key === 'keywords') {
      let inner = val.replace(/^\[|\]$/g, '');
      meta.keywords = inner
        .split(',')
        .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
    } else if (key === 'category') {
      meta.category = val.replace(/^['"]|['"]$/g, '');
    } else if (key === 'type') {
      meta.type = val.replace(/^['"]|['"]$/g, '');
    }
  }
  return meta;
}

function parseEsmMetadata(rawMdx) {
  let tags = [];
  let section = null;
  let description = null;

  let tagsMatch = rawMdx.match(/export\s+const\s+tags\s*=\s*\[([^\]]*)\]/m);
  if (tagsMatch) {
    tags = tagsMatch[1]
      .split(',')
      .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }
  let secMatch = rawMdx.match(/export\s+const\s+section\s*=\s*['"]([^'"]+)['"]/m);
  if (secMatch) {
    section = secMatch[1].trim();
  }
  let descMatch = rawMdx.match(
    /export\s+const\s+description\s*=\s*("(?:[^"\\\r\n]|\\.)*"|'(?:[^'\\\r\n]|\\.)*')/
  );
  if (descMatch) {
    let source = ts.createSourceFile('description.ts', descMatch[1], ts.ScriptTarget.Latest);
    let statement = source.statements[0];
    if (ts.isExpressionStatement(statement) && ts.isStringLiteral(statement.expression)) {
      description = statement.expression.text.trim();
    }
  }

  let docsImports = new Map();
  let importRe = /import\s+([\w$]+)\s+from\s+['"]docs:([^'"]+)['"]/g;
  let match;
  while ((match = importRe.exec(rawMdx)) !== null) {
    docsImports.set(match[1], match[2]);
  }

  return {tags, section, description, docsImports};
}

function getReactAriaPageLibrary(rawMdx, pageName, slug) {
  let {docsImports} = parseEsmMetadata(rawMdx);
  if (/^use[A-Z]/.test(pageName)) {
    // A page may document several related hooks from both libraries. Use the
    // package of the export that matches the page name.
    for (let [, alias, exportName] of rawMdx.matchAll(/([\w$]+)\.exports\.([\w$]+)/g)) {
      let pkg = docsImports.get(alias);
      if (exportName === pageName && pkg) {
        return /^(?:@react-stately\/|react-stately(?:\/|$))/.test(pkg)
          ? 'react-stately'
          : 'react-aria';
      }
    }
    return 'react-aria';
  }

  // Component testing guides import `@react-aria/test-utils` but belong under RAC.
  if (pageName === 'testing' || slug.endsWith('/testing')) {
    return 'rac';
  }

  let docPackages = [...docsImports.values()].filter(pkg => pkg !== '@react-aria/test-utils');
  if (docPackages.some(pkg => /^react-aria-components(?:\/|$)/.test(pkg))) {
    return 'rac';
  }
  let hasStately = docPackages.some(pkg => /^(?:@react-stately\/|react-stately(?:\/|$))/.test(pkg));
  let hasAria = docPackages.some(pkg => /^(?:@react-aria\/|react-aria(?:\/|$))/.test(pkg));
  if (hasStately && !hasAria) {
    return 'react-stately';
  }
  if (hasAria) {
    return 'react-aria';
  }
  return 'rac';
}

function classifyHeadingCategory(heading, slug) {
  let h = heading.toLowerCase();
  if (
    h === 'props' ||
    h === 'api' ||
    h === 'events' ||
    h === 'render props' ||
    h === 'methods' ||
    h === 'properties' ||
    h === 'return value' ||
    h === 'parameters' ||
    h.endsWith(' props')
  ) {
    return 'api';
  }
  if (
    h.includes('accessib') ||
    h.includes('labeling') ||
    h.includes('keyboard') ||
    h.includes('aria') ||
    h.includes('internationalization')
  ) {
    return 'accessibility';
  }
  if (
    h.includes('styl') ||
    h.includes('tailwind') ||
    h.includes('vanilla css') ||
    h.includes('customiz') ||
    h.includes('css') ||
    slug === 'styling' ||
    slug === 'style-macro'
  ) {
    return 'styling';
  }
  if (h.includes('test')) {
    return 'testing';
  }
  return 'usage';
}

function slugifyHeading(heading) {
  return (
    heading
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') || 'overview'
  );
}

/**
 * Indexes all workspace packages inside `targetRoot` and constructs an isolated ts-morph Project
 * whose cross-package imports resolve strictly within `targetRoot` (never leaking HEAD workspace
 * symlinks).
 */
function createTargetWorkspaceContext(targetRoot, repoRoot) {
  let pkgJsonPaths = glob.sync('packages/**/package.json', {
    cwd: targetRoot,
    absolute: true,
    ignore: ['**/node_modules/**', '**/dist/**']
  });

  let packagesByName = new Map();
  let packageVersions = {};
  let tsPaths = {};

  for (let pkgJsonPath of pkgJsonPaths) {
    let pkgJson;
    try {
      pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    } catch {
      continue;
    }
    if (!pkgJson.name || !pkgJson.version) {
      continue;
    }

    let pkgDir = path.dirname(pkgJsonPath);
    let supportsSubpathExports = Boolean(pkgJson.exports && pkgJson.exports['./*'] !== undefined);
    let sourceEntry =
      (typeof pkgJson.exports?.['.'] === 'object' &&
        (pkgJson.exports['.']?.source || pkgJson.exports['.']?.types)) ||
      pkgJson.source ||
      (typeof pkgJson.types === 'string' && !pkgJson.types.startsWith('dist/')
        ? pkgJson.types
        : null) ||
      'src/index.ts';
    let resolvedEntry = path.resolve(
      pkgDir,
      Array.isArray(sourceEntry) ? sourceEntry[0] : sourceEntry
    );
    if (!fs.existsSync(resolvedEntry)) {
      let fallbacks = [
        path.join(pkgDir, 'exports/index.ts'),
        path.join(pkgDir, 'src/index.ts'),
        path.join(pkgDir, 'src/index.tsx'),
        path.join(pkgDir, 'src/index.d.ts'),
        path.join(pkgDir, 'index.ts'),
        path.join(pkgDir, 'index.d.ts')
      ];
      resolvedEntry = fallbacks.find(p => fs.existsSync(p)) || resolvedEntry;
    }

    packagesByName.set(pkgJson.name, {
      name: pkgJson.name,
      version: pkgJson.version,
      dir: pkgDir,
      entry: resolvedEntry,
      exportsField: pkgJson.exports || null,
      supportsSubpathExports,
      dependencies: pkgJson.dependencies || {}
    });

    if (!pkgJson.private) {
      packageVersions[pkgJson.name] = pkgJson.version;
    }

    if (fs.existsSync(resolvedEntry)) {
      tsPaths[pkgJson.name] = [resolvedEntry];
    }
    let subpathCandidates = [];
    if (fs.existsSync(path.join(pkgDir, 'exports'))) {
      subpathCandidates.push(path.join(pkgDir, 'exports/*'));
    }
    if (fs.existsSync(path.join(pkgDir, 'src'))) {
      subpathCandidates.push(path.join(pkgDir, 'src/*'));
    }
    subpathCandidates.push(path.join(pkgDir, '*'));
    tsPaths[`${pkgJson.name}/*`] = subpathCandidates;
  }

  // External type definitions resolved from repoRoot/node_modules (no yarn install needed in worktrees).
  let reactTypes = path.join(repoRoot, 'node_modules/@types/react/index.d.ts');
  if (fs.existsSync(reactTypes)) {
    tsPaths.react = [reactTypes];
    tsPaths['react/*'] = [path.join(repoRoot, 'node_modules/@types/react/*')];
  }
  let reactDomTypes = path.join(repoRoot, 'node_modules/@types/react-dom/index.d.ts');
  if (fs.existsSync(reactDomTypes)) {
    tsPaths['react-dom'] = [reactDomTypes];
  }
  let cssTypePath = path.join(repoRoot, 'node_modules/csstype/index.d.ts');
  if (fs.existsSync(cssTypePath)) {
    tsPaths.csstype = [cssTypePath];
  }
  let spectrumTokensDir = path.join(repoRoot, 'node_modules/@adobe/spectrum-tokens');
  if (fs.existsSync(spectrumTokensDir)) {
    tsPaths['@adobe/spectrum-tokens/*'] = [path.join(spectrumTokensDir, '*')];
  }

  let project = new Project({
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: false,
    compilerOptions: {
      target: 99,
      module: 99,
      moduleResolution: 100, // Bundler
      jsx: 1, // Preserve
      allowJs: true,
      resolveJsonModule: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
      skipLibCheck: true,
      baseUrl: targetRoot,
      paths: tsPaths,
      typeRoots: [path.join(repoRoot, 'node_modules/@types')]
    }
  });

  for (let dtsRel of ['lib/svg.d.ts', 'lib/css.d.ts', 'lib/viewTransitions.d.ts']) {
    let candidate = path.join(targetRoot, dtsRel);
    if (fs.existsSync(candidate)) {
      project.addSourceFileAtPathIfExists(candidate);
    }
  }

  return {
    targetRoot,
    repoRoot,
    packagesByName,
    packageVersions,
    project,
    exportCache: new Map()
  };
}

function getJsDocSummary(node) {
  if (!node || typeof node.getJsDocs !== 'function') {
    return {
      description: '',
      defaultValue: undefined,
      selector: undefined,
      deprecated: false,
      deprecationMessage: undefined,
      isPrivate: false
    };
  }
  let docs = node.getJsDocs();
  if (!docs || docs.length === 0) {
    return {
      description: '',
      defaultValue: undefined,
      selector: undefined,
      deprecated: false,
      deprecationMessage: undefined,
      isPrivate: false
    };
  }
  let doc = docs[docs.length - 1];
  let description = (doc.getDescription() || '')
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  let defaultValue;
  let selector;
  let deprecated = false;
  let deprecationMessage;
  let isPrivate = false;

  for (let tag of doc.getTags()) {
    let tagName = tag.getTagName();
    let text = (tag.getCommentText?.() || '').replace(/\s+/g, ' ').trim();
    if (tagName === 'default' && text) {
      defaultValue = text;
    } else if (tagName === 'selector' && text) {
      selector = text;
    } else if (tagName === 'deprecated') {
      deprecated = true;
      if (text) {
        deprecationMessage = text;
      }
    } else if (tagName === 'private' || tagName === 'internal') {
      isPrivate = true;
    }
  }

  return {description, defaultValue, selector, deprecated, deprecationMessage, isPrivate};
}

function resolveSymbolSourceFile(ctx, pkgName, symbolName) {
  let pkg = ctx.packagesByName.get(pkgName);
  if (!pkg) {
    return null;
  }

  let baseName = symbolName.replace(/(?:Props|RenderProps|Value)$/, '');
  let candidates = [
    path.join(pkg.dir, 'src', `${symbolName}.tsx`),
    path.join(pkg.dir, 'src', `${symbolName}.ts`),
    path.join(pkg.dir, 'exports', `${symbolName}.ts`),
    path.join(pkg.dir, 'src', `${baseName}.tsx`),
    path.join(pkg.dir, 'src', `${baseName}.ts`),
    path.join(pkg.dir, 'exports', `${baseName}.ts`),
    pkg.entry
  ];

  for (let candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      let sf = ctx.project.addSourceFileAtPathIfExists(candidate);
      if (sf) {
        let exported = sf.getExportedDeclarations();
        if (
          exported.has(symbolName) ||
          exported.has(`Spectrum${symbolName}Props`) ||
          exported.has(`${symbolName}Props`) ||
          sf.getInterface(symbolName) ||
          sf.getInterface(`${symbolName}Props`) ||
          sf.getTypeAlias(`${symbolName}Props`)
        ) {
          return sf;
        }
      }
    }
  }

  if (pkg.entry && fs.existsSync(pkg.entry)) {
    let entrySf = ctx.project.addSourceFileAtPathIfExists(pkg.entry);
    if (entrySf) {
      let exported = entrySf.getExportedDeclarations();
      let decls =
        exported.get(symbolName) ||
        exported.get(`${symbolName}Props`) ||
        exported.get(`Spectrum${symbolName}Props`);
      if (decls && decls.length > 0) {
        return decls[0].getSourceFile();
      }
    }
  }

  return null;
}

function extractTypeParameters(decl) {
  if (!decl || typeof decl.getTypeParameters !== 'function') {
    return [];
  }
  return decl.getTypeParameters().map(tp => ({
    name: tp.getName(),
    constraint: tp.getConstraint() ? cleanTypeString(tp.getConstraint().getText()) : undefined,
    defaultType: tp.getDefault() ? cleanTypeString(tp.getDefault().getText()) : undefined
  }));
}

function synthesizeConstraints(props, events, library) {
  let propNames = new Set(props.map(p => p.name));
  let eventNames = new Set(events.map(e => e.name));
  let constraints = [];

  for (let [controlled, uncontrolled, handler] of CONTROLLED_STATE_TRIPLETS) {
    if (propNames.has(controlled) && propNames.has(uncontrolled)) {
      let involved = [controlled, uncontrolled];
      if (eventNames.has(handler)) {
        involved.push(handler);
      }
      constraints.push({
        kind: 'controlled-pair',
        props: involved,
        description: `Pass either \`${controlled}\` (controlled${eventNames.has(handler) ? ` with \`${handler}\`` : ''}) or \`${uncontrolled}\` (uncontrolled), not both.`
      });
    }
  }

  if (propNames.has('items') && propNames.has('defaultItems')) {
    constraints.push({
      kind: 'mutual-exclusion',
      props: ['items', 'defaultItems'],
      description:
        'Use `items` for controlled dynamic collections or `defaultItems` for uncontrolled built-in filtering, not both.'
    });
  }

  if (propNames.has('label') || propNames.has('aria-label') || propNames.has('aria-labelledby')) {
    let namingProps = ['label', 'aria-label', 'aria-labelledby'].filter(p => propNames.has(p));
    if (namingProps.length >= 2) {
      constraints.push({
        kind: 'mutual-exclusion',
        props: namingProps,
        description: propNames.has('label')
          ? 'Every interactive control requires an accessible name: prefer a visible `label`, or provide `aria-label` / `aria-labelledby` when visually unlabeled.'
          : 'Provide an accessible name via a child `<Label>`, `aria-label`, or `aria-labelledby`.'
      });
    }
  }

  if (library === 's2' && propNames.has('styles')) {
    constraints.push({
      kind: 'style-restriction',
      props: ['styles'],
      description:
        'The `styles` prop on Spectrum 2 components accepts layout/positioning properties from `style({...})` (margins, sizing, flex/grid item placement), not internal colors or padding.'
    });
  }

  return constraints;
}

/**
 * Extracts structured TypeScript API metadata (props, events, renderProps, generics, signatures,
 * constraints) for an exported component, hook, function, interface, or class inside `targetRoot`.
 */
export function extractExportIR(ctx, pkgName, exportName, library) {
  let cacheKey = `${pkgName}::${exportName}`;
  if (ctx.exportCache.has(cacheKey)) {
    return ctx.exportCache.get(cacheKey);
  }

  let sf = resolveSymbolSourceFile(ctx, pkgName, exportName);
  if (!sf) {
    ctx.exportCache.set(cacheKey, null);
    return null;
  }

  let exportedMap = sf.getExportedDeclarations();
  let primaryDecls = exportedMap.get(exportName) || [];
  let primaryDecl =
    primaryDecls[0] ||
    sf.getInterface(exportName) ||
    sf.getFunction(exportName) ||
    sf.getClass(exportName) ||
    sf.getVariableDeclaration(exportName) ||
    sf.getTypeAlias(exportName);

  // Locate component Props declaration if exportName is a component or Props interface
  let propsDeclNames = exportName.endsWith('Props')
    ? [exportName]
    : [`Spectrum${exportName}Props`, `${exportName}Props`];

  let propsDecl = null;
  for (let pName of propsDeclNames) {
    propsDecl =
      sf.getInterface(pName) || sf.getTypeAlias(pName) || exportedMap.get(pName)?.[0] || null;
    if (propsDecl) {
      break;
    }
  }

  let description = '';
  if (primaryDecl) {
    let docInfo = getJsDocSummary(primaryDecl);
    if (!docInfo.description && primaryDecl.getKind() === SyntaxKind.VariableDeclaration) {
      let stmt = primaryDecl.getFirstAncestorByKind(SyntaxKind.VariableStatement);
      docInfo = getJsDocSummary(stmt);
    }
    description = docInfo.description;
  }
  if (!description && propsDecl) {
    description = getJsDocSummary(propsDecl).description;
  }

  let exportKind = 'component';
  if (/^use[A-Z]/.test(exportName)) {
    exportKind = 'hook';
  } else if (primaryDecl?.getKind() === SyntaxKind.ClassDeclaration) {
    exportKind = 'class';
  } else if (
    primaryDecl?.getKind() === SyntaxKind.InterfaceDeclaration ||
    exportName.endsWith('Props')
  ) {
    exportKind = 'interface';
  } else if (primaryDecl?.getKind() === SyntaxKind.TypeAliasDeclaration) {
    exportKind = 'type';
  } else if (!propsDecl && /^[a-z]/.test(exportName)) {
    exportKind = 'function';
  }

  let typeParameters = extractTypeParameters(propsDecl || primaryDecl);
  let typeText;
  if (exportKind === 'type' && primaryDecl?.getKind() === SyntaxKind.TypeAliasDeclaration) {
    let typeNode = primaryDecl.getTypeNode?.();
    if (typeNode) {
      typeText = cleanTypeString(typeNode.getText());
    }
  }
  let callSignatures = [];

  if ((exportKind === 'hook' || exportKind === 'function') && primaryDecl) {
    let fnType = primaryDecl.getType();
    for (let sig of fnType.getCallSignatures()) {
      let params = sig.getParameters().map(paramSym => {
        let pDecl = paramSym.getDeclarations()?.[0];
        let pType = pDecl ? cleanTypeString(pDecl.getType().getText(pDecl)) : 'unknown';
        let optional = Boolean(pDecl?.hasQuestionToken?.());
        let pDoc = getJsDocSummary(pDecl);
        return {
          name: paramSym.getName(),
          type: pType,
          optional,
          description: pDoc.description
        };
      });
      let returnType = cleanTypeString(sig.getReturnType().getText(primaryDecl));
      let sigStr = `${exportName}(${params.map(p => `${p.name}${p.optional ? '?' : ''}: ${p.type}`).join(', ')}): ${returnType}`;
      callSignatures.push({
        signature: sigStr,
        parameters: params,
        returnType
      });
    }

    // If hook takes an options object as its first parameter, also extract its properties as props/events!
    if (!propsDecl && callSignatures.length > 0 && callSignatures[0].parameters.length > 0) {
      let firstSig = primaryDecl.getType().getCallSignatures()[0];
      let firstParam = firstSig?.getParameters()?.[0]?.getDeclarations()?.[0];
      let paramTypeSymbol =
        firstParam?.getType()?.getSymbol() || firstParam?.getType()?.getAliasSymbol();
      let paramDecl = paramTypeSymbol?.getDeclarations()?.[0];
      if (paramDecl) {
        propsDecl = paramDecl;
      }
    }
  }

  let props = [];
  let events = [];
  let slots = new Set();

  if (exportKind === 'class' && primaryDecl?.getKind() === SyntaxKind.ClassDeclaration) {
    const isHiddenMember = decl =>
      Boolean(
        decl.hasModifier?.(SyntaxKind.PrivateKeyword) ||
        decl.hasModifier?.(SyntaxKind.ProtectedKeyword)
      );

    // 1. Constructors -> callSignatures
    const seenCtorSigs = new Set();
    for (let ctor of primaryDecl.getConstructors()) {
      if (isHiddenMember(ctor)) {
        continue;
      }
      let overloads = typeof ctor.getOverloads === 'function' ? ctor.getOverloads() : [];
      let ctorDecls = overloads.length > 0 ? overloads : [ctor];
      for (let cDecl of ctorDecls) {
        let cDoc = getJsDocSummary(cDecl);
        if (cDoc.isPrivate) {
          continue;
        }
        let params = cDecl.getParameters().map(pDecl => {
          let pTypeNode = pDecl.getTypeNode?.();
          let pType = pTypeNode
            ? cleanTypeString(pTypeNode.getText())
            : cleanTypeString(pDecl.getType().getText(pDecl));
          let pDoc = getJsDocSummary(pDecl);
          return {
            name: pDecl.getName(),
            type: pType,
            optional: Boolean(pDecl.isOptional?.() || pDecl.hasQuestionToken?.()),
            description: pDoc.description
          };
        });
        let sigStr = `new ${exportName}(${params.map(p => `${p.name}${p.optional ? '?' : ''}: ${p.type}`).join(', ')}): ${exportName}`;
        if (!seenCtorSigs.has(sigStr)) {
          seenCtorSigs.add(sigStr);
          callSignatures.push({
            signature: sigStr,
            parameters: params,
            returnType: exportName
          });
        }
      }
    }

    // 2. Public properties, parameter properties, and getters -> props
    const seenMemberNames = new Set();
    const addClassMember = item => {
      if (!item.name || item.name.startsWith('#') || seenMemberNames.has(item.name)) {
        return;
      }
      seenMemberNames.add(item.name);
      props.push(item);
    };

    for (let propDecl of primaryDecl.getProperties()) {
      let name = propDecl.getName();
      if (isHiddenMember(propDecl) || name.startsWith('#')) {
        continue;
      }
      let docInfo = getJsDocSummary(propDecl);
      if (docInfo.isPrivate) {
        continue;
      }
      let typeNode = propDecl.getTypeNode?.();
      let typeText = typeNode
        ? cleanTypeString(typeNode.getText())
        : cleanTypeString(propDecl.getType().getText(propDecl));
      addClassMember({
        name,
        type: typeText,
        required: false,
        defaultValue: docInfo.defaultValue,
        description: docInfo.description,
        deprecated: docInfo.deprecated || undefined,
        deprecationMessage: docInfo.deprecationMessage
      });
    }

    for (let ctor of primaryDecl.getConstructors()) {
      if (isHiddenMember(ctor)) {
        continue;
      }
      for (let paramDecl of ctor.getParameters()) {
        if (!paramDecl.isParameterProperty?.() || isHiddenMember(paramDecl)) {
          continue;
        }
        let docInfo = getJsDocSummary(paramDecl);
        if (docInfo.isPrivate) {
          continue;
        }
        let typeNode = paramDecl.getTypeNode?.();
        let typeText = typeNode
          ? cleanTypeString(typeNode.getText())
          : cleanTypeString(paramDecl.getType().getText(paramDecl));
        addClassMember({
          name: paramDecl.getName(),
          type: typeText,
          required: false,
          defaultValue: docInfo.defaultValue,
          description: docInfo.description,
          deprecated: docInfo.deprecated || undefined,
          deprecationMessage: docInfo.deprecationMessage
        });
      }
    }

    for (let getterDecl of primaryDecl.getGetAccessors()) {
      let name = getterDecl.getName();
      if (isHiddenMember(getterDecl) || name.startsWith('#')) {
        continue;
      }
      let docInfo = getJsDocSummary(getterDecl);
      if (docInfo.isPrivate) {
        continue;
      }
      let retNode = getterDecl.getReturnTypeNode?.();
      let typeText = retNode
        ? cleanTypeString(retNode.getText())
        : cleanTypeString(getterDecl.getReturnType().getText(getterDecl));
      addClassMember({
        name,
        type: typeText,
        required: false,
        defaultValue: docInfo.defaultValue,
        description: docInfo.description,
        deprecated: docInfo.deprecated || undefined,
        deprecationMessage: docInfo.deprecationMessage
      });
    }

    // 3. Public methods -> props (with function signature type)
    for (let methodDecl of primaryDecl.getMethods()) {
      let name = methodDecl.getName();
      if (isHiddenMember(methodDecl) || name.startsWith('#')) {
        continue;
      }
      let docInfo = getJsDocSummary(methodDecl);
      if (docInfo.isPrivate) {
        continue;
      }
      let overloads =
        typeof methodDecl.getOverloads === 'function' ? methodDecl.getOverloads() : [];
      let methodDecls = overloads.length > 0 ? overloads : [methodDecl];
      let formatMethodSig = mDecl => {
        let params = mDecl.getParameters().map(pDecl => {
          let pTypeNode = pDecl.getTypeNode?.();
          let pType = pTypeNode
            ? cleanTypeString(pTypeNode.getText())
            : cleanTypeString(pDecl.getType().getText(pDecl));
          let prefix = pDecl.isRestParameter?.() ? '...' : '';
          let optional = pDecl.isOptional?.() || pDecl.hasQuestionToken?.() ? '?' : '';
          return `${prefix}${pDecl.getName()}${optional}: ${pType}`;
        });
        let retNode = mDecl.getReturnTypeNode?.();
        let retType = retNode
          ? cleanTypeString(retNode.getText())
          : cleanTypeString(mDecl.getReturnType().getText(mDecl));
        return `(${params.join(', ')}) => ${retType}`;
      };
      let signatures = [...new Set(methodDecls.map(formatMethodSig))];
      let overloadDoc =
        docInfo.description ||
        methodDecls.map(d => getJsDocSummary(d).description).find(Boolean) ||
        '';
      let isDeprecated = docInfo.deprecated || methodDecls.some(d => getJsDocSummary(d).deprecated);
      let depMsg =
        docInfo.deprecationMessage ||
        methodDecls.map(d => getJsDocSummary(d).deprecationMessage).find(Boolean);
      addClassMember({
        name,
        type: signatures.join(' | '),
        required: false,
        defaultValue: undefined,
        description: overloadDoc,
        deprecated: isDeprecated || undefined,
        deprecationMessage: depMsg
      });
    }
  }

  let targetPropsDecl = propsDecl || (exportKind === 'interface' ? primaryDecl : null);
  if (targetPropsDecl) {
    let ownInterfaceName = targetPropsDecl.getName?.() || `${exportName}Props`;
    let propType = targetPropsDecl.getType();
    for (let sym of propType.getProperties()) {
      let name = sym.getName();
      if (OMITTED_PROP_NAMES.has(name)) {
        continue;
      }
      let decl = sym.getDeclarations()?.[0];
      if (!decl) {
        continue;
      }
      let docInfo = getJsDocSummary(decl);
      if (docInfo.isPrivate) {
        continue;
      }

      let declaringParent =
        decl.getFirstAncestorByKind(SyntaxKind.InterfaceDeclaration)?.getName() ||
        decl.getFirstAncestorByKind(SyntaxKind.TypeAliasDeclaration)?.getName() ||
        undefined;

      // Skip ultra-noisy HTML GlobalDOMAttributes (`onCopyCapture`, `aria-flowto`, etc.) while keeping core labeling/id/slot/className/style
      if (
        declaringParent === 'GlobalDOMAttributes' ||
        declaringParent === 'DOMAttributes' ||
        declaringParent === 'HTMLAttributes' ||
        declaringParent === 'AriaAttributes'
      ) {
        if (!['id', 'slot', 'aria-label', 'aria-labelledby', 'aria-describedby'].includes(name)) {
          continue;
        }
      }

      let inheritedFrom =
        declaringParent &&
        declaringParent !== ownInterfaceName &&
        declaringParent !== `Spectrum${exportName}Props` &&
        declaringParent !== `${exportName}Props`
          ? declaringParent
          : undefined;

      let typeNode = decl.getTypeNode?.();
      let propTypeText = typeNode
        ? cleanTypeString(typeNode.getText())
        : cleanTypeString(sym.getTypeAtLocation(targetPropsDecl).getText(targetPropsDecl));

      let required = !(decl.hasQuestionToken?.() ?? true);
      if (name === 'slot') {
        slots.add('slot');
      }

      let item = {
        name,
        type: propTypeText,
        required,
        defaultValue: docInfo.defaultValue,
        description: docInfo.description,
        inheritedFrom:
          inheritedFrom && GENERIC_INHERITED_INTERFACES.has(inheritedFrom)
            ? inheritedFrom
            : undefined,
        deprecated: docInfo.deprecated || undefined,
        deprecationMessage: docInfo.deprecationMessage
      };

      if (/^on[A-Z]/.test(name)) {
        events.push(item);
      } else {
        props.push(item);
      }
    }
  }

  // Sort active component-specific props first (required first, then alphabetical), inherited & deprecated after
  const sortMembers = (a, b) => {
    let aDeprecated = a.deprecated ? 1 : 0;
    let bDeprecated = b.deprecated ? 1 : 0;
    if (aDeprecated !== bDeprecated) {
      return aDeprecated - bDeprecated;
    }
    let aInherited = a.inheritedFrom ? 1 : 0;
    let bInherited = b.inheritedFrom ? 1 : 0;
    if (aInherited !== bInherited) {
      return aInherited - bInherited;
    }
    if (a.required !== b.required) {
      return a.required ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  };
  props.sort(sortMembers);
  events.sort(sortMembers);

  // Extract RenderProps if `${exportName}RenderProps` exists in the same source file or package
  let renderProps = [];
  let renderPropsName = `${exportName}RenderProps`;
  let renderPropsSf = resolveSymbolSourceFile(ctx, pkgName, renderPropsName) || sf;
  let renderPropsIface = renderPropsSf?.getInterface(renderPropsName);
  if (renderPropsIface) {
    for (let sym of renderPropsIface.getType().getProperties()) {
      let decl = sym.getDeclarations()?.[0];
      if (!decl) {
        continue;
      }
      let docInfo = getJsDocSummary(decl);
      if (docInfo.isPrivate) {
        continue;
      }
      let rType = decl.getTypeNode?.()
        ? cleanTypeString(decl.getTypeNode().getText())
        : cleanTypeString(sym.getTypeAtLocation(renderPropsIface).getText(renderPropsIface));
      renderProps.push({
        name: sym.getName(),
        type: rType,
        selector: docInfo.selector,
        description: docInfo.description,
        deprecated: docInfo.deprecated || undefined,
        deprecationMessage: docInfo.deprecationMessage
      });
    }
    renderProps.sort((a, b) => {
      let aDeprecated = a.deprecated ? 1 : 0;
      let bDeprecated = b.deprecated ? 1 : 0;
      if (aDeprecated !== bDeprecated) {
        return aDeprecated - bDeprecated;
      }
      return a.name.localeCompare(b.name);
    });
  }

  if (
    !primaryDecl &&
    !propsDecl &&
    props.length === 0 &&
    events.length === 0 &&
    callSignatures.length === 0 &&
    renderProps.length === 0
  ) {
    ctx.exportCache.set(cacheKey, null);
    return null;
  }

  let constraints = synthesizeConstraints(props, events, library);
  let result = {
    name: exportName,
    exportKind,
    description,
    typeParameters,
    ...(typeText ? {typeText} : {}),
    callSignatures,
    props,
    events,
    renderProps,
    slots: [...slots],
    constraints
  };

  ctx.exportCache.set(cacheKey, result);
  return result;
}

/**
 * Converts MDX AST (from either s2-docs or pre-s2-docs legacy docs) into structured prose+code
 * sections and collects referenced TypeScript export names.
 */
function parseMdxIntoStructuredDoc({
  ctx,
  rawMdx,
  filePath,
  slug,
  library,
  defaultPackageName,
  supportsSubpathExports
}) {
  let content = rawMdx.replace(LICENSE_COMMENT_REGEX, '');

  // Extract mid-file or top-of-file YAML frontmatter (`category`, `keywords`, `type`)
  let frontmatter = {keywords: [], category: null, type: null};
  let fmMatch = content.match(MID_FILE_FRONTMATTER_REGEX);
  if (fmMatch) {
    frontmatter = parseSimpleYamlFrontmatter(fmMatch[1]);
    content = content.replace(MID_FILE_FRONTMATTER_REGEX, '\n');
  }

  let esmMeta = parseEsmMetadata(content);
  let referencedExports = [];
  let seenExports = new Set();
  const recordExport = (name, pkgOverride) => {
    if (!name || seenExports.has(`${pkgOverride || defaultPackageName}:${name}`)) {
      return;
    }
    seenExports.add(`${pkgOverride || defaultPackageName}:${name}`);
    referencedExports.push({name, pkgName: pkgOverride || defaultPackageName});
  };

  // Detect `<PropTable component={docs.exports.X} />`, `<InterfaceType ... />`, `<FunctionAPI ... />`, `<ClassAPI ... />`, `<HeaderInfo componentNames={[...]} />`
  let propTableRe =
    /<(?:PropTable|FunctionJSDoc|ComponentJSDoc)\b[^>]*?(?:component|function)=\{([\w$]+)\.exports\.([\w$]+)\}/g;
  let m;
  while ((m = propTableRe.exec(content)) !== null) {
    let pkg = esmMeta.docsImports.get(m[1]) || defaultPackageName;
    recordExport(m[2], pkg);
  }
  let stateTableRe =
    /<StateTable\b[^>]*?properties=\{([\w$]+)\.exports\.([\w$]+)RenderProps\.properties\}/g;
  while ((m = stateTableRe.exec(content)) !== null) {
    let pkg = esmMeta.docsImports.get(m[1]) || defaultPackageName;
    recordExport(m[2], pkg);
  }
  let headerNamesRe = /componentNames=\{\[([^\]]+)\]\}/g;
  while ((m = headerNamesRe.exec(content)) !== null) {
    let names = m[1]
      .split(',')
      .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
    for (let n of names) {
      recordExport(n, defaultPackageName);
    }
  }

  // Also ensure the page's primary PascalCase / camelCase identifier is recorded if it matches an export
  let baseSlug = path.posix.basename(slug);

  // Strip `<details>...Show CSS...</details>` blocks in legacy MDX so CSS walls don't bloat usage tokens
  content = content.replace(/<details>\s*<summary[\s\S]*?Show CSS[\s\S]*?<\/details>/g, '');

  // Transform MDX AST into clean Markdown without inline PropTables (since API is structured in `exports` IR!)
  let pageTitle = baseSlug;
  let pageDescription = esmMeta.description || '';

  const starterCodeNodes = expression => {
    const files = [...expression.matchAll(/['"]([^'"]+\.tsx)['"]/g)].map(m => m[1]);
    return files.flatMap(file => {
      const absolutePath = path.join(ctx.targetRoot, file);
      if (!fs.existsSync(absolutePath)) {
        return [];
      }
      const code = fs
        .readFileSync(absolutePath, 'utf8')
        .replace(/^\s*import\s+['"][^'"]+\.css['"];?\s*$/gm, '')
        .trim();
      return [
        {type: 'code', lang: 'tsx', meta: null, value: `// Starter wrapper (${file}):\n${code}`}
      ];
    });
  };

  const remarkCleanMdx = () => tree => {
    // Remove ESM imports/exports
    tree.children = tree.children.filter(n => n.type !== 'mdxjsEsm');

    visit(tree, (node, index, parent) => {
      if (!parent || typeof index !== 'number') {
        return;
      }

      if (node.type === 'code') {
        let codeVal = (node.value || '').replace(HIGHLIGHT_COMMENT_REGEX, '').trim();
        let metaStr = node.meta || '';
        if (metaStr.includes('hidden')) {
          parent.children.splice(index, 1);
          return index;
        }
        node.value = codeVal;
        node.meta = '';
        return;
      }

      if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
        let elName = node.name || '';

        if (['FunctionAPI', 'FunctionAPIGroup', 'InterfaceType', 'ClassAPI'].includes(elName)) {
          for (const attr of node.attributes || []) {
            const expression =
              typeof attr.value === 'string' ? attr.value : attr.value?.value || '';
            for (const match of expression.matchAll(/([\w$]+)\.exports\.([\w$]+)/g)) {
              recordExport(match[2], esmMeta.docsImports.get(match[1]) || defaultPackageName);
            }
          }
        }

        if (elName === 'VisualExample') {
          const files = node.attributes?.find(attr => attr.name === 'files');
          parent.children.splice(index, 1, ...starterCodeNodes(files?.value?.value || ''));
          return index;
        }

        if (elName === 'PageDescription') {
          let exprChild = node.children?.find(
            c => c.type === 'mdxFlowExpression' || c.type === 'mdxTextExpression'
          );
          let dm = exprChild?.value.match(/([\w$]+)\.exports\.([\w$]+)\.description/);
          let expIr = dm
            ? extractExportIR(
                ctx,
                esmMeta.docsImports.get(dm[1]) || defaultPackageName,
                dm[2],
                library
              )
            : null;
          if (expIr?.description) {
            pageDescription = pageDescription || expIr.description;
            parent.children[index] = {
              type: 'paragraph',
              children: [{type: 'text', value: expIr.description}]
            };
            return;
          }
          let textChildren = (node.children || []).filter(c => c.type !== 'mdxjsEsm');
          if (textChildren.length > 0) {
            parent.children.splice(index, 1, ...textChildren);
            return index;
          }
          parent.children.splice(index, 1);
          return index;
        }

        if (elName === 'InlineAlert') {
          let variantAttr = node.attributes?.find(a => a.name === 'variant');
          let label = variantAttr?.value === 'notice' ? 'Important' : 'Note';
          let innerText = toMarkdown(
            {type: 'root', children: (node.children || []).filter(c => c.type !== 'mdxjsEsm')},
            {extensions: mdxToMarkdown.extensions}
          )
            .replace(/<\/?(?:Heading|Content)>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          parent.children[index] = {
            type: 'blockquote',
            children: [
              {
                type: 'paragraph',
                children: [{type: 'text', value: `${label}: ${innerText}`}]
              }
            ]
          };
          return;
        }

        if (elName === 'TypeLink') {
          let typeAttr = node.attributes?.find(a => a.name === 'type');
          let expr = typeAttr?.value?.value || '';
          let tm = expr.match(/\.exports\.([\w$]+)/);
          let typeLabel = tm ? tm[1] : 'object';
          parent.children[index] = {type: 'inlineCode', value: typeLabel};
          return;
        }

        if (elName === 'S2StyleProperties') {
          let propAttr = node.attributes?.find(a => a.name === 'properties');
          let expr = propAttr?.value?.value || '';
          let propsList = [...expr.matchAll(/['"]([\w-]+)['"]/g)].map(x => x[1]);
          if (propsList.length > 0) {
            parent.children[index] = {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: `Supported \`styles\` properties: ${propsList.map(p => `\`${p}\``).join(', ')}.`
                }
              ]
            };
            return;
          }
        }

        if (elName === 'ExampleSwitcher') {
          // Keep only the first example child inside ExampleSwitcher to avoid duplicating Vanilla CSS + Tailwind walls,
          // and inline referenced `.tsx` starter wrapper files (skipping `.css`) so agents see real `react-aria-components` primitives!
          let innerElements = (node.children || []).filter(c => c.type !== 'mdxjsEsm');
          let firstChild = innerElements[0];
          let replacements = firstChild ? [firstChild] : [];
          let filesAttrMatch =
            firstChild?.type === 'code' && typeof firstChild.meta === 'string'
              ? firstChild.meta.match(/files=\{\[([^\]]+)\]\}/)
              : null;
          replacements.push(...starterCodeNodes(filesAttrMatch?.[1] || ''));
          parent.children.splice(index, 1, ...replacements);
          return index;
        }

        // Remove interactive/API-table JSX nodes (`PropTable`, `StateTable`, `HeaderInfo`, `Anatomy`, `StarterKits`, etc.)
        // because structured API tables are rendered deterministically from `exports` IR!
        parent.children.splice(index, 1);
        return index;
      }

      if (node.type === 'mdxFlowExpression' || node.type === 'mdxTextExpression') {
        parent.children.splice(index, 1);
        return index;
      }
    });
  };

  let mdText = '';
  try {
    let processor = unified().use(remarkParse).use(remarkMdx).use(remarkCleanMdx);
    let tree = processor.parse({value: content, path: filePath});
    let transformed = processor.runSync(tree);
    mdText = toMarkdown(transformed, {
      fences: true,
      bullet: '-',
      listItemIndent: 'one',
      extensions: mdxToMarkdown.extensions
    });
  } catch {
    // Fallback regex strip if an exotic historical MDX construct fails strict remark-mdx parsing
    mdText = content
      .replace(/^import\s+.*$/gm, '')
      .replace(/^export\s+.*$/gm, '')
      .replace(HIGHLIGHT_COMMENT_REGEX, '')
      .replace(/<[A-Z][\w.]*(?:\s[^>]*)?\/>/g, '')
      .trim();
  }

  // Convert relative `.html` links to doc IDs
  mdText = mdText.replace(/\[([^\]]+)\]\(([^)]+\.html(?:#[^)]*)?)\)/g, (full, text, href) => {
    if (href.startsWith('http') || href.startsWith('//')) {
      return full;
    }
    return `[${text}](${href.replace(/\.html/, '')})`;
  });

  // Split markdown into heading sections (`#`, `##`, `###`)
  let lines = mdText.split(/\r?\n/);
  let sections = [];
  let currentHeading = 'Overview';
  let currentLevel = 2;
  let currentLines = [];

  const flushSection = () => {
    let body = currentLines.join('\n').trim();
    currentLines = [];
    if (!body) {
      return;
    }
    let category = classifyHeadingCategory(currentHeading, slug);
    // Skip empty API headings whose <PropTable> was extracted into `exports`
    if (category === 'api' && body.length < 20 && !body.includes('```')) {
      return;
    }
    // Skip redundant starter CSS/Tailwind boilerplate sections on RAC component pages unless explicitly styling
    if (
      library === 'rac' &&
      (currentHeading.toLowerCase() === 'tailwind example' || currentHeading.endsWith('.css'))
    ) {
      return;
    }
    sections.push({
      id: slugifyHeading(currentHeading),
      category,
      heading: currentHeading,
      level: currentLevel,
      markdown: body
    });
  };

  for (let line of lines) {
    let h1 = line.match(/^#\s+(.+)$/);
    if (h1) {
      pageTitle = h1[1].trim();
      continue;
    }
    let hMatch = line.match(/^(#{2,3})\s+(.+)$/);
    if (hMatch) {
      flushSection();
      currentLevel = hMatch[1].length;
      currentHeading = hMatch[2].trim();
      continue;
    }
    currentLines.push(line);
  }
  flushSection();

  if (!pageDescription && sections.length > 0) {
    let firstPara = sections[0].markdown
      .split(/\n\n/)
      .map(s => s.trim())
      .find(s => s && !s.startsWith('```') && !s.startsWith('>') && !s.startsWith('|'));
    if (firstPara) {
      pageDescription = firstPara.replace(/\s+/g, ' ').slice(0, 280);
    }
  }

  // Extract structured exports from TypeScript in targetRoot
  if (
    /^[A-Za-z][\w$]*$/.test(baseSlug) &&
    baseSlug !== 'index' &&
    !referencedExports.some(ref => ref.name === baseSlug)
  ) {
    recordExport(baseSlug, defaultPackageName);
  }
  let exportsIR = [];
  for (let ref of referencedExports) {
    let exp = extractExportIR(ctx, ref.pkgName, ref.name, library);
    if (exp) {
      exportsIR.push(exp);
    }
  }

  // Extract canonical import statements from code examples in this targetRoot MDX (version-accurate!),
  // falling back to `supportsSubpathExports` inspection of targetRoot's package.json!
  let importsBySource = new Map();
  let bindingSources = new Map();
  let importStmtRe =
    /^import[ \t]+\{([^}]+)\}[ \t]+from[ \t]+['"]((?:@react-spectrum\/s2|react-aria-components|react-aria|react-stately|@internationalized\/[\w-]+)(?:\/[\w-]+)?)['"](?:[ \t]+(with[ \t]+\{[^}]+\}))?;?$/gm;
  let im;
  while ((im = importStmtRe.exec(mdText)) !== null) {
    let [, specifiers, source, rawWithClause] = im;
    let withClause = rawWithClause ? rawWithClause.replace(/\s+/g, ' ').trim() : '';
    let sourceKey = withClause ? `${source}\0${withClause}` : source;
    if (importsBySource.size === 3 && !importsBySource.has(sourceKey)) {
      continue;
    }
    let entry = importsBySource.get(sourceKey) || {source, withClause, bindings: new Map()};
    for (let specifier of specifiers.split(',')) {
      let binding = specifier.trim().replace(/\s+/g, ' ');
      let match = binding.match(/^(type )?([\w$]+)(?: as ([\w$]+))?$/);
      if (!match) {
        continue;
      }
      let [, typeOnly, imported, alias] = match;
      let local = alias || imported;
      let owner = bindingSources.get(local);
      if (owner && owner !== sourceKey) {
        continue;
      }
      let previous = entry.bindings.get(local);
      if (!previous || (!typeOnly && previous === `type ${binding}`)) {
        entry.bindings.set(local, binding);
      }
      bindingSources.set(local, sourceKey);
    }
    if (entry.bindings.size > 0) {
      importsBySource.set(sourceKey, entry);
    }
  }
  let imports = [...importsBySource.values()].map(
    ({source, withClause, bindings}) =>
      `import {${[...bindings.values()].join(', ')}} from '${source}'${withClause ? ` ${withClause}` : ''};`
  );

  if (imports.length === 0 && exportsIR.length > 0) {
    let mainNames = exportsIR.slice(0, 4).map(e => e.name);
    let importTarget =
      supportsSubpathExports && /^[A-Z]/.test(baseSlug)
        ? `${defaultPackageName}/${baseSlug}`
        : defaultPackageName;
    imports.push(`import {${mainNames.join(', ')}} from '${importTarget}';`);
  }

  // Synthesize concise version-accurate composition rules
  let compositionRules = [];
  if (library === 's2' && exportsIR.some(e => e.exportKind === 'component')) {
    compositionRules.push(
      supportsSubpathExports
        ? `Import from component subpath \`${defaultPackageName}/${baseSlug}\` (or root \`${defaultPackageName}\`).`
        : `In ${defaultPackageName}@${ctx.packageVersions[defaultPackageName]}, import from root \`${defaultPackageName}\` (component subpath exports were introduced in a later minor release).`
    );
    if (exportsIR[0]?.props.some(p => p.name === 'label')) {
      compositionRules.push(
        'Pass the `label` prop directly to Spectrum 2 field components rather than nesting a child `<Label>` element; use `aria-label` or `aria-labelledby` only when no visible label exists.'
      );
    }
  } else if (library === 'rac' && exportsIR.some(e => e.exportKind === 'component')) {
    compositionRules.push(
      supportsSubpathExports
        ? `Import primitives from \`react-aria-components/${baseSlug}\` or \`react-aria-components\` and compose required child elements explicitly (for example \`<Label>\`, \`<Input>\`, \`<Button>\`, \`<Popover>\`, \`<ListBox>\`).`
        : `Import primitives from \`react-aria-components\` and compose required child elements explicitly (for example \`<Label>\`, \`<Input>\`, \`<Button>\`, \`<Popover>\`, \`<ListBox>\`).`
    );
  }

  let keywords = [
    ...new Set([
      ...frontmatter.keywords,
      ...esmMeta.tags,
      ...(esmMeta.section ? [esmMeta.section.toLowerCase()] : [])
    ])
  ];

  let kind = 'component';
  if (/^use[A-Z]/.test(baseSlug)) {
    kind = 'hook';
  } else if (
    esmMeta.section?.toLowerCase() === 'guides' ||
    frontmatter.category === 'Concepts' ||
    /^[a-z]/.test(baseSlug)
  ) {
    kind = slug === 'style-macro' ? 'tokens' : 'guide';
  }

  return {
    title: pageTitle,
    summary: pageDescription,
    kind,
    keywords,
    imports,
    compositionRules,
    sections,
    exports: exportsIR
  };
}

function loadStylePropertiesModule(stylePropsPath) {
  let rawTs = fs.readFileSync(stylePropsPath, 'utf8');
  let transpiled = ts.transpileModule(rawTs, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    }
  });
  let modExports = {};
  let modObj = {exports: modExports};
  vm.runInNewContext(transpiled.outputText, {
    exports: modExports,
    module: modObj
  });
  return modObj.exports;
}

function buildStyleCategoriesFromModule(styleMod) {
  let styleCategories = {};
  for (let cat of ['color', 'dimensions', 'text', 'effects', 'layout', 'misc', 'conditions']) {
    let defs = styleMod.getPropertyDefinitions(cat);
    styleCategories[cat] = Object.fromEntries(
      Object.entries(defs).map(([propName, def]) => [
        propName,
        {
          values: def.values,
          additionalTypes: def.additionalTypes || [],
          mapping: def.mapping || undefined,
          description: def.description || undefined
        }
      ])
    );
  }
  return styleCategories;
}

/**
 * Extracts S2 style macro token definitions, workflow icons, and illustrations from `targetRoot`
 * (leaving optional metadata empty when older tags lack helper files so HEAD assets never leak
 * into historical snapshots).
 */
async function extractS2Assets(targetRoot, s2Version) {
  let s2Dir = path.join(targetRoot, 'packages/@react-spectrum/s2');
  if (!fs.existsSync(s2Dir)) {
    return null;
  }

  // 1. Icons from targetRoot/packages/@react-spectrum/s2/s2wf-icons/*.svg
  let svgFiles = glob.sync('s2wf-icons/S2_Icon_*.svg', {cwd: s2Dir});
  let iconSet = new Set();
  for (let svg of svgFiles) {
    let base = path.basename(svg, '.svg');
    let id = base.replace(/^S2_Icon_(.*?)(Size\d+)?_2.*/, '$1');
    if (id) {
      iconSet.add(id);
    }
  }
  let icons = [...iconSet].sort((a, b) => a.localeCompare(b));

  // Optional icon aliases from targetRoot only (never fall back to HEAD)
  let iconAliases = {};
  let aliasFile = path.join(targetRoot, 'packages/dev/s2-docs/src/iconAliases.js');
  if (fs.existsSync(aliasFile)) {
    try {
      let mod = await import(pathToFileURL(aliasFile).href);
      iconAliases = mod.iconAliases || {};
    } catch (err) {
      console.warn(
        `[snapshotExtractor] Failed to load icon aliases from '${aliasFile}': ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // 2. Illustrations from targetRoot/packages/@react-spectrum/s2/spectrum-illustrations/{linear,gradient}/**/*.tsx
  let illustrationFiles = glob.sync('spectrum-illustrations/{linear,gradient}/**/*.tsx', {
    cwd: s2Dir,
    ignore: ['**/internal/**']
  });
  let illustrations = illustrationFiles
    .map(rel => {
      let clean = rel.replace(/^spectrum-illustrations\//, '').replace(/\.tsx$/, '');
      return {
        id: clean,
        subpath: `@react-spectrum/s2/illustrations/${clean}`
      };
    })
    .sort((a, b) => a.subpath.localeCompare(b.subpath));

  // 3. Style macro properties & token values from targetRoot only (never fall back to HEAD)
  let styleCategories = {};
  let spacingScale = {};
  let stylePropsPath = path.join(targetRoot, 'packages/dev/s2-docs/src/styleProperties.ts');
  if (fs.existsSync(stylePropsPath)) {
    try {
      let styleMod = loadStylePropertiesModule(stylePropsPath);
      styleCategories = buildStyleCategoriesFromModule(styleMod);
      spacingScale = styleMod.spacingTypeValues || {};
    } catch (err) {
      console.warn(
        `[snapshotExtractor] Failed to evaluate S2 style macro properties from '${stylePropsPath}': ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return {
    schemaVersion: CATALOG_SCHEMA_VERSION,
    packageName: '@react-spectrum/s2',
    packageVersion: s2Version,
    icons,
    iconAliases,
    illustrations,
    styleMacro: {
      categories: styleCategories,
      spacingScale
    }
  };
}

function createMarkdownGuideEntry({
  id,
  slug,
  library,
  kind,
  packageName,
  packageVersion,
  rawMarkdown,
  fallbackTitle,
  sourceUrl
}) {
  let clean = rawMarkdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim();
  let titleMatch = clean.match(/^#\s+(.+)$/m);
  let title = titleMatch ? titleMatch[1].trim() : fallbackTitle;
  let bodyWithoutH1 = clean.replace(/^#\s+.+$/m, '').trim();

  let lines = bodyWithoutH1.split(/\r?\n/);
  let sections = [];
  let curHeading = 'Overview';
  let curLevel = 2;
  let curLines = [];

  const flush = () => {
    let text = curLines.join('\n').trim();
    curLines = [];
    if (!text) {
      return;
    }
    sections.push({
      id: slugifyHeading(curHeading),
      category: kind === 'guide' ? 'guide' : classifyHeadingCategory(curHeading, slug),
      heading: curHeading,
      level: curLevel,
      markdown: text
    });
  };

  for (let line of lines) {
    let hm = line.match(/^(#{2,3})\s+(.+)$/);
    if (hm) {
      flush();
      curLevel = hm[1].length;
      curHeading = hm[2].trim();
      continue;
    }
    curLines.push(line);
  }
  flush();

  let summary =
    sections[0]?.markdown
      .split(/\n\n/)
      .map(s => s.trim())
      .find(s => s && !s.startsWith('```') && !s.startsWith('|') && !s.startsWith('-'))
      ?.replace(/\s+/g, ' ')
      .slice(0, 260) || `${title} (${packageName}@${packageVersion})`;

  return {
    schemaVersion: CATALOG_SCHEMA_VERSION,
    id,
    slug,
    library,
    kind,
    title,
    packageName,
    packageVersion,
    summary,
    keywords: [kind, library, ...slug.split(/[/-]/).filter(Boolean)],
    imports: [],
    compositionRules: [],
    sections,
    exports: [],
    sourceUrl
  };
}

/**
 * Extracts a complete or filtered versioned snapshot from `targetRoot` and writes:
 *
 * - `<outDir>/by-id/<snapshotId>/manifest.json`
 * - `<outDir>/by-id/<snapshotId>/packages/<encodedPkg>@<ver>.tar.gz` (containing `entries/*.json`,
 *   `search-index.json`, `slice-manifest.json`, and optional `s2-assets.json`)
 * - `<outDir>/by-id/<snapshotId>/catalog.tar.gz`
 * - `<outDir>/by-id/<snapshotId>/search-index.json` & optional `s2-assets.json`
 *
 * Returns the snapshot summary for merging into `<outDir>/index.json`.
 */
export async function generateSnapshotFromTarget({
  targetRoot,
  repoRoot,
  outRoot,
  snapshotId,
  docRevision = 1,
  sourceTag = null,
  sourceCommit,
  sourceDate = null,
  extractorCommit,
  libraries = ['s2', 'rac', 'internationalized'],
  filterSlugs = null
}) {
  let ctx = createTargetWorkspaceContext(targetRoot, repoRoot);
  let entries = [];
  let docsLayouts = {};

  let s2DocsPagesDir = path.join(targetRoot, 'packages/dev/s2-docs/pages');
  let slugAllowSet = filterSlugs ? new Set(filterSlugs) : null;

  // 1. Extract `@react-spectrum/s2` if present in targetRoot and requested
  let s2Pkg = ctx.packagesByName.get('@react-spectrum/s2');
  if (libraries.includes('s2') && s2Pkg && fs.existsSync(path.join(s2DocsPagesDir, 's2'))) {
    docsLayouts['@react-spectrum/s2'] = 's2-docs';
    let s2MdxFiles = glob
      .sync('**/*.mdx', {
        cwd: path.join(s2DocsPagesDir, 's2'),
        ignore: ['**/releases/**', '**/error.mdx']
      })
      .sort();

    for (let relMdx of s2MdxFiles) {
      let slug = relMdx.replace(/\.mdx$/, '').replace(/\/index$/, '') || 'index';
      if (slugAllowSet && !slugAllowSet.has(`s2:${slug}`) && !slugAllowSet.has(slug)) {
        continue;
      }
      let absPath = path.join(s2DocsPagesDir, 's2', relMdx);
      let raw = fs.readFileSync(absPath, 'utf8');
      if (raw.includes('<meta http-equiv="refresh"')) {
        continue;
      }

      let parsed = parseMdxIntoStructuredDoc({
        ctx,
        rawMdx: raw,
        filePath: absPath,
        slug,
        library: 's2',
        defaultPackageName: '@react-spectrum/s2',
        supportsSubpathExports: s2Pkg.supportsSubpathExports
      });

      entries.push({
        schemaVersion: CATALOG_SCHEMA_VERSION,
        id: `s2:${slug}`,
        slug,
        library: 's2',
        kind: parsed.kind,
        title: parsed.title,
        packageName: '@react-spectrum/s2',
        packageVersion: s2Pkg.version,
        summary: parsed.summary,
        keywords: parsed.keywords,
        imports: parsed.imports,
        compositionRules: parsed.compositionRules,
        sections: parsed.sections,
        exports: parsed.exports,
        sourceUrl: `https://react-spectrum.adobe.com/s2/${slug}`
      });
    }

    // Catalog S2 implementation guides, decision tree, migration, and audit docs from targetRoot (or synthesize version-accurate guide if pre-skills tag!)
    let s2SkillsDir = path.join(targetRoot, 'packages/dev/s2-docs/skills/react-spectrum-s2');
    if (fs.existsSync(s2SkillsDir)) {
      for (let mdFile of glob.sync('**/*.md', {cwd: s2SkillsDir, ignore: ['SKILL.md']}).sort()) {
        let guideSlug = `guide/${mdFile.replace(/\.md$/, '').replace(/^references\//, '')}`;
        if (slugAllowSet && !slugAllowSet.has(`s2:${guideSlug}`)) {
          continue;
        }
        entries.push(
          createMarkdownGuideEntry({
            id: `s2:${guideSlug}`,
            slug: guideSlug,
            library: 's2',
            kind: 'guide',
            packageName: '@react-spectrum/s2',
            packageVersion: s2Pkg.version,
            rawMarkdown: fs.readFileSync(path.join(s2SkillsDir, mdFile), 'utf8'),
            fallbackTitle: guideSlug,
            sourceUrl: 'https://react-spectrum.adobe.com/s2/'
          })
        );
      }
    } else if (!slugAllowSet || slugAllowSet.has('s2:guide/implementation-guidance')) {
      let importExample = s2Pkg.supportsSubpathExports
        ? `import {Button} from '@react-spectrum/s2/Button';`
        : `import {Button} from '@react-spectrum/s2';`;
      entries.push(
        createMarkdownGuideEntry({
          id: 's2:guide/implementation-guidance',
          slug: 'guide/implementation-guidance',
          library: 's2',
          kind: 'guide',
          packageName: '@react-spectrum/s2',
          packageVersion: s2Pkg.version,
          rawMarkdown: `# Spectrum 2 Implementation Guidance (@react-spectrum/s2@${s2Pkg.version})\n\n## Imports\n\`\`\`tsx\n${importExample}\nimport {style} from '@react-spectrum/s2/style' with {type: 'macro'};\n\`\`\`\n\n## Labeling & Forms\nPass the \`label\` prop directly to Spectrum 2 form controls (or \`aria-label\` / \`aria-labelledby\` when visually unlabeled).\n\n## Styling\nUse the \`style\` macro from \`@react-spectrum/s2/style\` with \`{type: 'macro'}\`. Spectrum components accept layout tokens via the \`styles\` prop.`,
          fallbackTitle: 'Spectrum 2 Implementation Guidance',
          sourceUrl: 'https://react-spectrum.adobe.com/s2/'
        })
      );
    }

    let migDir = path.join(targetRoot, 'packages/dev/s2-docs/migration-references');
    if (fs.existsSync(migDir) && !slugAllowSet) {
      for (let mdFile of glob.sync('**/*.md', {cwd: migDir}).sort()) {
        let migSlug = `migration/${mdFile.replace(/\.md$/, '')}`;
        entries.push(
          createMarkdownGuideEntry({
            id: `s2:${migSlug}`,
            slug: migSlug,
            library: 's2',
            kind: 'migration',
            packageName: '@react-spectrum/s2',
            packageVersion: s2Pkg.version,
            rawMarkdown: fs.readFileSync(path.join(migDir, mdFile), 'utf8'),
            fallbackTitle: migSlug,
            sourceUrl: 'https://react-spectrum.adobe.com/s2/migrating'
          })
        );
      }
    }

    let auditDir = path.join(targetRoot, 'packages/dev/s2-docs/skills/spectrum-audit');
    if (fs.existsSync(auditDir) && !slugAllowSet) {
      for (let mdFile of glob.sync('**/*.md', {cwd: auditDir, ignore: ['SKILL.md']}).sort()) {
        let auditSlug = `audit/${mdFile.replace(/\.md$/, '').replace(/^references\//, '')}`;
        entries.push(
          createMarkdownGuideEntry({
            id: `s2:${auditSlug}`,
            slug: auditSlug,
            library: 's2',
            kind: 'audit',
            packageName: '@react-spectrum/s2',
            packageVersion: s2Pkg.version,
            rawMarkdown: fs.readFileSync(path.join(auditDir, mdFile), 'utf8'),
            fallbackTitle: auditSlug,
            sourceUrl: 'https://react-spectrum.adobe.com/s2/'
          })
        );
      }
    }
  }

  // 2. Extract `react-aria-components` (supports BOTH s2-docs/pages/react-aria AND pre-s2-docs packages/react-aria-components/docs!)
  let racPkg = ctx.packagesByName.get('react-aria-components');
  if (libraries.includes('rac') && racPkg) {
    let s2RacPagesDir = path.join(s2DocsPagesDir, 'react-aria');
    let legacyRacDocsDir = path.join(targetRoot, 'packages/react-aria-components/docs');

    let useS2RacLayout =
      fs.existsSync(s2RacPagesDir) && fs.existsSync(path.join(s2RacPagesDir, 'ComboBox.mdx'));
    let activeRacDir = useS2RacLayout ? s2RacPagesDir : legacyRacDocsDir;
    docsLayouts['react-aria-components'] = useS2RacLayout ? 's2-docs' : 'legacy-docs';

    if (fs.existsSync(activeRacDir)) {
      let racMdxFiles = glob
        .sync('**/*.mdx', {
          cwd: activeRacDir,
          ignore: ['**/releases/**', '**/blog/**', '**/examples/**', '**/error.mdx']
        })
        .sort();

      for (let relMdx of racMdxFiles) {
        let slug = relMdx.replace(/\.mdx$/, '').replace(/\/index$/, '') || 'index';
        let matchesPageFilter =
          !slugAllowSet || slugAllowSet.has(`rac:${slug}`) || slugAllowSet.has(slug);
        if (
          !matchesPageFilter &&
          !slugAllowSet.has(`react-aria:${slug}`) &&
          !slugAllowSet.has(`react-stately:${slug}`)
        ) {
          continue;
        }
        let absPath = path.join(activeRacDir, relMdx);
        let raw = fs.readFileSync(absPath, 'utf8');
        if (raw.includes('<meta http-equiv="refresh"')) {
          continue;
        }

        // Route `internationalized/*` pages inside `s2-docs/pages/react-aria/internationalized/` to `@internationalized/*`
        let intlRelSlug = slug.startsWith('internationalized/')
          ? slug.replace(/^internationalized\//, '')
          : null;
        let intlPkg = intlRelSlug
          ? ctx.packagesByName.get(`@internationalized/${intlRelSlug.split('/')[0]}`) ||
            ctx.packagesByName.get('@internationalized/date')
          : null;
        if (intlRelSlug && intlPkg) {
          docsLayouts[intlPkg.name] = 's2-docs';
          let parsedIntl = parseMdxIntoStructuredDoc({
            ctx,
            rawMdx: raw,
            filePath: absPath,
            slug: intlRelSlug,
            library: 'internationalized',
            defaultPackageName: intlPkg.name,
            supportsSubpathExports: false
          });
          entries.push({
            schemaVersion: CATALOG_SCHEMA_VERSION,
            id: `internationalized:${intlRelSlug}`,
            slug: intlRelSlug,
            library: 'internationalized',
            kind: 'utility',
            title: parsedIntl.title,
            packageName: intlPkg.name,
            packageVersion: intlPkg.version,
            summary: parsedIntl.summary,
            keywords: parsedIntl.keywords,
            imports: parsedIntl.imports,
            compositionRules: parsedIntl.compositionRules,
            sections: parsedIntl.sections,
            exports: parsedIntl.exports,
            sourceUrl: `https://react-aria.adobe.com/internationalized/${intlRelSlug}`
          });
          continue;
        }

        let pageName = path.posix.basename(slug);
        let entryLib = getReactAriaPageLibrary(raw, pageName, slug);
        if (!matchesPageFilter && !slugAllowSet.has(`${entryLib}:${slug}`)) {
          continue;
        }
        let ownerPkgName = entryLib === 'rac' ? 'react-aria-components' : entryLib;
        let ownerPkg = ctx.packagesByName.get(ownerPkgName);
        if (entryLib === 'react-stately' && !ownerPkg) {
          continue;
        }
        if (ownerPkg && (entryLib === 'react-stately' || entryLib === 'react-aria')) {
          docsLayouts[ownerPkg.name] = useS2RacLayout ? 's2-docs' : 'legacy-docs';
        }
        ownerPkg ||= racPkg;

        let parsed = parseMdxIntoStructuredDoc({
          ctx,
          rawMdx: raw,
          filePath: absPath,
          slug,
          library: entryLib,
          defaultPackageName: ownerPkg.name,
          supportsSubpathExports: ownerPkg.supportsSubpathExports
        });

        entries.push({
          schemaVersion: CATALOG_SCHEMA_VERSION,
          id: `${entryLib}:${slug}`,
          slug,
          library: entryLib === 'rac' ? 'rac' : entryLib,
          kind: parsed.kind,
          title: parsed.title,
          packageName: ownerPkg.name,
          packageVersion: ownerPkg.version,
          summary: parsed.summary,
          keywords: parsed.keywords,
          imports: parsed.imports,
          compositionRules: parsed.compositionRules,
          sections: parsed.sections,
          exports: parsed.exports,
          sourceUrl: `https://react-aria.adobe.com/${slug}`
        });
      }
    }

    // In legacy layout, also pick up hook docs in `packages/@react-aria/*/docs/*.mdx` & `packages/@react-stately/*/docs/*.mdx` when unfiltered (or matching filterSlugs)
    if (!useS2RacLayout) {
      let legacyHookDocs = glob
        .sync('packages/{@react-aria,@react-stately}/*/docs/*.mdx', {cwd: targetRoot})
        .sort();
      for (let relPath of legacyHookDocs) {
        let slug = path.basename(relPath, '.mdx');
        let isStately = relPath.includes('@react-stately/');
        let libPrefix = isStately ? 'react-stately' : 'react-aria';
        if (slugAllowSet && !slugAllowSet.has(`${libPrefix}:${slug}`) && !slugAllowSet.has(slug)) {
          continue;
        }
        let umbrellaPkg = ctx.packagesByName.get(libPrefix);
        let subPkgDir = path.dirname(path.dirname(path.join(targetRoot, relPath)));
        let subPkgJson = JSON.parse(fs.readFileSync(path.join(subPkgDir, 'package.json'), 'utf8'));
        docsLayouts[umbrellaPkg?.name || subPkgJson.name] = 'legacy-docs';
        let absPath = path.join(targetRoot, relPath);
        let raw = fs.readFileSync(absPath, 'utf8');

        let parsed = parseMdxIntoStructuredDoc({
          ctx,
          rawMdx: raw,
          filePath: absPath,
          slug,
          library: libPrefix,
          defaultPackageName: subPkgJson.name,
          supportsSubpathExports: false
        });

        entries.push({
          schemaVersion: CATALOG_SCHEMA_VERSION,
          id: `${libPrefix}:${slug}`,
          slug,
          library: libPrefix,
          kind: 'hook',
          title: parsed.title,
          packageName: umbrellaPkg?.name || subPkgJson.name,
          packageVersion: umbrellaPkg?.version || subPkgJson.version,
          summary: parsed.summary,
          keywords: parsed.keywords,
          imports: parsed.imports,
          compositionRules: parsed.compositionRules,
          sections: parsed.sections,
          exports: parsed.exports,
          sourceUrl: `https://react-aria.adobe.com/${slug}`
        });
      }
    }

    // Catalog RAC implementation guides if present
    let racSkillsDir = path.join(targetRoot, 'packages/dev/s2-docs/skills/react-aria');
    if (fs.existsSync(racSkillsDir)) {
      for (let mdFile of glob.sync('**/*.md', {cwd: racSkillsDir, ignore: ['SKILL.md']}).sort()) {
        let guideSlug = `guide/${mdFile.replace(/\.md$/, '').replace(/^references\//, '')}`;
        if (slugAllowSet && !slugAllowSet.has(`rac:${guideSlug}`)) {
          continue;
        }
        entries.push(
          createMarkdownGuideEntry({
            id: `rac:${guideSlug}`,
            slug: guideSlug,
            library: 'rac',
            kind: 'guide',
            packageName: 'react-aria-components',
            packageVersion: racPkg.version,
            rawMarkdown: fs.readFileSync(path.join(racSkillsDir, mdFile), 'utf8'),
            fallbackTitle: guideSlug,
            sourceUrl: 'https://react-aria.adobe.com/'
          })
        );
      }
    }
  }

  // 3. Extract `@internationalized/*` docs
  if (libraries.includes('internationalized')) {
    let s2IntlDir = path.join(s2DocsPagesDir, 'internationalized');
    if (fs.existsSync(s2IntlDir)) {
      let intlMdxFiles = glob.sync('**/*.mdx', {cwd: s2IntlDir, ignore: ['**/error.mdx']}).sort();
      for (let relMdx of intlMdxFiles) {
        let slug = relMdx.replace(/\.mdx$/, '').replace(/\/index$/, '') || 'index';
        if (
          slugAllowSet &&
          !slugAllowSet.has(`internationalized:${slug}`) &&
          !slugAllowSet.has(slug)
        ) {
          continue;
        }
        let subArea = slug.split('/')[0]; // date | number | string | message
        let pkgName = `@internationalized/${subArea}`;
        let intlPkg =
          ctx.packagesByName.get(pkgName) || ctx.packagesByName.get('@internationalized/date');
        if (!intlPkg) {
          continue;
        }
        docsLayouts[intlPkg.name] = 's2-docs';
        let absPath = path.join(s2IntlDir, relMdx);
        let raw = fs.readFileSync(absPath, 'utf8');
        let parsed = parseMdxIntoStructuredDoc({
          ctx,
          rawMdx: raw,
          filePath: absPath,
          slug,
          library: 'internationalized',
          defaultPackageName: intlPkg.name,
          supportsSubpathExports: false
        });
        entries.push({
          schemaVersion: CATALOG_SCHEMA_VERSION,
          id: `internationalized:${slug}`,
          slug,
          library: 'internationalized',
          kind: 'utility',
          title: parsed.title,
          packageName: intlPkg.name,
          packageVersion: intlPkg.version,
          summary: parsed.summary,
          keywords: parsed.keywords,
          imports: parsed.imports,
          compositionRules: parsed.compositionRules,
          sections: parsed.sections,
          exports: parsed.exports,
          sourceUrl: `https://react-aria.adobe.com/internationalized/${slug}`
        });
      }
    }
  }

  entries.sort((a, b) => a.id.localeCompare(b.id));

  // Extract S2 assets (`s2-assets.json`) if S2 was extracted
  let s2Assets =
    libraries.includes('s2') && s2Pkg ? await extractS2Assets(targetRoot, s2Pkg.version) : null;

  // Build search index items
  const toSearchRecord = entry => ({
    id: entry.id,
    slug: entry.slug,
    library: entry.library,
    packageName: entry.packageName,
    packageVersion: entry.packageVersion,
    kind: entry.kind,
    title: entry.title,
    summary: entry.summary,
    keywords: entry.keywords,
    exports: entry.exports.map(e => e.name),
    imports: entry.imports,
    sourceUrl: entry.sourceUrl
  });

  let fullSearchIndex = {
    schemaVersion: CATALOG_SCHEMA_VERSION,
    snapshotId,
    docRevision,
    entries: entries.map(toSearchRecord)
  };

  // Write snapshot artifacts under `<outRoot>/by-id/<snapshotId>/`
  let snapshotDir = path.join(outRoot, 'by-id', snapshotId);
  fs.mkdirSync(snapshotDir, {recursive: true});

  let fileHashes = {};
  let catalogTarEntries = [];

  const writeSnapshotArtifact = (relPosixPath, content) => {
    let buf = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
    fileHashes[relPosixPath] = {
      sha256: sha256Hex(buf),
      bytes: buf.length
    };
    let diskPath = path.join(snapshotDir, ...relPosixPath.split('/'));
    fs.mkdirSync(path.dirname(diskPath), {recursive: true});
    fs.writeFileSync(diskPath, buf);
    return buf;
  };

  // Group entries by `packageName@packageVersion` to create independent per-package slices.
  // Slices pack `.json` IR only (`agent-docs-core` renders Markdown from the IR at query time),
  // avoiding redundant loose `entries/*` uploads and duplicate `.md` payloads.
  let entriesByPkg = new Map();
  for (let entry of entries) {
    let relBase = `entries/${entry.library}/${entry.slug}`;
    let jsonStr = JSON.stringify(entry, null, 2) + '\n';

    catalogTarEntries.push({path: `${relBase}.json`, content: jsonStr});

    let pkgKey = `${entry.packageName}@${entry.packageVersion}`;
    if (!entriesByPkg.has(pkgKey)) {
      entriesByPkg.set(pkgKey, {
        packageName: entry.packageName,
        packageVersion: entry.packageVersion,
        entries: [],
        tarFiles: []
      });
    }
    let bucket = entriesByPkg.get(pkgKey);
    bucket.entries.push(entry);
    bucket.tarFiles.push({path: `${relBase}.json`, content: jsonStr});
  }

  if (s2Assets) {
    let assetsJson = JSON.stringify(s2Assets, null, 2) + '\n';
    writeSnapshotArtifact('s2-assets.json', assetsJson);
    catalogTarEntries.push({path: 's2-assets.json', content: assetsJson});
    let s2Key = `@react-spectrum/s2@${s2Pkg.version}`;
    if (entriesByPkg.has(s2Key)) {
      entriesByPkg.get(s2Key).tarFiles.push({path: 's2-assets.json', content: assetsJson});
    }
  }

  let searchIndexStr = JSON.stringify(fullSearchIndex, null, 2) + '\n';
  writeSnapshotArtifact('search-index.json', searchIndexStr);
  catalogTarEntries.push({path: 'search-index.json', content: searchIndexStr});

  // Pack per-package slice `.tar.gz` archives
  let sliceMetadataByPackage = {};
  for (let [, bucket] of entriesByPkg) {
    let sliceSearch = {
      schemaVersion: CATALOG_SCHEMA_VERSION,
      snapshotId,
      docRevision,
      packageName: bucket.packageName,
      packageVersion: bucket.packageVersion,
      entries: bucket.entries.map(toSearchRecord)
    };
    let sliceManifest = {
      schemaVersion: CATALOG_SCHEMA_VERSION,
      minReaderSchemaVersion: MIN_READER_SCHEMA_VERSION,
      snapshotId,
      docRevision,
      sourceTag,
      sourceCommit,
      extractorCommit,
      extractorVersion: EXTRACTOR_VERSION,
      docsLayout: docsLayouts[bucket.packageName] || 's2-docs',
      packageName: bucket.packageName,
      packageVersion: bucket.packageVersion,
      entryCount: bucket.entries.length
    };

    let sliceFiles = [
      ...bucket.tarFiles,
      {path: 'search-index.json', content: JSON.stringify(sliceSearch, null, 2) + '\n'},
      {path: 'slice-manifest.json', content: JSON.stringify(sliceManifest, null, 2) + '\n'}
    ];

    let encodedName = encodePackageSliceName(bucket.packageName, bucket.packageVersion);
    let relSlicePath = `packages/${encodedName}.tar.gz`;
    let sliceGz = packTarGz(sliceFiles);
    writeSnapshotArtifact(relSlicePath, sliceGz);

    sliceMetadataByPackage[bucket.packageName] = {
      packageName: bucket.packageName,
      packageVersion: bucket.packageVersion,
      snapshotId,
      docRevision,
      schemaVersion: CATALOG_SCHEMA_VERSION,
      minReaderSchemaVersion: MIN_READER_SCHEMA_VERSION,
      docsLayout: sliceManifest.docsLayout,
      entryCount: bucket.entries.length,
      sliceRelPath: `by-id/${snapshotId}/${relSlicePath}`,
      sliceSha256: fileHashes[relSlicePath].sha256,
      sliceBytes: fileHashes[relSlicePath].bytes,
      verifiedEquivalentPatches: []
    };
  }

  // Pack release-wide `catalog.tar.gz` bundle
  let preliminaryManifest = {
    schemaVersion: CATALOG_SCHEMA_VERSION,
    minReaderSchemaVersion: MIN_READER_SCHEMA_VERSION,
    snapshotId,
    docRevision,
    sourceDate,
    sourceTag,
    sourceCommit,
    extractorCommit,
    extractorVersion: EXTRACTOR_VERSION,
    docsLayouts,
    packages: Object.fromEntries(
      Object.values(sliceMetadataByPackage).map(s => [s.packageName, s.packageVersion])
    ),
    allWorkspacePackageVersions: ctx.packageVersions,
    entryCount: entries.length
  };
  catalogTarEntries.push({
    path: 'manifest.json',
    content: JSON.stringify(preliminaryManifest, null, 2) + '\n'
  });
  let catalogGz = packTarGz(catalogTarEntries);
  writeSnapshotArtifact('catalog.tar.gz', catalogGz);

  let finalManifest = {
    ...preliminaryManifest,
    slices: sliceMetadataByPackage,
    files: fileHashes
  };
  let manifestStr = JSON.stringify(finalManifest, null, 2) + '\n';
  fs.writeFileSync(path.join(snapshotDir, 'manifest.json'), manifestStr, 'utf8');

  return {
    manifest: finalManifest,
    slices: sliceMetadataByPackage,
    entryCount: entries.length,
    entries,
    s2Assets
  };
}

/**
 * Merges one or more generated snapshot results into `<outRoot>/index.json` atomically. Preserves
 * existing package/version pointers unless a higher `docRevision` is published for the same package
 * version.
 */
export function updateSnapshotsIndex(outRoot, snapshotResults, options = {}) {
  let indexPath = path.join(outRoot, 'index.json');
  let indexData = {
    schemaVersion: CATALOG_SCHEMA_VERSION,
    minReaderSchemaVersion: MIN_READER_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    latest: {},
    snapshots: {},
    packages: {}
  };

  if (fs.existsSync(indexPath)) {
    try {
      indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    } catch {
      // recreate clean index
    }
  }

  for (let res of snapshotResults) {
    let {manifest, slices} = res;
    const manifestBytes = fs.readFileSync(
      path.join(outRoot, 'by-id', manifest.snapshotId, 'manifest.json')
    );
    indexData.snapshots[manifest.snapshotId] = {
      snapshotId: manifest.snapshotId,
      docRevision: manifest.docRevision,
      sourceTag: manifest.sourceTag,
      sourceCommit: manifest.sourceCommit,
      extractorCommit: manifest.extractorCommit,
      docsLayouts: manifest.docsLayouts,
      packages: manifest.packages,
      manifestPath: `by-id/${manifest.snapshotId}/manifest.json`,
      manifestSha256: sha256Hex(manifestBytes),
      manifestBytes: manifestBytes.length,
      catalogPath: `by-id/${manifest.snapshotId}/catalog.tar.gz`,
      catalogSha256: manifest.files['catalog.tar.gz']?.sha256,
      catalogBytes: manifest.files['catalog.tar.gz']?.bytes
    };

    for (let [pkgName, sliceInfo] of Object.entries(slices)) {
      if (!indexData.packages[pkgName]) {
        indexData.packages[pkgName] = {};
      }
      let existing = indexData.packages[pkgName][sliceInfo.packageVersion];
      let stagedDocRevision = sliceInfo.docRevision || 1;
      let existingDocRevision = existing?.docRevision || 1;
      let unionPatches = Array.from(
        new Set([
          ...(existing?.verifiedEquivalentPatches || []),
          ...(sliceInfo.verifiedEquivalentPatches || [])
        ])
      ).sort();
      if (
        !existing ||
        stagedDocRevision > existingDocRevision ||
        existing.snapshotId === sliceInfo.snapshotId
      ) {
        indexData.packages[pkgName][sliceInfo.packageVersion] = {
          ...sliceInfo,
          verifiedEquivalentPatches: unionPatches
        };
      } else {
        indexData.packages[pkgName][sliceInfo.packageVersion] = {
          ...existing,
          verifiedEquivalentPatches: unionPatches
        };
      }
      if (options.markAsLatest) {
        indexData.latest[pkgName] = sliceInfo.packageVersion;
      }
    }
  }

  indexData.updatedAt = new Date().toISOString();
  let tmpPath = `${indexPath}.${process.pid}.tmp`;
  fs.mkdirSync(outRoot, {recursive: true});
  fs.writeFileSync(tmpPath, JSON.stringify(indexData, null, 2) + '\n', 'utf8');
  fs.renameSync(tmpPath, indexPath);
  return indexData;
}
