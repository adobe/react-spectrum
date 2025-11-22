export function createStackBlitz(
  files: {[name: string]: string},
  deps: {[name: string]: string},
  type: 'vanilla' | 'tailwind' | 's2' = 'vanilla',
  entry: string = 'Example'
) {
  let form = document.createElement('form');
  form.hidden = true;
  form.method = 'POST';
  form.action = 'https://stackblitz.com/run?file=src/Example.tsx';
  form.target = '_blank';

  let input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'project[template]';
  input.value = 'node';
  form.appendChild(input);

  input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'project[title]';
  input.value = 'Project';
  form.appendChild(input);

  input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'project[description]';
  input.value = 'description';
  form.appendChild(input);

  let generatedFiles = getFiles(files, deps, type, entry);
  for (let name in generatedFiles) {
    input = document.createElement('input');
    input.type = 'hidden';
    input.name = `project[files][${name}]`;
    input.value = generatedFiles[name];
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  form.remove();
}

function getFiles(
  files: {[name: string]: string},
  deps: {[name: string]: string},
  type: 'vanilla' | 'tailwind' | 's2' = 'vanilla',
  entry: string = 'Example'
) {
  let entryName = entry.split('/').pop()!.split('.')[0];
  return {
    'package.json': JSON.stringify({
      name: 'react-aria-starter',
      private: true,
      version: '0.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        react: '^19',
        'react-dom': '^19',
        ...deps
      },
      devDependencies: {
        '@types/react': '^19',
        '@types/react-dom': '^19',
        vite: '^6',
        '@vitejs/plugin-react': '^4',
        ...(type === 'tailwind' ? {
          'tailwindcss': '^4',
          '@tailwindcss/vite': '^4',
          'tailwindcss-react-aria-components': '^2',
          'tailwindcss-animate': '^1'
        } : {})
      }
    }, null, 2) + '\n',
    'vite.config.ts': `import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';${type === 'tailwind' ? "\nimport tailwindcss from '@tailwindcss/vite';" : ''}

export default defineConfig({
  plugins: [react()${type === 'tailwind' ? ', tailwindcss()' : ''}],
});
`,
    'index.html': `<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Test</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/index.tsx"></script>${type === 'tailwind' ? '\n  <link href="/src/index.css" rel="stylesheet">' : ''}
</body>
</html>
`,
    'src/index.tsx': `import {createRoot} from 'react-dom/client';
import ${entryName} from './${entryName}';

createRoot(document.getElementById('root')!).render(<${entryName} />);
`,
    'tsconfig.json': JSON.stringify({
      compilerOptions: {
        'target': 'ES2022',
        'useDefineForClassFields': true,
        'lib': ['ES2022', 'DOM', 'DOM.Iterable'],
        'module': 'ESNext',
        'skipLibCheck': true,

        /* Bundler mode */
        'moduleResolution': 'bundler',
        'allowImportingTsExtensions': true,
        'moduleDetection': 'force',
        'noEmit': true,
        'jsx': 'react-jsx',

        /* Linting */
        'strict': true,
        'noUnusedLocals': true,
        'noUnusedParameters': true,
        'erasableSyntaxOnly': true,
        'noFallthroughCasesInSwitch': true,
        'noUncheckedSideEffectImports': true
      },
      'include': ['src']
    }, null, 2) + '\n',
    ...Object.fromEntries(Object.entries(files).map(([name, contents]) => ['src/' + name, contents]))
  };
}
