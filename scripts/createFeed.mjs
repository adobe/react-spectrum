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

import glob from 'glob';
import fs from 'fs';
import xml from "xml";

(async function createRssFeed() {
  let posts = getFeed();
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
                href: "https://react-spectrum.adobe.com/releases/feed.rss",
                rel: "self",
                type: "application/rss+xml",
              },
            },
          },
          {title: "Adobe React Spectrum Release"},
          {link: "https://react-spectrum.adobe.com/"},
          {description: "A collection of libraries and tools that help you build adaptive, accessible, and robust user experiences."},
          {language: "en-US"},
          ...buildFeed(posts)
        ],
      },
    ],
  };

  const feed = '<?xml version="1.0" encoding="UTF-8"?>' + xml(feedObject);
  await fs.writeFile("feed.rss", feed, (err) => console.log(err));
})();

function getFeed() {
  let files = glob.sync('../packages/dev/docs/pages/releases/*.mdx', {ignore: ['../packages/dev/docs/pages/releases/index.mdx']});
  files = files.slice(files.length - 5, files.length);

  let posts = [];

  for (let file of files) {
    let contents = fs.readFileSync(file, 'utf8').split("\n");

    let date = '';
    let description = '';
    let index = 0;
    while (date === '' || description === '' && index < contents.length) {
      if (contents[index].startsWith('description')) {
        description = contents[index].replace('description:', '').trim();
      } else if (contents[index].startsWith('date:')) {
        date = contents[index].replace('date:', '').trim();
      }
      index++;
    }

    let post = {date: date, description: description};
    posts.push(post);
  }

  posts = posts.sort((a, b) => a.date < b.date ? 1 : -1);
  return posts
}

function buildFeed(posts) {
  const feedItems = [];

  feedItems.push(
    ...posts.map(function (post) {
      const feedItem = {
        item: [
          {title: post.date},
          {pubDate: new Date(post.date).toUTCString(),},
          {guid: [
              { _attr: { isPermaLink: true } },
              `https://react-spectrum.adobe.com/releases/${post.date}.html`,
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

