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

let internationalizedDir = path.join(__dirname, '../packages/@internationalized');
let internationalizedRedirectsDir = path.join(__dirname, '../packages/dev/docs/pages/redirects/internationalized');

let blogDir = path.join(__dirname, '../packages/dev/docs/pages/blog');
let blogRedirectsDir = path.join(__dirname, '../packages/dev/docs/pages/redirects/blog');

let rootLevelRedirectsDir = path.join(__dirname, '../packages/dev/docs/pages/redirects');

// from the above paths, find all mdx files for components/hooks/top level docs
let componentDocs = glob.sync('*/docs/*.mdx', {cwd: reactSpectrumDir});
let devDocs = glob.sync('*.mdx', {cwd: reactSpectrumDevDocsDir});
let reactAriaDevDocs = glob.sync('*.mdx', {cwd: reactAriaDevDocsDir});
let reactAriaHooksDocs = glob.sync('*/docs/*.mdx', {cwd: reactAriaDir});
let reactAriaComponentsDocs = glob.sync('docs/*.mdx', {cwd: reactAriaComponentsDir});
let reactAriaExamplesDocs = glob.sync('docs/examples/*.mdx', {cwd: reactAriaComponentsDir});
let internationalizedDocs = glob.sync('*/docs/*.mdx', {cwd: internationalizedDir});
let blogDocs = glob.sync('*.mdx', {cwd: blogDir});
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

// create redirect directories
fs.mkdirSync(reactSpectrumRedirectsDir, {recursive: true});
fs.mkdirSync(reactAriaRedirectsDir, {recursive: true});
fs.mkdirSync(releasesRedirectsDir, {recursive: true});
fs.mkdirSync(internationalizedRedirectsDir, {recursive: true});
fs.mkdirSync(blogRedirectsDir, {recursive: true});
fs.mkdirSync(rootLevelRedirectsDir, {recursive: true});

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

// custom redirect mappings for dev/aria pages and aria hooks
let reactAriaCustomRedirects = {
  'accessibility': 'https://react-aria.adobe.com/concepts.html',
  'interactions': 'https://react-aria.adobe.com/concepts.html',
  'internationalization': 'https://react-aria.adobe.com/concepts.html',
  'ssr': 'https://react-aria.adobe.com/frameworks.html',
  'routing': 'https://react-aria.adobe.com/frameworks.html',
  // TODO: the below don't have a good equivalent so just linking to the home page
  'advanced': 'https://react-aria.adobe.com/index.html',
  'components': 'https://react-aria.adobe.com/index.html',
  'why': 'https://react-aria.adobe.com/index.html'
};

function getReactAriaRedirectUrl(fileName) {
  return reactAriaCustomRedirects[fileName] || `https://react-aria.adobe.com/${fileName}.html`;
}

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
    fs.writeFileSync(outputPath, createRedirectMdx(getReactAriaRedirectUrl(fileName)));
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
    fs.writeFileSync(outputPath, createRedirectMdx(getReactAriaRedirectUrl(fileName)));
  }
});

// generate redirects for react aria components
reactAriaComponentsDocs.forEach(docPath => {
  let fileName = path.basename(docPath, '.mdx');
  let outputPath = path.join(reactAriaRedirectsDir, `${fileName}.mdx`);
  fs.writeFileSync(outputPath, createRedirectMdx(getReactAriaRedirectUrl(fileName)));
});

// list of aria examples that have been carried over to new site. Others will just navigate to examples/index pages
let examplesCustomRedirects = {
  'framer-modal-sheet': 'https://react-aria.adobe.com/examples/sheet.html',
  'list-view': 'https://react-aria.adobe.com/examples/list-view.html',
  'ripple-button': 'https://react-aria.adobe.com/examples/ripple-button.html',
  'swipeable-tabs': 'https://react-aria.adobe.com/examples/swipeable-tabs.html'
};

let examplesRedirectsDir = path.join(reactAriaRedirectsDir, 'examples');
fs.mkdirSync(examplesRedirectsDir, {recursive: true});
reactAriaExamplesDocs.forEach(docPath => {
  let fileName = path.basename(docPath, '.mdx');
  let outputPath = path.join(examplesRedirectsDir, `${fileName}.mdx`);
  let redirectUrl = examplesCustomRedirects[fileName] || 'https://react-aria.adobe.com/examples/index.html';
  fs.writeFileSync(outputPath, createRedirectMdx(redirectUrl));
});

// generate redirects for releases
releaseDocs.forEach(docPath => {
  let fileName = path.basename(docPath, '.mdx');
  let outputPath = path.join(releasesRedirectsDir, `${fileName}.mdx`);
  fs.writeFileSync(outputPath, createRedirectMdx(`/v3/releases/${fileName}.html`));
});

// generate redirect for releases index page
fs.writeFileSync(releasesIndexPath, createRedirectMdx('/v3/releases/index.html'));

// generate redirects for internationalized packages
internationalizedDocs.forEach(docPath => {
  let fileName = path.basename(docPath, '.mdx');
  // extract package name from path (date/number/etc)
  let packageName = docPath.split('/')[0];
  let outputPath = path.join(internationalizedRedirectsDir, packageName);
  fs.mkdirSync(outputPath, {recursive: true});
  let redirectPath = path.join(outputPath, `${fileName}.mdx`);
  fs.writeFileSync(redirectPath, createRedirectMdx(`https://react-aria.adobe.com/internationalized/${packageName}/${fileName}.html`));
});

// generate redirect for internationalized index page
let internationalizedIndexPath = path.join(internationalizedRedirectsDir, 'index.mdx');
fs.writeFileSync(internationalizedIndexPath, createRedirectMdx('https://react-aria.adobe.com/internationalized/index.html'));

// generate redirects for blog posts
blogDocs.forEach(docPath => {
  let fileName = path.basename(docPath, '.mdx');
  let outputPath = path.join(blogRedirectsDir, `${fileName}.mdx`);
  fs.writeFileSync(outputPath, createRedirectMdx(`https://react-aria.adobe.com/blog/${fileName}.html`));
});

// generate redirects for special root-level pages
let rootLevelRedirects = {
  'architecture': 'https://react-spectrum.adobe.com/index.html',
  'contribute': 'https://github.com/adobe/react-spectrum?tab=contributing-ov-file#contribute',
  // TODO: where to put this? Add something later perhaps
  'Support': 'https://github.com/adobe/react-spectrum/issues'
};

Object.entries(rootLevelRedirects).forEach(([fileName, redirectUrl]) => {
  let outputPath = path.join(rootLevelRedirectsDir, `${fileName}.mdx`);
  fs.writeFileSync(outputPath, createRedirectMdx(redirectUrl));
});
