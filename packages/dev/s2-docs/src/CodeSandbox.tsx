import LZString from 'lz-string';

export function createCodeSandbox(
  files: {[name: string]: string},
  deps: {[name: string]: string},
  type: 'vanilla' | 'tailwind' | 's2' = 'vanilla',
  entry: string = 'Example'
) {
  let form = document.createElement('form');
  form.hidden = true;
  form.method = 'POST';
  form.action = 'https://codesandbox.io/api/v1/sandboxes/define';
  form.target = '_blank';

  let input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'query';
  input.value = 'file=src/Example.tsx';
  form.appendChild(input);

  input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'environment';
  input.value = 'server';
  form.appendChild(input);

  input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'parameters';

  input.value = LZString.compressToBase64(JSON.stringify({
    files: getCodeSandboxFiles(files, deps, type, entry)
  }));
  form.appendChild(input);

  document.body.appendChild(form);
  form.submit();
  form.remove();
}

const devDependencies = {
  vanilla: {
    '@types/react': '^19',
    '@types/react-dom': '^19',
    parcel: '^2',
    typescript: '^5'
  },
  tailwind: {
    '@types/react': '^19',
    '@types/react-dom': '^19',
    parcel: '^2',
    typescript: '^5',
    'tailwindcss': '^4',
    '@tailwindcss/postcss': '^4',
    postcss: '^8',
    'tailwindcss-react-aria-components': '^2',
    'tailwindcss-animate': '^1'
  },
  s2: {
    '@types/react': '^19',
    '@types/react-dom': '^19',
    parcel: '^2',
    typescript: '^5'
  }
};

export function getCodeSandboxFiles(
  files: {[name: string]: string},
  deps: {[name: string]: string},
  type: 'vanilla' | 'tailwind' | 's2' = 'vanilla',
  entry: string = 'Example'
) {
  let entryName = entry.split('/').pop()!.split('.')[0];
  return {
    '.codesandbox/tasks.json': {
      content: JSON.stringify({
        setupTasks: [
          {
            name: 'Installing Dependencies',
            command: 'pnpm install'
          }
        ],
        tasks: {
          start: {
            name: 'start',
            command: 'pnpm start',
            runAtStart: true,
            preview: {
              port: 5173
            }
          },
          build: {
            name: 'build',
            command: 'pnpm build',
            runAtStart: false
          }
        }
      }, null, 2) + '\n'
    },
    '.devcontainer/devcontainer.json': {
      content: JSON.stringify({
        'name': 'Devcontainer',
        'image': 'ghcr.io/codesandbox/devcontainers/typescript-node:latest'
      }, null, 2) + '\n'
    },
    'package.json': {
      content: JSON.stringify({
        name: type === 's2' ? 's2-starter' : 'react-aria-starter',
        private: true,
        version: '0.0.0',
        source: 'src/index.html',
        scripts: {
          start: 'parcel',
          build: 'parcel build'
        },
        dependencies: {
          react: '^19',
          'react-dom': '^19',
          ...deps
        },
        devDependencies: devDependencies[type]
      }, null, 2) + '\n'
    },
    '.postcssrc': type === 'tailwind' ? {
      content: JSON.stringify({
        plugins: {
          '@tailwindcss/postcss': {}
        }
      }, null, 2) + '\n'
    } : undefined,
    'src/index.html': {
      content: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Test</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="index.tsx"></script>${type === 'tailwind' ? '\n  <link href="index.css" rel="stylesheet">' : ''}
</body>
</html>
`
    },
    'src/index.tsx': {
      content: `import {createRoot} from 'react-dom/client';
import ${entryName} from './${entryName}';${type === 's2' ? "\nimport '@react-spectrum/s2/page.css';" : ''}

createRoot(document.getElementById('root')!).render(<${entryName} />);
`
    },
    'tsconfig.json': {
      content: JSON.stringify({
        compilerOptions: {
          'target': 'ES2022',
          'lib': ['ES2022', 'DOM', 'DOM.Iterable'],
          'module': 'ESNext',
          strict: true,
          'moduleResolution': 'bundler',
          'noEmit': true,
          'jsx': 'react-jsx'
        },
        'include': ['src']
      }, null, 2) + '\n'
    },
    ...Object.fromEntries(Object.entries(files).map(([name, content]) => ['src/' + name, {content}]))
  };
}
