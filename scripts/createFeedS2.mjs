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

import {basename} from 'path';
import fs from 'fs';
import {globSync} from 'glob';
import rehypeStringify from 'rehype-stringify';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import {unified} from 'unified';
import {visit} from 'unist-util-visit';
import xml from 'xml';

const publicUrl = process.env.PUBLIC_URL || 'http://localhost:1234';

createFeed('react-aria/blog', 'React Aria Blog');
createFeed('react-aria/releases', 'React Aria Releases');
createFeed('s2/releases', 'React Spectrum Releases');

function createFeed(type, title) {
  let files = globSync(`packages/dev/s2-docs/pages/${type}/*.mdx`, {ignore: [`packages/dev/s2-docs/pages/${type}/index.mdx`]});
  let posts = [];

  for (let file of files) {
    let contents = fs.readFileSync(file, 'utf8');
    let tree = unified().use(remarkParse).use(remarkMdx).parse(contents);

    let exports = {};
    visit(tree, 'mdxjsEsm', node => {
      for (let stmt of node.data.estree.body) {
        if (stmt.type === 'ExportNamedDeclaration') {
          for (let decl of stmt.declaration.declarations) {
            if (decl.init.type === 'Literal') {
              exports[decl.id.name] = decl.init.value;
            }
          }
        }
      }
    });

    let title;
    visit(tree, 'heading', node => {
      if (node.depth === 1) {
        title = node.children[0].value;
      }
    });

    let summary = unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(remarkRehype)
      .use(rehypeStringify)
      .processSync({value: exports.description})
      .value;

    let entry = [
      {title},
      {link: [{_attr: {rel: 'alternate', type: 'text/html', href: `${publicUrl}/${type}/${basename(file, '.mdx')}.html`}}]},
      {id: basename(file, '.mdx')},
      {updated: new Date(exports.date).toISOString()},
      {published: new Date(exports.date).toISOString()},
      {summary: [{_attr: {type: 'text/html'}}, summary]},
    ];

    if (exports.author) {
      entry.push({
        author: [
          {name: exports.author},
          {uri: exports.authorLink}
        ]
      });
    }

    posts.push({
      entry
    });
  }

  posts = posts.sort((a, b) => a.entry[3].updated < b.entry[3].updated ? 1 : -1);
  let feed = xml({
    feed: [
      {_attr: {xmlns: 'http://www.w3.org/2005/Atom'}},
      {title},
      {link: `${publicUrl}/${type}/`},
      {updated: posts[0].entry[3].updated},
      {id: `${publicUrl}/${type}.xml`},
      ...posts
    ]
  });

  fs.writeFileSync(`packages/dev/s2-docs/dist/${type}.xml`, feed);
}
