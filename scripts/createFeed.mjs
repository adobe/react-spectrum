/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import glob from 'glob';
import fs from 'fs';
import xml from "xml";
import process from 'process';
import {parseArgs} from 'node:util';

let options = {
  releases: {
    type: 'string'
  },
  blog: {
    type: 'string'
  }
};

(async function createRssFeed() {

  let args = parseArgs({options, allowPositionals: true});

  if (args.positionals.length < 1) {
    console.error('Expected at least one argument');
    process.exit(1);
  }

  let type = args.positionals[0];
  if (type !== 'releases' && type !== 'blog') {
    console.error('Expected argument to be either releases or blog');
    process.exit(1);
  }

  let titleType = type === 'releases' ? 'Releases' : 'Blog'
  let posts = getFeed(type);
  const feedObject = {
    rss: [
      {_attr: {
          version: "2.0",
          "xmlns:atom": "http://www.w3.org/2005/Atom",
        },
      },
      {channel: [
          {"atom:link": {
              _attr: {
                href: `https://react-spectrum.adobe.com/${type}/${type}-feed.rss`,
                rel: "self",
                type: "application/rss+xml",
              },
            },
          },
          {title: `Adobe React Spectrum ${titleType}`},
          {link: `https://react-spectrum.adobe.com/${type}`},
          {description: "A collection of libraries and tools that help you build adaptive, accessible, and robust user experiences."},
          {language: "en-US"},
          ...buildFeed(type, posts)
        ],
      },
    ],
  };

  const feed = xml(feedObject, {declaration: true});
  await fs.writeFile(`scripts/${type}-feed.rss`, feed, (err) => console.log(err === null ? 'Success' : err));
})();

function getFeed(type) {
  let files = glob.sync(`packages/dev/docs/pages/${type}/*.mdx`, {ignore: [`packages/dev/docs/pages/${type}/index.mdx`]});
  let posts = [];

  for (let file of files) {
    let contents = fs.readFileSync(file, 'utf8').split("\n");

    let date = '';
    let description = '';
    let title = '';
    let index = 0;
    while (date === '' || description === '' || title === '' && index < contents.length) {
      if (contents[index].startsWith('description')) {
        description = contents[index].replace('description:', '').trim();
      } else if (contents[index].startsWith('date:')) {
        date = contents[index].replace('date:', '').trim();
      } else if (contents[index].startsWith('#')) {
        title = contents[index].replace('#', '').trim();
      }
      index++;
    }

    let f = file.split('/');
    let fileName = f[f.length - 1].replace('.mdx', '');

    let post = {date: date, description: description, title: title, fileName: fileName};
    posts.push(post);
  }

  posts = posts.sort((a, b) => a.date < b.date ? 1 : -1).slice(0, 5);
  return posts;
}

function buildFeed(type, posts) {
  const feedItems = [];

  feedItems.push(
    ...posts.map(function (post) {
      const feedItem = {
        item: [
          {title: post.title},
          {pubDate: new Date(post.date).toUTCString(),},
          {guid: [
              { _attr: { isPermaLink: true } },
              `https://react-spectrum.adobe.com/${type}/${post.fileName}.html`,
            ],
          },
          {description: {
              _cdata: post.description,
            },
          },
        ],
      };
      return feedItem;
    })
  );

  return feedItems;
}

