import fs from 'fs';
import {globSync} from 'glob';
import * as recast from 'recast';
import {parse} from '@babel/parser';
import path from 'path';
import postcss from 'postcss';

const publicUrl = process.env.REGISTRY_URL || 'http://localhost:8081';

fs.rmSync('starters/tailwind/registry', {recursive: true, force: true});
fs.mkdirSync('starters/tailwind/registry');

for (let file of globSync('starters/tailwind/src/*.{ts,tsx}')) {
  let name = path.basename(file, path.extname(file));
  let {dependencies, registryDependencies, content} = analyzeDeps(file, 'tailwind');
  let type = name === 'utils' ? 'registry:lib' : 'registry:ui';
  let item = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name,
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

  fs.writeFileSync('starters/tailwind/registry/' + name + '.json', JSON.stringify(item, null, 2) + '\n');
}

fs.rmSync('starters/docs/registry', {recursive: true, force: true});
fs.mkdirSync('starters/docs/registry');

for (let file of globSync('starters/docs/src/*.{ts,tsx}')) {
  let name = path.basename(file, path.extname(file));
  let {dependencies, registryDependencies, content} = analyzeDeps(file, 'vanilla');
  let type = name === 'utils' ? 'registry:lib' : 'registry:ui';
  let item = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name,
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

  fs.writeFileSync('starters/docs/registry/' + name + '.json', JSON.stringify(item, null, 2) + '\n');
}

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
          registryDependencies.add(publicUrl + '/' + type + '/' + source.slice(2) + '.json');
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
