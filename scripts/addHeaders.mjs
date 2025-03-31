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

const glob = require('fast-glob');
const fs = require('fs');
const path = require('path');

const HEADER = `Copyright ${new Date().getFullYear()} Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.`;

const JS_COMMENT_STYLE = {
  start: '/*\n * ',
  middle: ' * ',
  end: '\n */\n'
};

const HTML_COMMENT_STYLE = {
  start: '<!-- ',
  middle: '',
  end: ' -->\n'
};

const COMMENT_STYLES = {
  '.js': JS_COMMENT_STYLE,
  '.ts': JS_COMMENT_STYLE,
  '.tsx': JS_COMMENT_STYLE,
  '.css': JS_COMMENT_STYLE,
  '.md': HTML_COMMENT_STYLE,
  '.mdx': HTML_COMMENT_STYLE
};

let files = glob.sync(path.dirname(__dirname) + '/**/*.{js,ts,tsx,mdx,md,css}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/.parcel-cache/**', '**/README.md', '**/CODE_OF_CONDUCT.md', '**/CONTRIBUTING.md', '**/.github/**/*.md']
});

for (let file of files) {
  let contents = fs.readFileSync(file, 'utf8');
  let style = COMMENT_STYLES[path.extname(file)];
  let header = style.start + HEADER.split('\n').join('\n' + style.middle) + style.end;
  header = header.replace(/\s+\n/g, '\n');
  if (!/Copyright \d+ Adobe/.test(contents)) {
    contents = header + '\n' + contents;
    fs.writeFileSync(file, contents);
  }
}
