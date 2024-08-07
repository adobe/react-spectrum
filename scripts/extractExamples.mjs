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

import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import glob from 'glob';
import fs from 'fs';
import path from 'path';
import {visit} from 'unist-util-visit';

let distDir = 'dist/docs-examples';

try {
  fs.rmSync(distDir, {recursive: true});
} catch (err) {}
fs.mkdirSync(distDir, {recursive: true});

for (let file of glob.sync('packages/{@react-{spectrum,aria,stately}/*,react-aria-components}/docs/**/*.mdx')) {
  console.log(`Extracting ${file}...`);
  let contents = fs.readFileSync(file);
  let ast = unified().use(remarkParse).use(remarkMdx).parse(contents);
  let imports = new Set();
  let exampleCode = [];
  let hasExamples = false;

  visit(ast, 'code', node => {
    if (node.lang !== 'tsx' && node.lang !== 'jsx') {
      return;
    }

    let [meta, ...options] = (node.meta || '').split(' ');
    if (meta !== 'import' && meta !== 'example' && meta !== 'snippet') {
      return;
    }

    let code = node.value;
    code = code.replace(/import ((?:.|\n)*?) from (['"].*?['"]);?/g, (m, a, s) => {
      if (s.slice(1, -1) !== 'your-component-library') {
        if (a.startsWith('{')) {
          let filtered = a.slice(1, -1).split(/\s*,\s+/).filter(s => {
            if (!imports.has(s)) {
              imports.add(s);
              return true;
            }

            return false;
          });

          if (filtered.length) {
            exampleCode.push(`import {${filtered.join(', ')}} from ${s};`);
          }
        } else if (!imports.has(a)) {
          imports.add(a);
          exampleCode.push(m);
        }
      }
      return '';
    });

    if (meta === 'import') {
      exampleCode.push(code.trim());
      return;
    }

    hasExamples = true;

    if (!options.includes('render=false')) {
      if (/function (.|\n)*}\s*$/.test(code)) {
        let name = code.match(/function (.*?)\s*(?:<.*?)?\(/)[1];
        code = `${code}\nReactDOM.createRoot(document.getElementById("root")).render(<${name} />);`;
      } else if (/^<(.|\n)*>$/m.test(code)) {
        code = code.replace(/^(<(.|\n)*>)$/m, `ReactDOM.createRoot(document.getElementById("root")).render(<>$1</>);`);
      }
    }

    code = code.trim();
    if (!options.includes('export=true')) {
      code = `(function() {\n${code}\n})();\n`;
    }

    exampleCode.push(`\n// ${file}:${node.position.start.line}:${node.position.start.column}`);
    exampleCode.push(code);
  });

  if (hasExamples) {
    exampleCode.unshift(`import React from 'react';
import ReactDOM from 'react-dom/client';
`);
    let parts = file.split(path.sep);
    let dir = `${distDir}/${parts[1]}/${parts[2]}`;
    if (parts[3] === 'examples') {
      dir += '/examples';
    }
    fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(`${dir}/${path.basename(file).slice(0, -4) + '.tsx'}`, exampleCode.join('\n'));
  }
}

fs.copyFileSync('lib/svg.d.ts', `${distDir}/svg.d.ts`);
fs.writeFileSync(`${distDir}/tsconfig.json`, `{
  "compilerOptions": {
    "target": "es2018",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "strict": false,
    "allowJs": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react",
    "noUnusedLocals": true
  }
}
`);
