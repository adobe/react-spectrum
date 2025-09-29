#!/usr/bin/env node

import fs from 'fs';
import glob from 'fast-glob';
import path from 'path';
import {Project} from 'ts-morph';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import {unified} from 'unified';
import {visit} from 'unist-util-visit';

const REPO_ROOT = '../../../';
const S2_SRC_ROOT = path.join(REPO_ROOT, 'packages/@react-spectrum/s2/src');
const RAC_SRC_ROOT = path.join(REPO_ROOT, 'packages/react-aria-components/src');
const COMPONENT_SRC_ROOTS = [S2_SRC_ROOT, RAC_SRC_ROOT];
const S2_DOCS_PAGES_ROOT = path.join(REPO_ROOT, 'packages/dev/s2-docs/pages');
const DIST_ROOT = path.join(REPO_ROOT, 'packages/dev/s2-docs/dist');
const LICENSE_COMMENT_REGEX = /^\s*\{\/\*[\s\S]*?Copyright\s+20\d{2}\s+Adobe[\s\S]*?\*\/\}\s*/;
const S2_ICON_ROOT = path.join(REPO_ROOT, 'packages/@react-spectrum/s2/s2wf-icons');
const S2_ILLUSTRATION_ROOT = path.join(REPO_ROOT, 'packages/@react-spectrum/s2/spectrum-illustrations');

let iconNamesCache = null;
let illustrationNamesCache = null;

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

// Pre-load a ts-morph project so we can query type information.
const project = new Project({
  tsConfigFilePath: path.join(REPO_ROOT, 'tsconfig.json'),
  skipAddingFilesFromTsConfig: true
});

/**
 * Resolve the absolute path to a component source file given its name.
 */
