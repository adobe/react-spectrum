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

let indexHTML = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta name="theme-color" content="#000000">
  <!--
      manifest.json provides metadata used when your web app is added to the
      homescreen on Android. See https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/
    -->
  <link rel="manifest" href="%PUBLIC_URL%/manifest.json">
  <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
  <!--
      Notice the use of %PUBLIC_URL% in the tags above.
      It will be replaced with the URL of the \`public\` folder during the build.
      Only files inside the \`public\` folder can be referenced from the HTML.

      Unlike "/favicon.ico" or "favicon.ico", "%PUBLIC_URL%/favicon.ico" will
      work correctly both with client-side routing and a non-root public URL.
      Learn how to configure a non-root public URL by running \`npm run build\`.
    -->
  <title>React App</title>
</head>

<body>
  <noscript>
    You need to enable JavaScript to run this app.
  </noscript>
  <div id="root"></div>
  <!--
      This HTML file is a template.
      If you open it directly in the browser, you will see an empty page.

      You can add webfonts, meta tags, or analytics to this file.
      The build step will place the bundled scripts into the <body> tag.

      To begin the development, run \`npm start\` or \`yarn start\`.
      To create a production bundle, use \`npm run build\` or \`yarn build\`.
    -->
</body>

</html>`;

let indexJS = `import React from "react";
import ReactDOM from "react-dom";
import { Provider, defaultTheme } from "@adobe/react-spectrum";

import Example from "./Example";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <Provider theme={defaultTheme}>
    <Example />
  </Provider>,
  rootElement
);
`;

export function createCodeSandbox(e) {
  // Get package info for codesandbox.
  // TODO: Get these at build time and put in data-* properties
  let packageInfo = e.target.closest('article').querySelector('tbody').childNodes;
  let packageName = packageInfo[0].innerText.split('add ')[1];
  let packageVersion = packageInfo[1].innerText.split('\t')[1];
  let imports = packageInfo[2].innerText.split('\t')[1];
  let exampleTitle = document.querySelector('h1').textContent;

  // Get example code.
  let exampleCode = e.target.parentNode.parentNode.querySelector('.source').textContent;

  // Separate import lines.
  let lines = exampleCode.split('\n');
  imports = `${imports}\n${lines.filter(line => line.startsWith('import')).join('\n')}`;
  exampleCode = lines.filter(line => !line.startsWith('import')).join('\n');

  // Put imports at top, export component, and put code inside render if needed.
  if (/^\s*function (.|\n)*}\s*$/.test(exampleCode)) {
    exampleCode = `import React from 'react';
${imports}

export default ${exampleCode}
`;
  } else {
    exampleCode = `import React from 'react';
${imports}

export default function Example() {
  return (
    ${exampleCode}
  );
}
`;
  }

  fetch('https://codesandbox.io/api/v1/sandboxes/define?json=1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      files: {
        'package.json': {
          content: {
            name: `${exampleTitle} Example - React Spectrum`, // TODO: Include a subtitle for components with more than one example
            main: 'index.js',
            dependencies: {
              react: 'latest',
              'react-dom': 'latest',
              '@adobe/react-spectrum': 'latest',
              [packageName]: packageVersion
            }
          }
        },
        'Example.js': {
          content: exampleCode
        },
        'index.js': {
          content: indexJS
        },
        'index.html': {
          content: indexHTML
        }
      }
    })
  })
  .then((x) => x.json())
  .then((data) =>
    window.open(`https://codesandbox.io/s/${data.sandbox_id}?file=/Example.js`, '_blank')
  );
}
