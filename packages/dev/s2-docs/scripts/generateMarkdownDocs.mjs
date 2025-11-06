#!/usr/bin/env node

import * as babel from '@babel/parser';
import {fileURLToPath} from 'url';
import fs from 'fs';
import glob from 'fast-glob';
import path from 'path';
import {Project} from 'ts-morph';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import {unified} from 'unified';
import {visit} from 'unist-util-visit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../../');
const S2_SRC_ROOT = path.join(REPO_ROOT, 'packages/@react-spectrum/s2/src');
const RAC_SRC_ROOT = path.join(REPO_ROOT, 'packages/react-aria-components/src');
const INTL_SRC_ROOT = path.join(REPO_ROOT, 'packages/@internationalized');
const COMPONENT_SRC_ROOTS = [S2_SRC_ROOT, RAC_SRC_ROOT, INTL_SRC_ROOT];
const S2_DOCS_PAGES_ROOT = path.join(REPO_ROOT, 'packages/dev/s2-docs/pages');
const DIST_ROOT = path.join(REPO_ROOT, 'packages/dev/s2-docs/dist');
const LICENSE_COMMENT_REGEX = /^\s*\{\/\*[\s\S]*?Copyright\s+20\d{2}\s+Adobe[\s\S]*?\*\/\}\s*/;
const S2_ICON_ROOT = path.join(REPO_ROOT, 'packages/@react-spectrum/s2/s2wf-icons');
const S2_ILLUSTRATION_ROOT = path.join(REPO_ROOT, 'packages/@react-spectrum/s2/spectrum-illustrations');

let iconNamesCache = null;
let illustrationNamesCache = null;

// Pre-load a ts-morph project so we can query type information.
const project = new Project({
  tsConfigFilePath: path.join(REPO_ROOT, 'tsconfig.json'),
  skipAddingFilesFromTsConfig: true
});

/**
 * Clean type text by removing import statements and duplicate type parameters.
 */
