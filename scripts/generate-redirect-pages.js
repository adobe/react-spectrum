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

let packagesDir = path.join(__dirname, '../packages/@react-spectrum');
let reactSpectrumRedirectsDir = path.join(__dirname, '../packages/dev/docs/pages/redirects/react-spectrum');
let releasesDir = path.join(__dirname, '../packages/dev/docs/pages/releases');
let releasesRedirectsDir = path.join(__dirname, '../packages/dev/docs/pages/redirects/releases');

// find all old v3 component and release mdx
let componentDocs = glob.sync('*/docs/*.mdx', {cwd: packagesDir});
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

componentDocs.forEach(docPath => {
  const fileName = path.basename(docPath, '.mdx');
  const outputPath = path.join(reactSpectrumRedirectsDir, `${fileName}.mdx`);
  fs.writeFileSync(outputPath, createRedirectMdx(`/v3/${fileName}.html`));
});

releaseDocs.forEach(docPath => {
  const fileName = path.basename(docPath, '.mdx');
  const outputPath = path.join(releasesRedirectsDir, `${fileName}.mdx`);
  fs.writeFileSync(outputPath, createRedirectMdx(`/v3/releases/${fileName}.html`));
});
