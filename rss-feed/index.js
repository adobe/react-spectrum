import fs from "fs";
import xml from "xml";
import {getFeed} from "./getFeed.js";

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