function resolveComponentPath(componentName, file) {
  let roots = COMPONENT_SRC_ROOTS;
  if (file?.path && file.path.includes(path.join('pages', 'react-aria'))) {
    roots = [RAC_SRC_ROOT, S2_SRC_ROOT];
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
    deep: 3
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

  for (let node of possibleNodes.filter(Boolean)) {
    let current = node;
    while (current) {
      let docs = typeof current.getJsDocs === 'function' ? current.getJsDocs() : [];
      if (docs?.length) {
        const desc = docs[0].getDescription().trim();
        if (desc) {
          const regex = new RegExp(`\\b${componentName}\\b`, 'i');
          // eslint-disable-next-line max-depth
          if (regex.test(desc)) {
            return desc;
          }
          var fallbackDesc = fallbackDesc || desc;
        }
      }
      current = current.getParent?.();
    }
  }

  if (typeof fallbackDesc === 'string') {
    return fallbackDesc;
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
    const roots = (file?.path && file.path.includes(path.join('pages', 'react-aria'))) ? [RAC_SRC_ROOT, S2_SRC_ROOT] : COMPONENT_SRC_ROOTS;
    const patterns = roots.map(r => path.posix.join(r, '**/*.{ts,tsx,d.ts}'));
    // Also scan other packages if not found in component roots.
    patterns.push(path.posix.join(REPO_ROOT, 'packages/**/*.{ts,tsx,d.ts}'));

    const matches = glob.sync(patterns, {
      absolute: true,
      suppressErrors: true,
      deep: 4
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
    const roots = (file?.path && file.path.includes(path.join('pages', 'react-aria'))) ? [RAC_SRC_ROOT, S2_SRC_ROOT] : COMPONENT_SRC_ROOTS;
    const patterns = roots.map(r => path.posix.join(r, '**/*.{ts,tsx,d.ts}'));
    // Also scan other packages if not found in component roots.
    patterns.push(path.posix.join(REPO_ROOT, 'packages/**/*.{ts,tsx,d.ts}'));

    const matches = glob.sync(patterns, {
      absolute: true,
      suppressErrors: true,
      deep: 4
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

  const rows = propSymbols.map((sym) => {
    const name = sym.getName();
    const type = cleanTypeText(sym.getTypeAtLocation(ifaceDecl).getText(ifaceDecl));
    const decl = sym.getDeclarations()?.[0];
    let description = '';
    if (decl && typeof decl.getJsDocs === 'function') {
      const docsArr = decl.getJsDocs();
      if (docsArr.length) {
        description = docsArr[0].getDescription().replace(/\n+/g, ' ').trim();
      }
    }

    return {name, type, description};
  });

  if (!rows.length) {return null;}

  const header = '| Name | Type | Description |\n|------|------|-------------|';
  const body = rows
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((r) => {
      const typeStr = `\`${r.type}\``;
      return `| \`${r.name}\` | ${typeStr} | ${r.description || '—'} |`;
    })
    .join('\n');

  return `${header}\n${body}`;
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
      if (name === 'IconCards') {
        const iconList = getIconNames();
        const header = ['| Icon |', '|------|'];
        const rows = iconList.map(iconName => `| ${iconName} |`);
        const tableMarkdown = iconList.length ? `${header.join('\n')}\n${rows.join('\n')}` : '> Icon list unavailable in this build.';
        const iconCardsNode = unified().use(remarkParse).parse(tableMarkdown);
        parent.children.splice(index, 1, ...iconCardsNode.children);
        return index;
      }
      if (name === 'IllustrationCards') {
        const illustrationList = getIllustrationNames();
        const header = ['| Illustration |', '|--------------|'];
        const rows = illustrationList.map(illustrationName => `| ${illustrationName} |`);
        const tableMarkdown = illustrationList.length ? `${header.join('\n')}\n${rows.join('\n')}` : '> Illustration list unavailable in this build.';
        const illustrationCardsNode = unified().use(remarkParse).parse(tableMarkdown);
        parent.children.splice(index, 1, ...illustrationCardsNode.children);
        return index;
      }
      if (name === 'IconColors') {
        const colorsAttr = node.attributes?.find(a => a.name === 'colors');
        let colorList = [];
        
        if (colorsAttr && colorsAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          // Extract string literals from array expression: ['white', 'black', ...] 
          const expr = colorsAttr.value.value;
          const matches = expr.match(/['"]([^'"]+)['"]/g);
          if (matches) {
            colorList = matches.map(m => m.slice(1, -1)); // Remove quotes
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
      if (name === 'IconSizes') {
        const sizesAttr = node.attributes?.find(a => a.name === 'sizes');
        let sizeList = [];
        
        if (sizesAttr && sizesAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          // Extract objects from array expression: [{size: 'XS', pixels: '14px'}, ...]
          const expr = sizesAttr.value.value;
          // Match {size: 'X', pixels: 'Ypx'} patterns
          const objectMatches = expr.match(/\{[^}]+\}/g);
          if (objectMatches) {
            sizeList = objectMatches.map(obj => {
              const sizeMatch = obj.match(/size:\s*['"]([^'"]+)['"]/);
              const pixelsMatch = obj.match(/pixels:\s*['"]([^'"]+)['"]/);
              return {
                size: sizeMatch ? sizeMatch[1] : '',
                pixels: pixelsMatch ? pixelsMatch[1] : ''
              };
            }).filter(item => item.size && item.pixels);
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
      
      if (name === 'ExampleSwitcher') {
        // Helper to evaluate a simple JS expression (arrays/objects, literals).
        const evalExpression = (expr) => {
          try {
            return Function(`"use strict"; return (${expr});`)();
          } catch {
            return null;
          }
        };

        const examplesAttr = node.attributes?.find(a => a.name === 'examples');
        let exampleTitles = [];
        if (examplesAttr && examplesAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          exampleTitles = evalExpression(examplesAttr.value.value) || [];
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
              fileList = evalExpression(filesAttr.value.value) || [];
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

      // Handle standalone VisualExample, generate a minimal snippet
      if (name === 'VisualExample') {
        const evalExpression = (expr) => {
          try {
            return Function(`"use strict"; return (${expr});`)();
          } catch {
            return null;
          }
        };

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
          initialProps = evalExpression(initialPropsAttr.value.value) || {};
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

      // Remove unsupported components.
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
    });

    // Clean up code block language specifiers. E.g. "tsx render" -> "tsx"
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
 * Recursively find all MDX files in a directory.
 */
async function getMdxFiles(dir) {
  let entries = await fs.promises.readdir(dir, {withFileTypes: true});
  let files = [];
  for (let entry of entries) {
    let fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await getMdxFiles(fullPath));
    } else if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function cleanTypeText(t) {
  // Remove import statements from type strings.
  let cleaned = t.replace(/import\(["'][^)]*["']\)\./g, '');
  // Remove duplicate type parameters.
  cleaned = cleaned.replace(/<\s*([A-Za-z0-9_$.]+)\s*,\s*\1\s*>/g, '<$1>');
  return cleaned;
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
    if (file?.path && file.path.includes(path.join('pages', 'react-aria'))) {
      roots = [RAC_SRC_ROOT, S2_SRC_ROOT];
    }
    const matches = glob.sync(roots.map(r => path.posix.join(r, '**/*.{ts,tsx}')), {
      absolute: true,
      suppressErrors: true,
      deep: 4
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
    const roots = (file?.path && file.path.includes(path.join('pages', 'react-aria'))) ? [RAC_SRC_ROOT, S2_SRC_ROOT] : COMPONENT_SRC_ROOTS;
    const patterns = roots.map(r => path.posix.join(r, '**/*.{ts,tsx,d.ts}'));
    patterns.push(path.posix.join(REPO_ROOT, 'packages/**/*.{ts,tsx,d.ts}'));

    const matches = glob.sync(patterns, {
      absolute: true,
      suppressErrors: true,
      deep: 4
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

/* *
 * Scans the MDX pages in packages/dev/s2-docs/pages and produces a text-based markdown variant of each file.
 * React-specific JSX elements such as <PageDescription> and <PropTable> are replaced with plain markdown equivalents so
 * that the resulting *.md files can be consumed by LLMs.
 */
async function main() {
  const mdxFiles = await getMdxFiles(S2_DOCS_PAGES_ROOT);

  // Collect generated markdown filenames for each library so we can build llms.txt files.
  const docsByLibrary = {
    's2': new Set(),
    'react-aria': new Set()
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

    // Track markdown files by library (first path segment e.g. "s2/Button.mdx" -> "s2").
    const relativePathParts = relativePath.split(path.sep);
    const libKey = relativePathParts[0];
    if (docsByLibrary[libKey]) {
      docsByLibrary[libKey].add(path.basename(outPath));
    }
  }

  // Generate llms.txt for each library.
  const makeLlmsTxt = (lib, files) => {
    if (!files.size) {return;}

    const titleMap = {
      's2': 'React Spectrum S2 Documentation',
      'react-aria': 'React Aria Components Documentation'
    };
    
    const summaryMap = {
      's2': 'Plain-text markdown documentation for React Spectrum S2 components.',
      'react-aria': 'Plain-text markdown documentation for React Aria components.'
    };

    const title = titleMap[lib] || `${lib} documentation`;
    const summary = summaryMap[lib] || '';

    let txt = `# ${title}\n\n`;
    if (summary) {
      txt += `> ${summary}\n\n`;
    }

    txt += '## Documentation\n';
    const sorted = Array.from(files).sort((a, b) => a.localeCompare(b));
    for (const file of sorted) {
      const display = file.replace(/\.md$/, '');
      txt += `- [${display}](${lib}/${file})\n`;
    }

    const libDistDir = path.join(DIST_ROOT, lib);
    fs.mkdirSync(libDistDir, {recursive: true});
    const llmsPath = path.join(libDistDir, 'llms.txt');
    fs.writeFileSync(llmsPath, txt.trim() + '\n', 'utf8');
    console.log('Generated', path.relative(REPO_ROOT, llmsPath));
  };

  makeLlmsTxt('s2', docsByLibrary['s2']);
  makeLlmsTxt('react-aria', docsByLibrary['react-aria']);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 
