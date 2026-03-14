import fs from 'fs';
import {getBaseUrl} from '../packages/dev/s2-docs/src/pageUtils.ts';
import {globSync} from 'glob';
import {parse} from '@babel/parser';
import path from 'path';
import postcss from 'postcss';
import * as recast from 'recast';

const publicUrl = getBaseUrl('react-aria') + '/registry';
const distDir = `dist/s2-docs/react-aria/${process.env.PUBLIC_URL || ''}/registry`;

fs.rmSync(distDir, {recursive: true, force: true});
fs.mkdirSync(distDir, {recursive: true});

let items = [];
let tailwind = {
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  name: 'tailwind',
  type: 'registry:style',
  registryDependencies: []
};
items.push(tailwind);

for (let file of globSync('starters/tailwind/src/*.{ts,tsx}').sort()) {
  let name = path.basename(file, path.extname(file));
  let {dependencies, registryDependencies, content} = analyzeDeps(file, 'tailwind');
  let type = name === 'utils' ? 'registry:lib' : 'registry:ui';
  let item = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: `tailwind-${name.toLowerCase()}`,
    type,
    title: name,
    dependencies: [...dependencies, 'tailwindcss-react-aria-components', 'tailwindcss-animate'],
    registryDependencies: [...registryDependencies],
    files: [
      {
        path: name === 'utils' ? 'lib/react-aria-utils.ts' : 'components/ui/' + path.basename(file),
        type,
        content
      }
    ],
    css: {
      '@plugin "tailwindcss-react-aria-components"': {},
      '@plugin "tailwindcss-animate"': {}
    }
  };

  fs.writeFileSync(path.join(distDir, `tailwind-${name.toLowerCase()}.json`), JSON.stringify(item, null, 2) + '\n');

  for (let file of item.files) {
    delete file.content;
  }

  items.push(item);
  tailwind.registryDependencies.push(`${publicUrl}/tailwind-${name.toLowerCase()}.json`);
}

fs.writeFileSync(path.join(distDir, 'tailwind.json'), JSON.stringify(tailwind, null, 2) + '\n');

let css = {
  $schema: 'https://ui.shadcn.com/schema/registry-item.json',
  name: 'css',
  type: 'registry:style',
  registryDependencies: []
};
items.push(css);

for (let file of globSync('starters/docs/src/*.{ts,tsx}').sort()) {
  let name = path.basename(file, path.extname(file));
  let {dependencies, registryDependencies, content} = analyzeDeps(file, 'css');
  let type = name === 'utils' ? 'registry:lib' : 'registry:ui';
  let item = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: `css-${name.toLowerCase()}`,
    type,
    title: name,
    dependencies: [...dependencies],
    registryDependencies: [...registryDependencies],
    files: [
      {
        path: name === 'utils' ? 'lib/react-aria-utils.ts' : 'components/ui/' + path.basename(file),
        type,
        content
      }
    ]
  };

  let cssFile = file.slice(0, -path.extname(file).length) + '.css';
  if (fs.existsSync(cssFile)) {
    item.files.push(...analyzeCss(cssFile));
  }

  fs.writeFileSync(path.join(distDir, `css-${name.toLowerCase()}.json`), JSON.stringify(item, null, 2) + '\n');

  for (let file of item.files) {
    delete file.content;
  }

  items.push(item);
  css.registryDependencies.push(`${publicUrl}/css-${name.toLowerCase()}.json`);
}

fs.writeFileSync(path.join(distDir, 'css.json'), JSON.stringify(css, null, 2) + '\n');
fs.writeFileSync(path.join(distDir, 'registry.json'), JSON.stringify({
  '$schema': 'https://ui.shadcn.com/schema/registry.json',
  name: 'react-aria',
  homepage: 'https://react-aria.adobe.com',
  items
}, null, 2) + '\n');

function analyzeDeps(file, type) {
  let content = fs.readFileSync(file, 'utf8');
  let ast = recast.parse(content, {
    parser: {
      parse() {
        return parse(content, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx', 'importAttributes'],
          sourceFilename: file,
          tokens: true,
          errorRecovery: true
        });
      }
    }
  });

  let dependencies = new Set();
  let registryDependencies = new Set();
  for (let node of ast.program.body) {
    if (node.type === 'ImportDeclaration') {
      let source = node.source.value;
      if (source.startsWith('./')) {
        if (!source.endsWith('.css')) {
          registryDependencies.add(publicUrl + '/' + type + '-' + source.slice(2).toLowerCase() + '.json');
          node.source.value = source === './utils' ? '@/registry/react-aria/lib/react-aria-utils' : '@/registry/react-aria/ui/' + source.slice(2);
        }
      } else {
        dependencies.add(source);
      }
    }
  }

  content = recast.print(ast, {objectCurlySpacing: false, quote: 'single'}).code;
  return {dependencies, registryDependencies, content};
}

function analyzeCss(file, seen = new Set()) {
  if (seen.has(file)) {
    return [];
  }
  seen.add(file);

  let content = fs.readFileSync(file, 'utf8');
  let ast = postcss.parse(content);

  let imports = new Set();
  ast.walkAtRules('import', rule => {
    imports.add(rule.params.slice(1, -1));
  });

  return [
    {
      path: 'components/ui/' + path.basename(file),
      type: 'registry:component',
      content
    },
    ...[...imports].flatMap(specifier => {
      let resolved = path.resolve(path.dirname(file), specifier);
      return analyzeCss(resolved, seen);
    })
  ];
}
