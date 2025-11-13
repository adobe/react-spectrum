import {Link} from './Link';
import type {Page} from '@parcel/rsc';
import React from 'react';
import {renderHTMLfromMarkdown} from './types';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

export function BlogList({pages}: {pages: Page[]}) {
  let blogPosts = pages.sort((a, b) => {
    return new Date(b.exports?.date).getTime() - new Date(a.exports?.date).getTime();
  });

  return (
    <article className={style({marginY: 40, display: 'flex', flexDirection: 'column', gap: 40})}>
      {blogPosts.map(post => (
        <div key={post.name}>
          <header className={style({marginBottom: 12})}>
            <h2 className={style({font: 'heading-lg', margin: 0})}><Link href={post.url}>{post.tableOfContents?.[0]?.title || post.exports?.title}</Link></h2>
            <Byline author={post.exports?.author} authorLink={post.exports?.authorLink} date={post.exports?.date} />
          </header>
          <p className={style({font: 'body', margin: 0})}>{renderHTMLfromMarkdown(post.exports?.description, {forceInline: true, forceBlock: false})}</p>
        </div>
      ))}
    </article>
  );
}

export function Byline({author, authorLink, date}: {author?: string, authorLink?: string, date: string}) {
  let formattedDate = new Date(date).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});

  return (
    <div className={style({font: 'detail'})}>
      {author && (
        <>
          By {authorLink ? <Link href={authorLink} isQuiet>{author}</Link> : author}
          {' · '}
        </>
      )}
      <time dateTime={date}>{formattedDate}</time>
    </div>
  );
}
