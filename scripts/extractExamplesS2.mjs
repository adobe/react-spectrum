/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import fs from 'fs/promises';
import json5 from 'json5';
import path from 'path';
import {transformAsync} from '@parcel/rust/lib/index.js';

let distDir = 'dist/docs-examples';

async function extractExamples() {
  try {
    await fs.rm(distDir, {recursive: true});
  } catch {}
  await fs.mkdir(distDir, {recursive: true});

  let pages = [];
  for await (let page of fs.glob('packages/dev/s2-docs/pages/**/*.mdx')) {
    pages.push(page);
  }

  await Promise.all(pages.map(async page => {
    let code = await fs.readFile(page, 'utf8');

    code = code.replace(/(<ExampleSwitcher type="component" examples={(\[.*?\])}>)((?:.|\n)*?)<\/ExampleSwitcher>/g, (m, start, examples, inner) => {
      if (inner.includes('COMPONENT')) {
        let components = json5.parse(examples);
        inner = components.map(component => inner.replace(/COMPONENT/g, component)).join('\n\n');
        return start + inner + '</ExampleSwitcher>';
      }

      return m;
    });

    // Replace /* PROPS */ placeholders with initialProps values from code fence metadata
    // Match initialProps={{ ... }} handling one level of nested braces
    // Skip blocks with propsObject attribute since those props don't go directly on the component
    code = code.replace(/```tsx([^\n]*initialProps=\{\{((?:[^{}]|\{[^{}]*\})*)\}\}[^\n]*)\n([\s\S]*?)```/g, (m, meta, propsStr, inner) => {
      // Skip if props go to a different object (e.g. propsObject="layoutOptions")
      if (meta.includes('propsObject=')) {
        return m;
      }
      if (inner.includes('/* PROPS */')) {
        // Parse the initialProps using json5, e.g. "isLoading: true" -> {isLoading: true}
        let parsed = json5.parse(`{${propsStr}}`);
        // Convert to JSX props string, but skip props that are already in the code
        let props = Object.entries(parsed).map(([key, value]) => {
          // Skip if this prop is already present in the inner code (to avoid duplicates)
          let propRegex = new RegExp(`\\b${key.replace('-', '\\-')}\\s*=`);
          if (propRegex.test(inner)) {
            return '';
          }
          if (typeof value === 'string') {
            return ` ${key}="${value}"`;
          }
          return ` ${key}={${JSON.stringify(value)}}`;
        }).join('');
        inner = inner.replace(/\/\* PROPS \*\//g, props);
        return '```tsx' + meta + '\n' + inner + '```';
      }
      return m;
    });

    let res = await transformAsync({
      filename: page,
      code: Buffer.from(code),
      module_id: '123',
      project_root: process.cwd(),
      inline_fs: false,
      env: {},
      type: 'mdx',
      context: 'react-server',
      automatic_jsx_runtime: true,
      decorators: false,
      use_define_for_class_fields: false,
      is_development: false,
      react_refresh: false,
      source_maps: false,
      scope_hoist: false,
      source_type: 'Module',
      supports_module_workers: true,
      is_library: false,
      is_esm_output: false,
      trace_bailouts: false,
      is_swc_helpers: false,
      standalone: false,
      inline_constants: false
    });

    for (let asset of res.mdx_assets) {
      if (asset.lang === 'tsx' || asset.lang === 'ts') {
        let relative = path.relative(path.join(process.cwd(), 'packages/dev/s2-docs/pages'), page);
        await fs.mkdir(path.join(distDir, path.dirname(relative)), {recursive: true});
        let code = `// ${page}:${asset.position.start.line}:${asset.position.start.column}\n\n${asset.code}`;
        await fs.writeFile(path.join(distDir, relative + ':' + asset.position.start.line + '.' + asset.lang), code);
      }
    }
  }));

  for await (let file of fs.glob('packages/dev/s2-docs/pages/**/*.{tsx,ts,json}')) {
    let relative = path.relative(path.join(process.cwd(), 'packages/dev/s2-docs/pages'), file);
    await fs.mkdir(path.join(distDir, path.dirname(relative)), {recursive: true});
    await fs.copyFile(file, path.join(distDir, relative));
  }

  await fs.copyFile('lib/svg.d.ts', `${distDir}/svg.d.ts`);
  await fs.copyFile('lib/css.d.ts', `${distDir}/css.d.ts`);
  await fs.writeFile(`${distDir}/tsconfig.json`, `{
    "compilerOptions": {
      "target": "es2018",
      "lib": [
        "dom",
        "dom.iterable",
        "esnext"
      ],
      "strict": true,
      "noImplicitAny": false,
      "allowJs": true,
      "esModuleInterop": true,
      "allowSyntheticDefaultImports": true,
      "module": "esnext",
      "moduleResolution": "bundler",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "preserve",
      "noUnusedLocals": true,
      "skipLibCheck": true,
      "paths": {
        "vanilla-starter/*": ["../../starters/docs/src/*"],
        "tailwind-starter/*": ["../../starters/tailwind/src/*"]
      }
    }
  }
  `);
}

extractExamples();