function cleanTypeText(t) {
  // Remove import statements from type strings.
  let cleaned = t.replace(/import\(["'][^)]*["']\)\./g, '');
  // Remove duplicate type parameters.
  cleaned = cleaned.replace(/<\s*([A-Za-z0-9_$.]+)\s*,\s*\1\s*>/g, '<$1>');
  return cleaned;
}

function getIconNames() {
  if (iconNamesCache) {
    return iconNamesCache;
  }

  try {
    const files = fs.readdirSync(S2_ICON_ROOT);
    const names = new Set();

    for (const fileName of files) {
      if (!fileName.toLowerCase().endsWith('.svg')) {
        continue;
      }

      const normalized = fileName.replace(/^S2_Icon_(.*?)(Size\d+)?_2.*/, '$1');
      const cleaned = normalized.trim();
      if (cleaned) {
        names.add(cleaned);
      }
    }

    iconNamesCache = Array.from(names).sort((a, b) => a.localeCompare(b));
  } catch {
    iconNamesCache = [];
  }

  return iconNamesCache;
}

function getIllustrationNames() {
  if (illustrationNamesCache) {
    return illustrationNamesCache;
  }

  try {
    const names = new Set();
    const directories = ['linear', 'gradient/generic1', 'gradient/generic2'];

    for (const dir of directories) {
      const illustrationPath = path.join(S2_ILLUSTRATION_ROOT, dir);
      if (!fs.existsSync(illustrationPath)) {
        continue;
      }

      const files = fs.readdirSync(illustrationPath);
      for (const fileName of files) {
        if (fileName.endsWith('.tsx')) {
          // Extract name without extension
          const name = fileName.replace(/\.tsx$/, '');
          names.add(name);
        }
      }
    }

    illustrationNamesCache = Array.from(names).sort((a, b) => a.localeCompare(b));
  } catch {
    illustrationNamesCache = [];
  }

  return illustrationNamesCache;
}

function parseExpression(expr, file) {
  try {
    const ast = babel.parse(expr, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    
    if (ast.program.body.length > 0 && ast.program.body[0].type === 'ExpressionStatement') {
      return evaluateNode(ast.program.body[0].expression, file);
    }
    
    return null;
  } catch {
    return null;
  }
}

function evaluateNode(node, file) {
  if (!node) {
    return null;
  }

  switch (node.type) {
    case 'StringLiteral':
      return node.value;
    
    case 'NumericLiteral':
      return node.value;
    
    case 'BooleanLiteral':
      return node.value;
    
    case 'NullLiteral':
      return null;
    
    case 'ArrayExpression':
      return node.elements.map(el => evaluateNode(el, file)).filter(v => v !== null);
    
    case 'ObjectExpression': {
      const obj = {};
      for (const prop of node.properties) {
        if (prop.type === 'ObjectProperty') {
          const key = prop.key.type === 'Identifier' ? prop.key.name : evaluateNode(prop.key, file);
          obj[key] = evaluateNode(prop.value, file);
        }
      }
      return obj;
    }
    
    case 'Identifier':
      // For identifiers, return the name as a string
      return node.name;
    
    case 'JSXElement':
    case 'JSXFragment': {
      // For JSX elements, extract text content
      return extractJSXText(node, file);
    }
    
    case 'JSXText':
      return node.value;
    
    case 'MemberExpression': {
      // Handle member expressions like docs.exports.GregorianCalendar.description
      const object = evaluateNode(node.object, file);
      const property = node.computed ? evaluateNode(node.property, file) : (node.property.name || node.property.value);
      return `${object}.${property}`;
    }
    
    default:
      return null;
  }
}

function extractTypeLinkName(node) {
  const typeAttr = node.openingElement?.attributes?.find(
    attr => attr.type === 'JSXAttribute' && attr.name?.name === 'type'
  );
  if (!typeAttr || typeAttr.value?.type !== 'JSXExpressionContainer') {
    return '';
  }
  
  const expr = typeAttr.value.expression;
  if (expr.type !== 'MemberExpression') {
    return '';
  }
  
  // Extract the last property name (e.g., GregorianCalendar from docs.exports.GregorianCalendar)
  return expr.property?.name || '';
}

function extractDescriptionFromExpression(node, file) {
  if (node.type !== 'MemberExpression') {
    return null;
  }
  
  // Check if the outermost property is "description"
  if (node.property?.name !== 'description') {
    return null;
  }
  
  // Now check if the object is a member expression with pattern: *.exports.ComponentName
  const obj = node.object;
  if (obj?.type !== 'MemberExpression') {
    return null;
  }
  
  // Get the component name (the rightmost property before .description)
  const componentName = obj.property?.name;
  
  // Check if the parent is .exports
  if (obj.object?.type === 'MemberExpression' && obj.object.property?.name === 'exports' && componentName && file) {
    const desc = getComponentDescription(componentName, file);
    return desc;
  }
  
  return null;
}

function extractJSXText(node, file) {
  if (!node) {
    return '';
  }

  // Handle JSXElement
  if (node.type === 'JSXElement') {
    const elementName = node.openingElement?.name?.name;
    
    // For TypeLink, try to extract the type name
    if (elementName === 'TypeLink') {
      return extractTypeLinkName(node);
    }
    
    // For other elements like <p>, extract children text
    if (node.children) {
      return node.children
        .map(child => extractJSXText(child, file))
        .filter(text => text && text.trim())
        .join('');
    }
  }
  
  // Handle JSXText
  if (node.type === 'JSXText') {
    return node.value.trim();
  }
  
  // Handle JSXExpressionContainer
  if (node.type === 'JSXExpressionContainer') {
    const desc = extractDescriptionFromExpression(node.expression, file);
    if (desc) {
      return desc;
    }
    
    if (node.expression.type === 'MemberExpression') {
      return '[description]';
    }
    
    return evaluateNode(node.expression, file) || '';
  }
  
  // Handle JSXFragment
  if (node.type === 'JSXFragment') {
    if (node.children) {
      return node.children
        .map(child => extractJSXText(child, file))
        .filter(text => text && text.trim())
        .join('');
    }
  }
  
  return '';
}

function resolveComponentPath(componentName, file) {
  let roots = COMPONENT_SRC_ROOTS;
  if (file?.path) {
    if (file.path.includes(path.join('pages', 'react-aria'))) {
      roots = [RAC_SRC_ROOT, S2_SRC_ROOT, INTL_SRC_ROOT];
    } else if (file.path.includes(path.join('pages', 'internationalized'))) {
      roots = [INTL_SRC_ROOT, S2_SRC_ROOT, RAC_SRC_ROOT];
    }
  }

  for (let root of roots) {
    for (let ext of ['tsx', 'ts']) {
      const candidate = path.join(root, `${componentName}.${ext}`);
      if (fs.existsSync(candidate)) {return candidate;}
    }
  }

  if (!global.__componentPathCache) {
    global.__componentPathCache = new Map();
  }
  if (global.__componentPathCache.has(componentName)) {
    return global.__componentPathCache.get(componentName);
  }

  const matches = glob.sync(roots.map(r => path.posix.join(r, `**/${componentName}.{ts,tsx}`)), {
    absolute: true,
    suppressErrors: true,
    deep: 5
  });
  const resolved = matches[0] || null;
  global.__componentPathCache.set(componentName, resolved);
  return resolved;
}

/**
 * Extract the leading JSDoc description comment placed immediately above the export for a component.
 */
function getComponentDescription(componentName, file) {
  const componentPath = resolveComponentPath(componentName, file);
  if (!componentPath) {return null;}

  // Lazily add the source file to the ts-morph project.
  const source = project.addSourceFileAtPathIfExists(componentPath);
  if (!source) {return null;}

  // Try to find an exported declaration named exactly like the component.
  const exportedDecl = source.getExportedDeclarations().get(componentName)?.[0];
  const possibleNodes = [exportedDecl, source.getVariableDeclaration(componentName), source.getFunction(componentName), source.getClass(componentName)];

  let firstNodeDesc = null;
  for (let node of possibleNodes.filter(Boolean)) {
    let current = node;
    let isDirectNode = true;
    while (current) {
      let docs = typeof current.getJsDocs === 'function' ? current.getJsDocs() : [];
      if (!docs?.length) {
        isDirectNode = false;
        current = current.getParent?.();
        continue;
      }
      
      const desc = docs[0].getDescription().trim();
      if (!desc) {
        isDirectNode = false;
        current = current.getParent?.();
        continue;
      }
      
      // If this is the direct node (not a parent), return its description immediately
      if (isDirectNode) {
        return desc;
      }
      
      // Otherwise, check if the description mentions the component name
      const regex = new RegExp(`\\b${componentName}\\b`, 'i');
      if (regex.test(desc)) {
        return desc;
      }
      
      firstNodeDesc = firstNodeDesc || desc;
      isDirectNode = false;
      current = current.getParent?.();
    }
  }

  if (typeof firstNodeDesc === 'string') {
    return firstNodeDesc;
  }

  const allJsDocs = source.getDescendants().flatMap(d => d.getJsDocs?.() || []);
  for (let doc of allJsDocs.reverse()) {
    const desc = doc.getDescription().trim();
    if (desc && desc.toLowerCase().includes(componentName.toLowerCase())) {
      return desc;
    }
  }

  if (allJsDocs.length) {
    return allJsDocs[0].getDescription().trim();
  }

  return null;
}

/**
 * Build a markdown table of props for the given component by analyzing its interface.
 */
function generatePropTable(componentName, file) {
  const interfaceName = `${componentName}Props`;
  let componentPath = resolveComponentPath(componentName, file);

  // Fallback: deep search for the interface declaration if resolveComponentPath failed.
  if (!componentPath) {
    let roots = COMPONENT_SRC_ROOTS;
    if (file?.path) {
      if (file.path.includes(path.join('pages', 'react-aria'))) {
        roots = [RAC_SRC_ROOT, S2_SRC_ROOT, INTL_SRC_ROOT];
      } else if (file.path.includes(path.join('pages', 'internationalized'))) {
        roots = [INTL_SRC_ROOT, S2_SRC_ROOT, RAC_SRC_ROOT];
      }
    }
    const patterns = roots.map(r => path.posix.join(r, '**/*.{ts,tsx,d.ts}'));
    // Also scan other packages if not found in component roots.
    patterns.push(path.posix.join(REPO_ROOT, 'packages/**/*.{ts,tsx,d.ts}'));

    const matches = glob.sync(patterns, {
      absolute: true,
      suppressErrors: true,
      deep: 5
    }).filter(p => {
      try {
        const txt = fs.readFileSync(p, 'utf8');
        return new RegExp(`(interface|type)\\s+${interfaceName}\\b`).test(txt) || new RegExp(`export\\s+(function|const|class)\\s+${componentName}\\b`).test(txt);
      } catch {
        return false;
      }
    });
    componentPath = matches[0] || null;
  }

  if (!componentPath) {return null;}

  const source = project.addSourceFileAtPathIfExists(componentPath);
  if (!source) {return null;}

  const iface = source.getInterface(interfaceName);
  if (!iface) {return null;}

  const propSymbols = iface.getType().getProperties();

  const rows = propSymbols.map((sym) => {
    const name = sym.getName();
    const type = cleanTypeText(sym.getTypeAtLocation(iface).getText(iface));

    const decl = sym.getDeclarations()?.[0];
    let description = '';
    let defVal = '';
    if (decl && typeof decl.getJsDocs === 'function') {
      const docsArr = decl.getJsDocs();
      if (docsArr.length) {
        description = docsArr[0].getDescription().replace(/\n+/g, ' ').trim();
        const defaultTag = docsArr[0].getTags().find((t) => t.getTagName() === 'default');
        if (defaultTag) {
          defVal = defaultTag.getCommentText();
        }
      }
    }

    return {name, type, defVal, description};
  });

  if (!rows.length) {return null;}

  const header = '| Name | Type | Default | Description |\n|------|------|---------|-------------|';
  const body = rows
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((r) => {
      const typeStr = `\`${r.type}\``;
      return `| \`${r.name}\` | ${typeStr} | ${r.defVal || '—'} | ${r.description} |`;
    })
    .join('\n');

  return `${header}\n${body}`;
}

function generateInterfaceTable(interfaceName, file) {
  // Attempt to resolve the file containing the interface.
  let ifacePath = resolveComponentPath(interfaceName, file);

  // Fallback: deep search for interface declaration if resolveComponentPath failed.
  if (!ifacePath) {
    let roots = COMPONENT_SRC_ROOTS;
    if (file?.path) {
      if (file.path.includes(path.join('pages', 'react-aria'))) {
        roots = [RAC_SRC_ROOT, S2_SRC_ROOT, INTL_SRC_ROOT];
      } else if (file.path.includes(path.join('pages', 'internationalized'))) {
        roots = [INTL_SRC_ROOT, S2_SRC_ROOT, RAC_SRC_ROOT];
      }
    }
    const patterns = roots.map(r => path.posix.join(r, '**/*.{ts,tsx,d.ts}'));
    // Also scan other packages if not found in component roots.
    patterns.push(path.posix.join(REPO_ROOT, 'packages/**/*.{ts,tsx,d.ts}'));

    const matches = glob.sync(patterns, {
      absolute: true,
      suppressErrors: true,
      deep: 5
    }).filter(p => {
      try {
        const txt = fs.readFileSync(p, 'utf8');
        return new RegExp(`(interface|type)\\s+${interfaceName}\\b`).test(txt);
      } catch {
        return false;
      }
    });
    ifacePath = matches[0] || null;
  }

  if (!ifacePath) {return null;}

  const source = project.addSourceFileAtPathIfExists(ifacePath);
  if (!source) {return null;}

  const ifaceDecl = source.getInterface(interfaceName);
  if (!ifaceDecl) {return null;}

  const propSymbols = ifaceDecl.getType().getProperties();
  if (!propSymbols.length) {return null;}

  // Separate properties and methods
  const properties = [];
  const methods = [];

  for (const sym of propSymbols) {
    const name = sym.getName();
    const decl = sym.getDeclarations()?.[0];
    
    // Skip private and protected members
    if (decl) {
      const modifiers = decl.getModifiers?.() || [];
      const isPrivate = modifiers.some(m => m.getText() === 'private');
      const isProtected = modifiers.some(m => m.getText() === 'protected');
      if (isPrivate || isProtected) {
        continue;
      }
    }

    const type = sym.getTypeAtLocation(ifaceDecl);
    const callSignatures = type.getCallSignatures();
    
    let description = '';
    let defVal = '';
    let optional = false;

    if (decl && typeof decl.getJsDocs === 'function') {
      const docsArr = decl.getJsDocs();
      if (docsArr.length) {
        description = docsArr[0].getDescription().replace(/\n+/g, ' ').trim();
        const defaultTag = docsArr[0].getTags().find((t) => t.getTagName() === 'default');
        if (defaultTag) {
          defVal = defaultTag.getCommentText();
        }
      }
    }

    if (decl && decl.hasQuestionToken?.()) {
      optional = true;
    }

    // Check if this is a method (has call signatures)
    if (callSignatures.length > 0) {
      const sig = callSignatures[0];
      const params = sig.getParameters();
      const returnType = cleanTypeText(sig.getReturnType().getText());
      
      const paramStrs = params.map(p => {
        const pDecl = p.getDeclarations()?.[0];
        const pName = p.getName();
        const pType = cleanTypeText(p.getDeclaredType().getText());
        const pOptional = pDecl?.hasQuestionToken?.() ? '?' : '';
        return `${pName}${pOptional}: ${pType}`;
      });

      const signature = `${name}(${paramStrs.join(', ')}): ${returnType}`;
      methods.push({name, signature, description});
    } else {
      const typeText = cleanTypeText(type.getText(ifaceDecl));
      properties.push({name, type: typeText, description, defVal, optional});
    }
  }

  if (!properties.length && !methods.length) {return null;}

  const sections = [];

  // Render properties section
  if (properties.length > 0) {
    if (methods.length > 0) {
      sections.push('### Properties\n');
    }

    // Check if we need a Default column
    const hasDefaults = properties.some(p => !!p.defVal);
    
    // Sort properties so required ones are shown first
    const sortedProps = properties.sort((a, b) => {
      if (!a.optional && b.optional) {
        return -1;
      }
      if (a.optional && !b.optional) {
        return 1;
      }
      return 0;
    });

    if (hasDefaults) {
      sections.push('| Name | Type | Default | Description |');
      sections.push('|------|------|---------|-------------|');
      sortedProps.forEach(r => {
        const nameStr = r.optional ? `\`${r.name}\`` : `\`${r.name}\` *`;
        const typeStr = `\`${r.type}\``;
        const defStr = r.defVal || '—';
        sections.push(`| ${nameStr} | ${typeStr} | ${defStr} | ${r.description || '—'} |`);
      });
    } else {
      sections.push('| Name | Type | Description |');
      sections.push('|------|------|-------------|');
      sortedProps.forEach(r => {
        const nameStr = r.optional ? `\`${r.name}\`` : `\`${r.name}\` *`;
        const typeStr = `\`${r.type}\``;
        sections.push(`| ${nameStr} | ${typeStr} | ${r.description || '—'} |`);
      });
    }
    sections.push('');
  }

  // Render methods section
  if (methods.length > 0) {
    if (properties.length > 0) {
      sections.push('### Methods\n');
    }

    methods.forEach(m => {
      sections.push(`#### \`${m.signature}\`\n`);
      if (m.description) {
        sections.push(`${m.description}\n`);
      }
    });
  }

  return sections.join('\n');
}

/**
 * Custom remark plugin that removes MDX import/export statements.
 */
function remarkRemoveImportsExports() {
  return (tree) => {
    visit(tree, 'mdxjsEsm', (node, index, parent) => {
      parent.children.splice(index, 1);
      return index;
    });
  };
}

/**
 * Custom remark plugin that converts specific MDX JSX elements to plain markdown.
 */
function remarkDocsComponentsToMarkdown() {
  return (tree, file) => {
    const relatedTypes = new Set();
    visit(tree, ['mdxJsxFlowElement', 'mdxJsxTextElement'], (node, index, parent) => {
      const name = node.name;
      if (name === 'InstallCommand') {
        const pkgAttr = node.attributes?.find(a => a.name === 'pkg');
        if (!pkgAttr) {
          parent.children.splice(index, 1);
          return index;
        }

        let pkg = '';
        if (pkgAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          pkg = pkgAttr.value.value.replace(/['"`]/g, '').trim();
        } else if (typeof pkgAttr.value === 'string') {
          pkg = pkgAttr.value.trim();
        }

        if (!pkg) {
          parent.children.splice(index, 1);
          return index;
        }

        const flagsAttr = node.attributes?.find(a => a.name === 'flags');
        let flags = '';
        if (flagsAttr) {
          if (flagsAttr.value?.type === 'mdxJsxAttributeValueExpression') {
            flags = flagsAttr.value.value.replace(/['"`]/g, '').trim();
          } else if (typeof flagsAttr.value === 'string') {
            flags = flagsAttr.value.trim();
          }
        }

        const commandText = `npm install ${pkg}${flags ? ' ' + flags : ''}`.trim();

        const codeNode = {
          type: 'code',
          lang: 'bash',
          meta: '',
          value: commandText
        };

        parent.children.splice(index, 1, codeNode);
        return index;
      }

      // Render a simple command snippet.
      if (name === 'Command') {
        const commandAttr = node.attributes?.find(a => a.name === 'command');
        if (!commandAttr) {
          parent.children.splice(index, 1);
          return index;
        }

        let command = '';
        if (commandAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          command = commandAttr.value.value.replace(/['"`]/g, '').trim();
        } else if (typeof commandAttr.value === 'string') {
          command = commandAttr.value.trim();
        }

        if (!command) {
          parent.children.splice(index, 1);
          return index;
        }

        const codeNode = {
          type: 'code',
          lang: 'bash',
          meta: '',
          value: command
        };

        parent.children.splice(index, 1, codeNode);
        return index;
      }

      // Render an unordered list of icon names.
      if (name === 'IconsPageSearch') {
        const iconList = getIconNames();
        const listMarkdown = iconList.length 
          ? iconList.map(iconName => `- ${iconName}`).join('\n') 
          : '> Icon list could not be generated.';
        const iconListNode = unified().use(remarkParse).parse(listMarkdown);
        parent.children.splice(index, 1, ...iconListNode.children);
        return index;
      }

      // Render an unordered list of illustration names.
      if (name === 'IllustrationCards') {
        const illustrationList = getIllustrationNames();
        const listMarkdown = illustrationList.length 
          ? illustrationList.map(illustrationName => `- ${illustrationName}`).join('\n') 
          : '> Illustration list could not be generated.';
        const illustrationCardsNode = unified().use(remarkParse).parse(listMarkdown);
        parent.children.splice(index, 1, ...illustrationCardsNode.children);
        return index;
      }

      // Render a table of icon colors.
      if (name === 'IconColors') {
        const colorsAttr = node.attributes?.find(a => a.name === 'colors');
        let colorList = [];
        
        if (colorsAttr && colorsAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          const expr = colorsAttr.value.value;
          const parsed = parseExpression(expr, file);
          if (Array.isArray(parsed)) {
            colorList = parsed.filter(c => typeof c === 'string');
          }
        }

        if (colorList.length > 0) {
          const header = ['| Color |', '|-------|'];
          const rows = colorList.map(color => `| ${color} |`);
          const tableMarkdown = `${header.join('\n')}\n${rows.join('\n')}`;
          const iconColorsNode = unified().use(remarkParse).parse(tableMarkdown);
          parent.children.splice(index, 1, ...iconColorsNode.children);
        } else {
          // If no colors found, remove the node
          parent.children.splice(index, 1);
        }
        return index;
      }

      // Render a table of icon sizes.
      if (name === 'IconSizes') {
        const sizesAttr = node.attributes?.find(a => a.name === 'sizes');
        let sizeList = [];
        
        if (sizesAttr && sizesAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          const expr = sizesAttr.value.value;
          const parsed = parseExpression(expr, file);
          if (Array.isArray(parsed)) {
            sizeList = parsed
              .filter(item => typeof item === 'object' && item.size && item.pixels)
              .map(item => ({
                size: String(item.size),
                pixels: String(item.pixels)
              }));
          }
        }

        if (sizeList.length > 0) {
          const header = ['| Size | Pixels |', '|------|--------|'];
          const rows = sizeList.map(({size, pixels}) => `| ${size} | ${pixels} |`);
          const tableMarkdown = `${header.join('\n')}\n${rows.join('\n')}`;
          const iconSizesNode = unified().use(remarkParse).parse(tableMarkdown);
          parent.children.splice(index, 1, ...iconSizesNode.children);
        } else {
          // If no sizes found, remove the node
          parent.children.splice(index, 1);
        }
        return index;
      }

      // Render a text node with the component description.
      if (name === 'PageDescription') {
        // Assume first child is expression "docs.exports.Component.description".
        const exprNode = node.children?.find((c) => c.type === 'mdxFlowExpression' || c.type === 'mdxTextExpression');
        if (exprNode) {
          const m = exprNode.value.match(/docs\.exports\.([\w$]+)\.description/);
          if (m) {
            const desc = getComponentDescription(m[1], file);
            if (desc) {
              // Replace with normal paragraph node.
              if (node.type === 'mdxJsxFlowElement') {
                parent.children[index] = {
                  type: 'paragraph',
                  children: [{type: 'text', value: desc}]
                };
              } else {
                parent.children[index] = {type: 'text', value: desc};
              }
              return;
            }
          }
        }
        // Use literal text content inside <PageDescription> if present.
        const textContent = (node.children || [])
          .filter(c => c.type === 'text' || c.type === 'mdxText')
          .map(c => c.value)
          .join('')
          .trim();

        if (textContent) {
          if (node.type === 'mdxJsxFlowElement') {
            parent.children[index] = {
              type: 'paragraph',
              children: [{type: 'text', value: textContent}]
            };
          } else {
            parent.children[index] = {type: 'text', value: textContent};
          }
          return;
        }
        // If failed, wipe element.
        parent.children.splice(index, 1);
        return index;
      }

      // Render a table of props.
      if (name === 'PropTable') {
        const compAttr = node.attributes?.find((a) => a.name === 'component');
        if (compAttr && compAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          const m = compAttr.value.value.match(/docs\.exports\.([\w$]+)/);
          if (m) {
            const table = generatePropTable(m[1], file);
            if (table) {
              const tableTree = unified().use(remarkParse).parse(table);
              parent.children.splice(index, 1, ...tableTree.children);
              return index + tableTree.children.length;
            }
          }
        }
        parent.children.splice(index, 1);
        return index;
      }

      // Render a table of props.
      if (name === 'GroupedPropTable') {
        // GroupedPropTable uses spread attributes like {...docs.exports.TypeName}
        const spreadAttr = node.attributes?.find(a => a.type === 'mdxJsxExpressionAttribute');
        let typeName = null;
        
        if (spreadAttr && spreadAttr.value) {
          const m = spreadAttr.value.match(/\.\.\.docs\.exports\.([\w$]+)/);
          if (m) {
            typeName = m[1];
          }
        }

        if (!typeName) {
          // Could not determine type, remove node
          parent.children.splice(index, 1);
          return index;
        }

        // Generate interface table (GroupedPropTable typically displays interfaces)
        const table = generateInterfaceTable(typeName, file);
        if (table) {
          const tableTree = unified().use(remarkParse).parse(table);
          parent.children.splice(index, 1, ...tableTree.children);
          return index + tableTree.children.length;
        }

        // Fallback: remove node
        parent.children.splice(index, 1);
        return index;
      }

      // Render all code examples.
      if (name === 'ExampleSwitcher') {
        const examplesAttr = node.attributes?.find(a => a.name === 'examples');
        let exampleTitles = [];
        if (examplesAttr && examplesAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          const parsed = parseExpression(examplesAttr.value.value, file);
          exampleTitles = Array.isArray(parsed) ? parsed : [];
        }

        // Fallback default titles when none were provided.
        if (exampleTitles.length === 0) {
          exampleTitles = ['Vanilla CSS', 'Tailwind'];
        }

        // Children may include whitespace/text nodes – filter to VisualExample elements.
        const visualChildren = (node.children || []).filter(c => c.type === 'mdxJsxFlowElement' && c.name === 'VisualExample');

        // Build replacement markdown nodes.
        const newNodes = [];

        visualChildren.forEach((vChild, i) => {
          const title = exampleTitles[i] || `Example ${i + 1}`;

          // ## {title} example
          newNodes.push({
            type: 'heading',
            depth: 2,
            children: [{type: 'text', value: `${title} example`}]
          });

          // Extract files attribute from VisualExample
          const filesAttr = vChild.attributes?.find(a => a.name === 'files');
          let fileList = [];
          if (filesAttr) {
            if (filesAttr.value?.type === 'mdxJsxAttributeValueExpression') {
              const parsed = parseExpression(filesAttr.value.value, file);
              fileList = Array.isArray(parsed) ? parsed : [];
            } else if (Array.isArray(filesAttr.value)) {
              fileList = filesAttr.value;
            }
          }

          fileList.forEach(fp => {
            const absPath = path.join(REPO_ROOT, fp);
            if (!fs.existsSync(absPath)) {return;}
            const contents = fs.readFileSync(absPath, 'utf8');
            const ext = path.extname(fp).slice(1);

            // ### {filename}
            newNodes.push({
              type: 'heading',
              depth: 3,
              children: [{type: 'text', value: path.basename(fp)}]
            });

            // ```{lang}\n{contents}\n```
            newNodes.push({
              type: 'code',
              lang: ext || undefined,
              meta: '',
              value: contents
            });
          });
        });

        // Replace ExampleSwitcher node with generated markdown.
        parent.children.splice(index, 1, ...newNodes);
        return index + newNodes.length;
      }

      // Render code for each bundler.
      if (name === 'BundlerSwitcher') {
        const bundlerItems = (node.children || []).filter(c => c.type === 'mdxJsxFlowElement' && c.name === 'BundlerSwitcherItem');
        const newNodes = [];

        const extractLabel = (itemNode) => {
          const labelAttr = itemNode.attributes?.find(a => a.name === 'label');
          if (!labelAttr) {return null;}

          if (labelAttr.value?.type === 'mdxJsxAttributeValueExpression') {
            return labelAttr.value.value.replace(/['"`]/g, '').trim();
          }

          if (typeof labelAttr.value === 'string') {
            return labelAttr.value.trim();
          }

          return null;
        };

        bundlerItems.forEach((itemNode) => {
          const label = extractLabel(itemNode) || 'Configuration';

          newNodes.push({
            type: 'heading',
            depth: 3,
            children: [{type: 'text', value: label}]
          });

          const itemChildren = (itemNode.children || []).filter(child => child.type !== 'text' || child.value.trim() !== '');
          if (itemChildren.length) {
            newNodes.push(...itemChildren);
          }
        });

        parent.children.splice(index, 1, ...newNodes);
        return index + newNodes.length;
      }

      // Render a simple code snippet.
      if (name === 'VisualExample') {
        const componentAttr = node.attributes?.find(a => a.name === 'component');
        const importSourceAttr = node.attributes?.find(a => a.name === 'importSource');
        const initialPropsAttr = node.attributes?.find(a => a.name === 'initialProps');

        let componentName = 'Component';
        if (componentAttr && componentAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          componentName = componentAttr.value.value.trim();
        }

        let importSource = '@react-spectrum/s2';
        if (importSourceAttr) {
          if (importSourceAttr.value?.type === 'mdxJsxAttributeValueExpression') {
            importSource = importSourceAttr.value.value.replace(/['"`]/g, '').trim();
          } else if (typeof importSourceAttr.value === 'string') {
            importSource = importSourceAttr.value;
          }
        }

        let initialProps = {};
        if (initialPropsAttr && initialPropsAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          const parsed = parseExpression(initialPropsAttr.value.value, file);
          initialProps = (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
        }

        const {children: childrenProp, ...otherProps} = initialProps;

        const propsString = Object.entries(otherProps)
          .map(([k, v]) => {
            if (typeof v === 'string') {
              return `${k}="${v}"`;
            }
            if (typeof v === 'boolean') {
              return v ? k : '';
            }
            return `${k}={${JSON.stringify(v)}}`;
          })
          .filter(Boolean)
          .join(' ');

        let jsxSnippet;
        if (childrenProp === undefined) {
          // self-closing tag if no children provided
          jsxSnippet = `<${componentName}${propsString ? ' ' + propsString : ''} />`;
        } else {
          const opening = `<${componentName}${propsString ? ' ' + propsString : ''}>`;
          const closing = `</${componentName}>`;
          jsxSnippet = `${opening}${childrenProp}${closing}`;
        }

        const snippetLines = [
          `import {${componentName}} from '${importSource}';`,
          '',
          jsxSnippet
        ].join('\n');

        const codeNode = {
          type: 'code',
          lang: 'tsx',
          meta: '',
          value: snippetLines
        };

        parent.children.splice(index, 1, codeNode);
        return index + 1;
      }

      // Render the version.
      if (name === 'VersionBadge') {
        const versionAttr = node.attributes?.find(a => a.name === 'version');
        let version = '';
        
        if (versionAttr) {
          if (versionAttr.value?.type === 'mdxJsxAttributeValueExpression') {
            version = versionAttr.value.value.replace(/['"`]/g, '').trim();
          } else if (typeof versionAttr.value === 'string') {
            version = versionAttr.value.trim();
          }
        }

        if (version) {
          parent.children[index] = {type: 'text', value: `(${version})`};
        } else {
          // No version, just remove the badge
          parent.children.splice(index, 1);
          return index;
        }
        return;
      }

      // Render markdown links.
      if (name === 'Link' || name === 'LinkButton') {
        const hrefAttr = node.attributes?.find(a => a.name === 'href');
        let href = '';
        
        if (hrefAttr) {
          if (hrefAttr.value?.type === 'mdxJsxAttributeValueExpression') {
            href = hrefAttr.value.value.replace(/['"`]/g, '').trim();
          } else if (typeof hrefAttr.value === 'string') {
            href = hrefAttr.value.trim();
          }
        }

        // Check for aria-label attribute first
        const ariaLabelAttr = node.attributes?.find(a => a.name === 'aria-label');
        let ariaLabel = '';
        
        if (ariaLabelAttr) {
          if (ariaLabelAttr.value?.type === 'mdxJsxAttributeValueExpression') {
            ariaLabel = ariaLabelAttr.value.value.replace(/['"`]/g, '').trim();
          } else if (typeof ariaLabelAttr.value === 'string') {
            ariaLabel = ariaLabelAttr.value.trim();
          }
        }

        // Extract text content from children
        const extractText = (children) => {
          if (!children) {return '';}
          return children
            .map(child => {
              if (child.type === 'text' || child.type === 'mdxText') {
                return child.value;
              }
              if (child.children) {
                return extractText(child.children);
              }
              return '';
            })
            .join('');
        };

        const childrenText = extractText(node.children);
        const linkText = ariaLabel || childrenText || href;

        if (href) {
          const linkNode = {
            type: 'link',
            url: href,
            children: [{type: 'text', value: linkText}]
          };
          
          // If this is a flow element (block-level), wrap in paragraph to preserve spacing
          if (node.type === 'mdxJsxFlowElement') {
            parent.children[index] = {
              type: 'paragraph',
              children: [linkNode]
            };
          } else {
            parent.children[index] = linkNode;
          }
        } else {
          // No href, just convert to plain text
          if (node.type === 'mdxJsxFlowElement') {
            parent.children[index] = {
              type: 'paragraph',
              children: [{type: 'text', value: linkText}]
            };
          } else {
            parent.children[index] = {type: 'text', value: linkText};
          }
        }
        return;
      }

      // Remove components we can't render as markdown.
      if (['Anatomy'].includes(name)) {
        parent.children.splice(index, 1);
        return index;
      }

      if (name === 'TypeLink') {
        const typeAttr = node.attributes?.find((a) => a.name === 'type');
        if (typeAttr && typeAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          const expr = typeAttr.value.value.trim();
          // Match anyVar.exports.TypeName or docs.exports.TypeName
          let m = expr.match(/\.exports\.([\w$]+)/);
          let typeName = m ? m[1] : null;

          if (!typeName) {
            // Fall back to the last identifier segment e.g. "PressEvent" in typesDocs.exports.PressEvent or just PressEvent
            typeName = expr.split('.')?.pop()?.replace(/[^\w$]/g, '') || null;
          }

          if (typeName) {
            relatedTypes.add(typeName);
            parent.children[index] = {type: 'inlineCode', value: typeName};
            return;
          }
        }
        // Fallback – replace with empty string to avoid unhandled component.
        parent.children[index] = {type: 'text', value: ''};
        return index;
      }

      // Render an unordered list of style properties.
      if (name === 'S2StyleProperties') {
        const propertiesAttr = node.attributes?.find(a => a.name === 'properties');
        let propertyList = [];
        
        if (propertiesAttr && propertiesAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          const expr = propertiesAttr.value.value;
          const parsed = parseExpression(expr, file);
          if (Array.isArray(parsed)) {
            propertyList = parsed.filter(p => typeof p === 'string');
          }
        }

        if (propertyList.length > 0) {
          // Generate markdown bullet list with inline code
          const listItems = propertyList.map(prop => `- \`${prop}\``).join('\n');
          const listNode = unified().use(remarkParse).parse(listItems);
          parent.children.splice(index, 1, ...listNode.children);
          return index + listNode.children.length;
        } else {
          // If no properties found, remove the node
          parent.children.splice(index, 1);
        }
        return index;
      }

      // Render a table of S2 colors.
      if (name === 'S2Colors') {
        const colorSections = [
          {
            title: 'Background colors',
            description: 'The backgroundColor property supports the following values, in addition to the semantic and global colors shown below. These colors are specifically chosen to be used as backgrounds, so prefer them over global colors where possible.',
            colors: [
              'base', 'layer-1', 'layer-2', 'pasteboard', 'elevated',
              'accent', 'accent-subtle', 'neutral', 'neutral-subdued', 'neutral-subtle',
              'negative', 'negative-subtle', 'informative', 'informative-subtle',
              'positive', 'positive-subtle', 'notice', 'notice-subtle',
              'gray', 'gray-subtle', 'red', 'red-subtle', 'orange', 'orange-subtle',
              'yellow', 'yellow-subtle', 'chartreuse', 'chartreuse-subtle',
              'celery', 'celery-subtle', 'green', 'green-subtle', 'seafoam', 'seafoam-subtle',
              'cyan', 'cyan-subtle', 'blue', 'blue-subtle', 'indigo', 'indigo-subtle',
              'purple', 'purple-subtle', 'fuchsia', 'fuchsia-subtle',
              'magenta', 'magenta-subtle', 'pink', 'pink-subtle',
              'turquoise', 'turquoise-subtle', 'cinnamon', 'cinnamon-subtle',
              'brown', 'brown-subtle', 'silver', 'silver-subtle', 'disabled'
            ]
          },
          {
            title: 'Text colors',
            description: 'The color property supports the following values, in addition to the semantic and global colors shown below. These colors are specifically chosen to be used as text colors, so prefer them over global colors where possible.',
            colors: [
              'accent', 'neutral', 'neutral-subdued', 'negative', 'disabled',
              'heading', 'title', 'body', 'detail', 'code'
            ]
          },
          {
            title: 'Semantic colors',
            description: 'The following values are available across all color properties. Prefer to use semantic colors over global colors when they represent a specific meaning.',
            scales: ['accent-color', 'informative-color', 'negative-color', 'notice-color', 'positive-color']
          },
          {
            title: 'Global colors',
            description: 'The following values are available across all color properties.',
            scales: [
              'gray', 'blue', 'red', 'orange', 'yellow', 'chartreuse', 'celery',
              'green', 'seafoam', 'cyan', 'indigo', 'purple', 'fuchsia',
              'magenta', 'pink', 'turquoise', 'brown', 'silver', 'cinnamon'
            ]
          }
        ];

        const newNodes = [];
        for (const section of colorSections) {
          // Add heading
          newNodes.push({
            type: 'heading',
            depth: 4,
            children: [{type: 'text', value: section.title}]
          });

          // Add description
          newNodes.push({
            type: 'paragraph',
            children: [{type: 'text', value: section.description}]
          });

          // Add color list
          if (section.colors) {
            const listItems = section.colors.map(color => `- \`${color}\``).join('\n');
            const listNode = unified().use(remarkParse).parse(listItems);
            newNodes.push(...listNode.children);
          } else if (section.scales) {
            // For scales, note that they include numbered variants (e.g., gray-100, gray-200, etc.)
            const scaleNote = section.scales.map(scale => {
              const baseName = scale.replace(/-color$/, '');
              // Gray scale includes 25, 50, 75, while others start at 100
              if (baseName === 'gray') {
                return `- \`${baseName}\` scale (e.g., \`${baseName}-25\`, \`${baseName}-50\`, \`${baseName}-75\`, \`${baseName}-100\`, ..., \`${baseName}-1600\`)`;
              }
              return `- \`${baseName}\` scale (e.g., \`${baseName}-100\`, \`${baseName}-200\`, ..., \`${baseName}-1600\`)`;
            }).join('\n');
            const scaleNode = unified().use(remarkParse).parse(scaleNote);
            newNodes.push(...scaleNode.children);
          }
        }

        parent.children.splice(index, 1, ...newNodes);
        return index + newNodes.length;
      }

      // Render a markdown table.
      if (name === 'StaticTable') {
        const headersAttr = node.attributes?.find(a => a.name === 'headers');
        const rowsAttr = node.attributes?.find(a => a.name === 'rows');
        const codeColumnsAttr = node.attributes?.find(a => a.name === 'codeColumns');

        let headers = [];
        let rows = [];
        let codeColumns = [];

        if (headersAttr && headersAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          const parsed = parseExpression(headersAttr.value.value, file);
          headers = Array.isArray(parsed) ? parsed : [];
        }

        if (rowsAttr && rowsAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          const parsed = parseExpression(rowsAttr.value.value, file);
          rows = Array.isArray(parsed) ? parsed : [];
        }

        if (codeColumnsAttr && codeColumnsAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          const parsed = parseExpression(codeColumnsAttr.value.value, file);
          codeColumns = Array.isArray(parsed) ? parsed : [];
        }

        // Helper to extract text content from cell values
        const extractCellText = (cell) => {
          if (cell === null || cell === undefined) {
            return '';
          }
          if (typeof cell === 'string' || typeof cell === 'number' || typeof cell === 'boolean') {
            return String(cell);
          }
          // If it's an object (could be a parsed JSX element or other structure), try to get meaningful text
          if (typeof cell === 'object') {
            // Check if it has a 'children' property (common in parsed objects)
            if (cell.children) {
              return extractCellText(cell.children);
            }
            // If it's an array, join the elements
            if (Array.isArray(cell)) {
              return cell.map(extractCellText).join('');
            }
            // Otherwise, try to get some representation
            return JSON.stringify(cell);
          }
          return String(cell);
        };

        if (headers.length > 0 && rows.length > 0) {
          // Build markdown table
          const headerRow = headers.map(h => extractCellText(h));
          const separator = headers.map(() => '------');
          
          const bodyRows = rows.map(row => {
            if (!Array.isArray(row)) {return [];}
            return row.map((cell, colIdx) => {
              let text = extractCellText(cell);
              // Apply code formatting if this column is in codeColumns
              if (codeColumns.includes(colIdx)) {
                // If not already wrapped in backticks, wrap it
                if (!text.startsWith('`')) {
                  text = `\`${text}\``;
                }
              }
              // Escape pipe characters in cells
              text = text.replace(/\|/g, '\\|');
              return text;
            });
          });

          const tableMarkdown = [
            `| ${headerRow.join(' | ')} |`,
            `| ${separator.join(' | ')} |`,
            ...bodyRows.map(row => `| ${row.join(' | ')} |`)
          ].join('\n');

          const tableTree = unified().use(remarkParse).parse(tableMarkdown);
          parent.children.splice(index, 1, ...tableTree.children);
          return index + tableTree.children.length;
        }

        // If we couldn't build the table, remove the node
        parent.children.splice(index, 1);
        return index;
      }
      
      // Render a markdown table.
      if (name === 'StateTable') {
        // Extract interface name from properties attribute
        const propertiesAttr = node.attributes?.find(a => a.name === 'properties');
        let ifaceName = null;
        if (propertiesAttr && propertiesAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          const m = propertiesAttr.value.value.match(/docs\.exports\.([\w$]+)\.properties/);
          if (m) {
            ifaceName = m[1];
          }
        }

        if (!ifaceName) {
          // Could not determine interface, remove node
          parent.children.splice(index, 1);
          return index;
        }

        // Parse other attributes
        const defaultClassAttr = node.attributes?.find(a => a.name === 'defaultClassName');
        let defaultClassName = null;
        if (defaultClassAttr) {
          if (defaultClassAttr.value?.type === 'mdxJsxAttributeValueExpression') {
            // Expression like "'react-aria-ComboBox'"
            const m = defaultClassAttr.value.value.match(/['"]([\w-]+)['"]/);
            if (m) {defaultClassName = m[1];}
          } else if (defaultClassAttr.value?.type === 'mdxJsxAttributeValueLiteral') {
            defaultClassName = defaultClassAttr.value.value;
          } else if (typeof defaultClassAttr.value === 'string') {
            defaultClassName = defaultClassAttr.value;
          }
        }

        const showOptionalAttr = node.attributes?.find(a => a.name === 'showOptional');
        const hideSelectorAttr = node.attributes?.find(a => a.name === 'hideSelector');

        const table = generateStateTable(ifaceName, {
          showOptional: !!showOptionalAttr,
          hideSelector: !!hideSelectorAttr
        }, file);

        if (table) {
          const nodesToInsert = [];
          if (defaultClassName) {
            nodesToInsert.push({
              type: 'paragraph',
              children: [
                {type: 'text', value: 'Default className: '},
                {type: 'inlineCode', value: defaultClassName}
              ]
            });
          }
          const tableTree = unified().use(remarkParse).parse(table);
          nodesToInsert.push(...tableTree.children);
          parent.children.splice(index, 1, ...nodesToInsert);
          return index + nodesToInsert.length;
        }

        // Fallback: remove node
        parent.children.splice(index, 1);
        return index;
      }
      
      if (name === 'ClassAPI') {
        // Extract class name from class attribute
        const classAttr = node.attributes?.find(a => a.name === 'class');
        let className = null;
        if (classAttr && classAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          const m = classAttr.value.value.match(/docs\.exports\.([\w$]+)/);
          if (m) {
            className = m[1];
          }
        }

        if (!className) {
          // Could not determine class, remove node
          parent.children.splice(index, 1);
          return index;
        }

        // Generate method table and property table for the class
        const table = generateClassAPITable(className, file);
        if (table) {
          const tableTree = unified().use(remarkParse).parse(table);
          parent.children.splice(index, 1, ...tableTree.children);
          return index + tableTree.children.length;
        }

        // Fallback: remove node
        parent.children.splice(index, 1);
        return index;
      }
      
      if (name === 'InterfaceType') {
        // InterfaceType uses spread attributes like {...docs.exports.TypeName}
        // We need to look for spread attributes
        const spreadAttr = node.attributes?.find(a => a.type === 'mdxJsxExpressionAttribute');
        let typeName = null;
        
        if (spreadAttr && spreadAttr.value) {
          const m = spreadAttr.value.match(/\.\.\.docs\.exports\.([\w$]+)/);
          if (m) {
            typeName = m[1];
          }
        }

        if (!typeName) {
          // Could not determine type, remove node
          parent.children.splice(index, 1);
          return index;
        }

        // Generate interface table
        const table = generateInterfaceTable(typeName, file);
        if (table) {
          const tableTree = unified().use(remarkParse).parse(table);
          parent.children.splice(index, 1, ...tableTree.children);
          return index + tableTree.children.length;
        }

        // Fallback: remove node
        parent.children.splice(index, 1);
        return index;
      }
    });

    // Clean up code block language specifiers (e.g. "tsx render" -> "tsx").
    visit(tree, 'code', (node) => {
      if (node.meta) {
        node.meta = '';
      }
      if (node.value.startsWith('"use client";\n')) {
        node.value = node.value.slice(14);
      }
      // Remove docs rendering-specific comments.
      node.value = node.value
        .split('\n')
        .filter(l => !/^\s*\/\/\/-\s*(begin|end)/i.test(l))
        .map(l => l.replace(/\/\*\s*PROPS\s*\*\//gi, ''))
        .join('\n');
    });

    // Append "Related Types" section if we collected any.
    if (relatedTypes.size > 0) {
      const newNodes = [
        {type: 'heading', depth: 2, children: [{type: 'text', value: 'Related Types'}]}
      ];

      for (const typeName of Array.from(relatedTypes)) {
        // ### {typeName}
        newNodes.push({type: 'heading', depth: 3, children: [{type: 'text', value: typeName}]});

        const desc = getComponentDescription(typeName, file);
        if (desc) {
          newNodes.push({type: 'paragraph', children: [{type: 'text', value: desc}]});
        }

        // Try to generate a table with the interface definition first.
        let tableMd = generateInterfaceTable(typeName, file);

        // Fallback to prop table (e.g., when typeName is a component).
        if (!tableMd) {
          tableMd = generatePropTable(typeName, file);
        }

        // For functions like hooks, attempt to document their options interface.
        if (!tableMd) {
          tableMd = generateFunctionOptionsTable(typeName, file);
        }

        if (tableMd) {
          const tableTree = unified().use(remarkParse).parse(tableMd);
          newNodes.push(...tableTree.children);
        }
      }

      tree.children.push(...newNodes);
    }
  };
}

/**
 * Generate markdown documentation for a class, including its methods and properties.
 */
function generateClassAPITable(className, file) {
  let classPath = resolveComponentPath(className, file);
  
  if (!classPath) {
    // Fallback: deep search for class declaration
    let roots = COMPONENT_SRC_ROOTS;
    if (file?.path) {
      if (file.path.includes(path.join('pages', 'react-aria'))) {
        roots = [RAC_SRC_ROOT, S2_SRC_ROOT, INTL_SRC_ROOT];
      } else if (file.path.includes(path.join('pages', 'internationalized'))) {
        roots = [INTL_SRC_ROOT, S2_SRC_ROOT, RAC_SRC_ROOT];
      }
    }
    const patterns = roots.map(r => path.posix.join(r, '**/*.{ts,tsx,d.ts}'));
    patterns.push(path.posix.join(REPO_ROOT, 'packages/**/*.{ts,tsx,d.ts}'));

    const matches = glob.sync(patterns, {
      absolute: true,
      suppressErrors: true,
      deep: 5
    }).filter(p => {
      try {
        const txt = fs.readFileSync(p, 'utf8');
        return new RegExp(`class\\s+${className}\\b`).test(txt);
      } catch {
        return false;
      }
    });
    classPath = matches[0] || null;
  }

  if (!classPath) {
    return null;
  }

  const source = project.addSourceFileAtPathIfExists(classPath);
  if (!source) {
    return null;
  }

  const classDecl = source.getClass(className);
  if (!classDecl) {
    return null;
  }

  const sections = [];

  // Generate constructor documentation if available
  const constructors = classDecl.getConstructors();
  if (constructors.length > 0) {
    const ctor = constructors[0];
    const params = ctor.getParameters();
    
    if (params.length > 0) {
      sections.push('### Constructor\n');
      const rows = params.map(param => {
        const name = param.getName();
        const type = cleanTypeText(param.getType().getText(param));
        let description = '';
        
        const ctorDocs = ctor.getJsDocs();
        if (ctorDocs.length > 0) {
          const paramTag = ctorDocs[0].getTags().find(t => t.getTagName() === 'param' && t.getName?.() === name);
          if (paramTag) {
            description = paramTag.getCommentText() || '';
          }
        }
        
        return {name, type, description};
      });

      sections.push('| Parameter | Type | Description |');
      sections.push('|-----------|------|-------------|');
      rows.forEach(r => {
        sections.push(`| \`${r.name}\` | \`${r.type}\` | ${r.description || '—'} |`);
      });
      sections.push('');
    }
  }

  // Generate methods documentation
  const methods = classDecl.getMethods().filter(m => {
    const scope = m.getScope();
    return scope === undefined || scope === 1; // public methods only
  });

  if (methods.length > 0) {
    sections.push('### Methods\n');
    
    for (const method of methods) {
      const methodName = method.getName();
      const params = method.getParameters();
      const returnType = cleanTypeText(method.getReturnType().getText(method));
      
      // Build method signature
      const paramStrs = params.map(p => {
        const pName = p.getName();
        const pType = cleanTypeText(p.getType().getText(p));
        const optional = p.hasQuestionToken() ? '?' : '';
        return `${pName}${optional}: ${pType}`;
      });
      
      const signature = `${methodName}(${paramStrs.join(', ')}): ${returnType}`;
      sections.push(`#### \`${signature}\`\n`);
      
      // Get method description
      const methodDocs = method.getJsDocs();
      if (methodDocs.length > 0) {
        const desc = methodDocs[0].getDescription().trim();
        if (desc) {
          sections.push(`${desc}\n`);
        }
        
        // Document parameters
        const paramTags = methodDocs[0].getTags().filter(t => t.getTagName() === 'param');
        if (paramTags.length > 0) {
          sections.push('**Parameters:**\n');
          paramTags.forEach(tag => {
            const pName = tag.getName?.();
            const pDesc = tag.getCommentText() || '';
            if (pName) {
              sections.push(`- \`${pName}\`: ${pDesc}`);
            }
          });
          sections.push('');
        }
        
        // Document return value
        const returnTag = methodDocs[0].getTags().find(t => t.getTagName() === 'returns' || t.getTagName() === 'return');
        if (returnTag) {
          const returnDesc = returnTag.getCommentText() || '';
          if (returnDesc) {
            sections.push(`**Returns:** ${returnDesc}\n`);
          }
        }
      }
    }
  }

  // Generate properties documentation
  const properties = classDecl.getProperties().filter(p => {
    const scope = p.getScope();
    return scope === undefined || scope === 1; // public properties only
  });

  if (properties.length > 0) {
    sections.push('### Properties\n');
    sections.push('| Property | Type | Description |');
    sections.push('|----------|------|-------------|');
    
    properties.forEach(prop => {
      const propName = prop.getName();
      const propType = cleanTypeText(prop.getType().getText(prop));
      let description = '';
      
      const propDocs = prop.getJsDocs();
      if (propDocs.length > 0) {
        description = propDocs[0].getDescription().replace(/\n+/g, ' ').trim();
      }
      
      sections.push(`| \`${propName}\` | \`${propType}\` | ${description || '—'} |`);
    });
  }

  return sections.length > 0 ? sections.join('\n') : null;
}

/**
 * Generate a markdown table for render props.
 */
function generateStateTable(renderPropsName, {showOptional = false, hideSelector = false} = {}, file) {
  // Attempt to resolve source file by stripping trailing "RenderProps" to get component name.
  let componentName = renderPropsName.replace(/RenderProps$/, '');
  let componentPath = resolveComponentPath(componentName, file);

  // If not found, fall back to searching all component roots.
  if (!componentPath) {
    let roots = COMPONENT_SRC_ROOTS;
    if (file?.path) {
      if (file.path.includes(path.join('pages', 'react-aria'))) {
        roots = [RAC_SRC_ROOT, S2_SRC_ROOT, INTL_SRC_ROOT];
      } else if (file.path.includes(path.join('pages', 'internationalized'))) {
        roots = [INTL_SRC_ROOT, S2_SRC_ROOT, RAC_SRC_ROOT];
      }
    }
    const matches = glob.sync(roots.map(r => path.posix.join(r, '**/*.{ts,tsx}')), {
      absolute: true,
      suppressErrors: true,
      deep: 5
    }).filter(p => fs.readFileSync(p, 'utf8').includes(`interface ${renderPropsName}`));
    componentPath = matches[0] || null;
  }

  if (!componentPath) {
    return null;
  }

  const source = project.addSourceFileAtPathIfExists(componentPath);
  if (!source) {
    return null;
  }

  const iface = source.getInterface(renderPropsName);
  if (!iface) {
    return null;
  }

  const propSymbols = iface.getType().getProperties();
  if (!propSymbols.length) {
    return null;
  }

  // Build rows
  const rows = propSymbols.map(sym => {
    const name = sym.getName();

    const decl = sym.getDeclarations()?.[0];
    let description = '';
    let selector = '';
    let optional = false;

    if (decl) {
      optional = decl.hasQuestionToken?.() || false;
      if (typeof decl.getJsDocs === 'function') {
        const docsArr = decl.getJsDocs();
        if (docsArr.length) {
          description = docsArr[0].getDescription().replace(/\n+/g, ' ').trim();
          const selTag = docsArr[0].getTags().find(t => t.getTagName() === 'selector');
          if (selTag) {
            selector = selTag.getCommentText();
          }
        }
      }
    }

    return {name, selector: selector || '—', description, optional};
  });

  // Filter optional props if showOptional is false
  const filteredRows = showOptional ? rows : rows.filter(r => !r.optional);

  if (!filteredRows.length) {
    return null;
  }

  const hasSelectorColumn = !hideSelector && filteredRows.some(r => r.selector && r.selector !== '—');

  const headerColumns = ['Render Prop'];
  if (hasSelectorColumn) {headerColumns.push('CSS Selector');}
  headerColumns.push('Description');

  const header = `| ${headerColumns.join(' | ')} |\n|${headerColumns.map(() => '------').join('|')}|`;

  const body = filteredRows
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(r => {
      const cols = [
        `\`${r.name}\``,
        ...(hasSelectorColumn ? [r.selector ? `\`${r.selector}\`` : '—'] : []),
        r.description || '—'
      ];
      return `| ${cols.join(' | ')} |`;
    })
    .join('\n');

  return `${header}\n${body}`;
}

/**
 * Generate a markdown table for the options interface of a function.
 * Looks at the first parameter type of the exported function with the given name.
 */
function generateFunctionOptionsTable(functionName, file) {
  // Resolve the source file containing the function declaration.
  let funcPath = resolveComponentPath(functionName, file);

  if (!funcPath) {
    // Fallback deep search similar to other helpers.
    let roots = COMPONENT_SRC_ROOTS;
    if (file?.path) {
      if (file.path.includes(path.join('pages', 'react-aria'))) {
        roots = [RAC_SRC_ROOT, S2_SRC_ROOT, INTL_SRC_ROOT];
      } else if (file.path.includes(path.join('pages', 'internationalized'))) {
        roots = [INTL_SRC_ROOT, S2_SRC_ROOT, RAC_SRC_ROOT];
      }
    }
    const patterns = roots.map(r => path.posix.join(r, '**/*.{ts,tsx,d.ts}'));
    patterns.push(path.posix.join(REPO_ROOT, 'packages/**/*.{ts,tsx,d.ts}'));

    const matches = glob.sync(patterns, {
      absolute: true,
      suppressErrors: true,
      deep: 5
    }).filter(p => {
      try {
        const txt = fs.readFileSync(p, 'utf8');
        return new RegExp(`(function|const)\\s+${functionName}\\b`).test(txt);
      } catch {
        return false;
      }
    });
    funcPath = matches[0] || null;
  }

  if (!funcPath) {
    return null;
  }

  const source = project.addSourceFileAtPathIfExists(funcPath);
  if (!source) {
    return null;
  }

  // Attempt to get an exported declaration for the function.
  const exportedDecl = source.getExportedDeclarations().get(functionName)?.[0];
  const possibleDecls = [exportedDecl, source.getFunction(functionName), source.getVariableDeclaration(functionName)];

  let funcDecl = possibleDecls.find(Boolean);
  if (!funcDecl) {
    return null;
  }

  // Retrieve call signature via type to support arrow functions.
  const type = funcDecl.getType?.() || funcDecl.getType?.();
  const callSig = type?.getCallSignatures?.()[0];
  if (!callSig) {
    return null;
  }

  const params = callSig.getParameters();
  if (!params.length) {
    return null;
  }

  // Inspect the first parameter's declared type.
  for (const paramSym of params) {
    const paramDecl = paramSym.getDeclarations()?.[0];
    if (!paramDecl) {continue;}

    // Try to extract a simple type reference name.
    const typeNode = paramDecl.getTypeNode?.();
    let typeName = null;
    if (typeNode) {
      // For TypeReference nodes, the text usually contains the identifier name.
      typeName = typeNode.getText().split(/[<\s|&]/)[0];
    } else {
      // Fallback to type text.
      typeName = paramDecl.getType?.().getText(paramDecl).split(/[<\s|&]/)[0];
    }

    if (typeName) {
      const table = generateInterfaceTable(typeName, file);
      if (table) {
        return table;
      }
    }
  }

  return null;
}

/**
 * Generate llms.txt file for a specific library.
 */
function generateLibraryLlmsTxt(lib, files) {
  if (!files.length) {
    return;
  }

  const titleMap = {
    's2': 'React Spectrum (S2) Documentation',
    'react-aria': 'React Aria Components Documentation',
    'internationalized': 'Internationalized Documentation'
  };
  
  const summaryMap = {
    's2': 'Plain-text markdown documentation for React Spectrum S2 components.',
    'react-aria': 'Plain-text markdown documentation for React Aria components.',
    'internationalized': 'Plain-text markdown documentation for internationalized date, time, and number utilities.'
  };

  const title = titleMap[lib] || `${lib} documentation`;
  const summary = summaryMap[lib] || '';

  let txt = `# ${title}\n\n`;
  if (summary) {
    txt += `> ${summary}\n\n`;
  }

  txt += '## Documentation\n';
  const sorted = files.sort((a, b) => a.heading.localeCompare(b.heading));
  for (const doc of sorted) {
    if (doc.description) {
      txt += `- [${doc.heading}](${lib}/${doc.path}): ${doc.description}\n`;
    } else {
      txt += `- [${doc.heading}](${lib}/${doc.path})\n`;
    }
  }

  const libDistDir = path.join(DIST_ROOT, lib);
  fs.mkdirSync(libDistDir, {recursive: true});
  const llmsPath = path.join(libDistDir, 'llms.txt');
  fs.writeFileSync(llmsPath, txt.trim() + '\n', 'utf8');
  console.log('Generated', path.relative(REPO_ROOT, llmsPath));
}

/**
 * Generate root llms.txt file that includes all documentation.
 */
function generateRootLlmsTxt(docsByLibrary) {
  let txt = '# React Spectrum Libraries\n\n';
  txt += '> Complete documentation for React Spectrum libraries including React Spectrum (S2), React Aria, and Internationalized.\n\n';

  // Add root-level documentation
  if (docsByLibrary['root'].length > 0) {
    txt += '## Getting Started\n';
    const sorted = docsByLibrary['root'].sort((a, b) => a.heading.localeCompare(b.heading));
    for (const doc of sorted) {
      if (doc.description) {
        txt += `- [${doc.heading}](${doc.path}): ${doc.description}\n`;
      } else {
        txt += `- [${doc.heading}](${doc.path})\n`;
      }
    }
    txt += '\n';
  }

  // Add S2 documentation
  if (docsByLibrary['s2'].length > 0) {
    txt += '## React Spectrum (S2)\n';
    const sorted = docsByLibrary['s2'].sort((a, b) => a.heading.localeCompare(b.heading));
    for (const doc of sorted) {
      if (doc.description) {
        txt += `- [${doc.heading}](s2/${doc.path}): ${doc.description}\n`;
      } else {
        txt += `- [${doc.heading}](s2/${doc.path})\n`;
      }
    }
    txt += '\n';
  }

  // Add React Aria documentation
  if (docsByLibrary['react-aria'].length > 0) {
    txt += '## React Aria Components\n';
    const sorted = docsByLibrary['react-aria'].sort((a, b) => a.heading.localeCompare(b.heading));
    for (const doc of sorted) {
      if (doc.description) {
        txt += `- [${doc.heading}](react-aria/${doc.path}): ${doc.description}\n`;
      } else {
        txt += `- [${doc.heading}](react-aria/${doc.path})\n`;
      }
    }
    txt += '\n';
  }

  // Add Internationalized documentation
  if (docsByLibrary['internationalized'].length > 0) {
    txt += '## Internationalized\n';
    const sorted = docsByLibrary['internationalized'].sort((a, b) => a.heading.localeCompare(b.heading));
    for (const doc of sorted) {
      if (doc.description) {
        txt += `- [${doc.heading}](internationalized/${doc.path}): ${doc.description}\n`;
      } else {
        txt += `- [${doc.heading}](internationalized/${doc.path})\n`;
      }
    }
    txt += '\n';
  }

  const llmsPath = path.join(DIST_ROOT, 'llms.txt');
  fs.writeFileSync(llmsPath, txt.trim() + '\n', 'utf8');
  console.log('Generated', path.relative(REPO_ROOT, llmsPath));
}

/**
 * Scans the MDX pages in packages/dev/s2-docs/pages and produces a text-based markdown variant of each file.
 * React-specific JSX elements such as <PageDescription> and <PropTable> are replaced with plain markdown equivalents so
 * that the resulting *.md files can be consumed by LLMs.
 */
async function main() {
  const mdxFiles = await glob('**/*.mdx', {
    cwd: S2_DOCS_PAGES_ROOT,
    absolute: true
  });

  // Collect generated markdown filenames and headings for each library so we can build llms.txt files.
  const docsByLibrary = {
    's2': [],
    'react-aria': [],
    'internationalized': [],
    'root': []
  };

  for (const filePath of mdxFiles) {
    const rawContent = fs.readFileSync(filePath, 'utf8');
    const mdContent = rawContent.replace(LICENSE_COMMENT_REGEX, '');
    const processor = unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(remarkRemoveImportsExports)
      .use(remarkDocsComponentsToMarkdown)
      .use(remarkStringify, {
        fences: true,
        bullets: '-',
        listItemIndent: 'one'
      });

    const markdown = String(await processor.process({value: mdContent, path: filePath}));

    const relativePath = path.relative(S2_DOCS_PAGES_ROOT, filePath);
    const outPath = path.join(DIST_ROOT, relativePath).replace(/\.mdx$/, '.md');
    fs.mkdirSync(path.dirname(outPath), {recursive: true});
    fs.writeFileSync(outPath, markdown, 'utf8');
    console.log('Generated', path.relative(REPO_ROOT, outPath));

    // Extract the main heading from the markdown
    let heading = null;
    const headingMatch = markdown.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      heading = headingMatch[1].trim();
    }

    // Extract the description (first paragraph after heading)
    let description = null;
    const descriptionMatch = markdown.match(/^#\s+.+$\n\n(.+?)(?:\n\n|$)/m);
    if (descriptionMatch) {
      description = descriptionMatch[1].trim();
    }

    // Track markdown files by library (first path segment e.g. "s2/Button.mdx" -> "s2").
    const relativePathParts = relativePath.split(path.sep);
    const relativeOutPath = path.relative(DIST_ROOT, outPath);
    let libKey;
    let filePathForIndex;
    
    if (relativePathParts.length === 1) {
      // Root-level file like index.mdx
      libKey = 'root';
      filePathForIndex = path.basename(outPath);
    } else {
      libKey = relativePathParts[0];
      // For nested files like internationalized/date/index.md, use the .md path
      filePathForIndex = relativeOutPath.replace(new RegExp(`^${libKey}[\\\\/]`), '');
    }
    
    if (docsByLibrary[libKey]) {
      docsByLibrary[libKey].push({
        path: filePathForIndex,
        heading: heading || filePathForIndex.replace(/\.md$/, ''),
        description: description || null
      });
    }
  }

  // Generate library-specific llms.txt files
  generateLibraryLlmsTxt('s2', docsByLibrary['s2']);
  generateLibraryLlmsTxt('react-aria', docsByLibrary['react-aria']);
  generateLibraryLlmsTxt('internationalized', docsByLibrary['internationalized']);

  // Generate root llms.txt that includes all documentation
  generateRootLlmsTxt(docsByLibrary);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 
