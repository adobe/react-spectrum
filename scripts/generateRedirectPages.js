/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

let fs = require('fs');
let path = require('path');
let glob = require('glob');

let reactAriaDir = path.join(__dirname, '../packages/@react-aria');
let reactAriaComponentsDir = path.join(__dirname, '../packages/react-aria-components');
let reactAriaDevDocsDir = path.join(__dirname, '../packages/dev/docs/pages/react-aria');
let reactAriaRedirectsDir = path.join(__dirname, '../packages/dev/docs/pages/redirects/react-aria');

let reactSpectrumDir = path.join(__dirname, '../packages/@react-spectrum');
let reactSpectrumDevDocsDir = path.join(__dirname, '../packages/dev/docs/pages/react-spectrum');
let reactSpectrumRedirectsDir = path.join(__dirname, '../packages/dev/docs/pages/redirects/react-spectrum');

let releasesDir = path.join(__dirname, '../packages/dev/docs/pages/releases');
let releasesRedirectsDir = path.join(__dirname, '../packages/dev/docs/pages/redirects/releases');
let releasesIndexPath = path.join(releasesRedirectsDir, 'index.mdx');

// from the above paths, find all mdx files for components/hooks/top level docs
let componentDocs = glob.sync('*/docs/*.mdx', {cwd: reactSpectrumDir});
let devDocs = glob.sync('*.mdx', {cwd: reactSpectrumDevDocsDir});
let reactAriaDevDocs = glob.sync('*.mdx', {cwd: reactAriaDevDocsDir});
let reactAriaHooksDocs = glob.sync('*/docs/*.mdx', {cwd: reactAriaDir});
let reactAriaComponentsDocs = glob.sync('docs/*.mdx', {cwd: reactAriaComponentsDir});
let releaseDocs = glob.sync('*.mdx', {cwd: releasesDir}).filter(f => f !== 'index.mdx');

function createRedirectMdx(redirectTo) {
  return `{/* Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. */}

import {RedirectLayout} from '@react-spectrum/docs';

export default function Layout(props) {
  return <RedirectLayout {...props} redirectTo="${redirectTo}" />;
}
`;
}

// generate redirects for rsp component docs
componentDocs.forEach(docPath => {
  let fileName = path.basename(docPath, '.mdx');
  let outputPath = path.join(reactSpectrumRedirectsDir, `${fileName}.mdx`);
  fs.writeFileSync(outputPath, createRedirectMdx(`/v3/${fileName}.html`));
});

// generate redirects for getting intro and concepts section docs in rsp
devDocs.forEach(docPath => {
  let fileName = path.basename(docPath, '.mdx');
  let outputPath = path.join(reactSpectrumRedirectsDir, `${fileName}.mdx`);
  fs.writeFileSync(outputPath, createRedirectMdx(`/v3/${fileName}.html`));
});

// TODO: for the aria redirects, will need to check the mapping to the new react-aria site
// generate redirects for react aria top level docs to new site.
// note that examples, interactions, internationalization, testing, DnD, styling, and
// advanced customization are not in the /dev folder and thus handled elsewhere
// also note that we don't include "hooks" since we wanna keep that "getting started"
let reactAriaDevDocsToRedirect = [
  'index',
  'getting-started',
  'routing',
  'ssr',
  'testing',
  'accessibility',
  'collections',
  'components',
  'forms',
  'selection',
  'why'
];

reactAriaDevDocs.forEach(docPath => {
  let fileName = path.basename(docPath, '.mdx');

  if (reactAriaDevDocsToRedirect.includes(fileName)) {
    let outputPath = path.join(reactAriaRedirectsDir, `${fileName}.mdx`);
    fs.writeFileSync(outputPath, createRedirectMdx(`https://react-aria.adobe.com/${fileName}.html`));
  }
});

// generate redirects for the react aria hooks
// the below coorespond to the "category" in the mdx that have been removed from the sidebar and thus we want to redirect,
// aka we redirect anything but 'Hooks'
let removedCategories = [
  'Concepts',
  'Guides',
  'Interactions',
  'Focus',
  'Internationalization',
  'Server Side Rendering',
  'Utilities',
  'Drag and Drop'
];

reactAriaHooksDocs.forEach(docPath => {
  let fileName = path.basename(docPath, '.mdx');
  let fullPath = path.join(reactAriaDir, docPath);
  let content = fs.readFileSync(fullPath, 'utf-8');

  // extract "category" from mdx file and create a redirect if it matches one of the removed categories
  let categoryMatch = content.match(/^category:\s*(.+)$/m);
  let category = categoryMatch ? categoryMatch[1].trim() : null;

  if (category && removedCategories.includes(category)) {
    let outputPath = path.join(reactAriaRedirectsDir, `${fileName}.mdx`);
    fs.writeFileSync(outputPath, createRedirectMdx(`https://react-aria.adobe.com/${fileName}.html`));
  }
});

// generate redirects for react aria components
reactAriaComponentsDocs.forEach(docPath => {
  let fileName = path.basename(docPath, '.mdx');
  let outputPath = path.join(reactAriaRedirectsDir, `${fileName}.mdx`);
  fs.writeFileSync(outputPath, createRedirectMdx(`https://react-aria.adobe.com/${fileName}.html`));
});

// generate redirects for releases
releaseDocs.forEach(docPath => {
  let fileName = path.basename(docPath, '.mdx');
  let outputPath = path.join(releasesRedirectsDir, `${fileName}.mdx`);
  fs.writeFileSync(outputPath, createRedirectMdx(`/v3/releases/${fileName}.html`));
});

// generate redirect for releases index page
fs.writeFileSync(releasesIndexPath, createRedirectMdx('/v3/releases/index.html'));
