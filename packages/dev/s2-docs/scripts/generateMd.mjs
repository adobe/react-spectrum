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
  const componentPath = resolveComponentPath(componentName, file);
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
      const typeStr = r.type.includes('|') || r.type.includes('&') ? `<code>${r.type}</code>` : `\`${r.type}\``;
      return `| ${r.name} | ${typeStr} | ${r.defVal || '—'} | ${r.description} |`;
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
    visit(tree, ['mdxJsxFlowElement', 'mdxJsxTextElement'], (node, index, parent) => {
      const name = node.name;
      if (name === 'PageDescription') {
        // Assume first child is expression "docs.exports.Component.description".
        const exprNode = node.children?.find((c) => c.type === 'mdxFlowExpression' || c.type === 'mdxTextExpression');
        if (exprNode) {
          const m = exprNode.value.match(/docs\.exports\.([\w$]+)\.description/);
          if (m) {
            const desc = getComponentDescription(m[1], file);
            if (desc) {
              // Replace with normal paragraph node.
              // eslint-disable-next-line max-depth
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
      // Remove other custom components like VisualExample, ExampleSwitcher etc. Can handle later.
      if (['VisualExample', 'ExampleSwitcher', 'Anatomy'].includes(name)) {
        parent.children.splice(index, 1);
        return index;
      }
      if (name === 'TypeLink') {
        const typeAttr = node.attributes?.find((a) => a.name === 'type');
        if (typeAttr && typeAttr.value?.type === 'mdxJsxAttributeValueExpression') {
          const m = typeAttr.value.value.match(/docs\.exports\.([\w$]+)/);
          if (m) {
            parent.children[index] = {type: 'inlineCode', value: m[1]};
            return;
          }
        }
        parent.children.splice(index, 1);
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
              children: [{type: 'text', value: `Default className: \`${defaultClassName}\``}]
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

/* *
 * Scans the MDX pages in packages/dev/s2-docs/pages and produces a text-based markdown variant of each file.
 * React-specific JSX elements such as <PageDescription> and <PropTable> are replaced with plain markdown equivalents so
 * that the resulting *.md files can be consumed by LLMs.
 */
async function main() {
  const mdxFiles = await getMdxFiles(S2_DOCS_PAGES_ROOT);
  for (const filePath of mdxFiles) {
    const mdContent = fs.readFileSync(filePath, 'utf8');
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
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 
