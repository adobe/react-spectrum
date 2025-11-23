import {Link} from './Link';
import type {Page} from '@parcel/rsc';
import {renderHTMLfromMarkdown} from './types';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

export function PostList({pages}: {pages: Page[]}) {
  let posts = pages.sort((a, b) => {
    return new Date(b.exports?.date).getTime() - new Date(a.exports?.date).getTime();
  });

  return (
    <div
      itemScope
      itemType="https://schema.org/Blog"
      className={style({marginY: 40, display: 'flex', flexDirection: 'column', gap: 40})}>
      <div itemProp="publisher" itemScope itemType="https://schema.org/Organization" hidden>
        <meta itemProp="name" content="Adobe" />
        <meta itemProp="url" content="https://www.adobe.com" />
        <meta itemProp="logo" content="https://www.adobe.com/favicon.ico" />
      </div>
      {posts.map(post => (
        <article key={post.name} itemProp="blogPost" itemScope itemType="https://schema.org/BlogPosting">
          <header className={style({marginBottom: 12})}>
            <h2 itemProp="headline" className={style({font: 'title-xl', margin: 0})}>
              <Link href={post.url}>{post.tableOfContents?.[0]?.title || post.exports?.title}</Link>
            </h2>
            {post.exports?.author && <Byline author={post.exports?.author} authorLink={post.exports?.authorLink} date={post.exports?.date} />}
            {post.exports?.date && !post.exports.author && <Time date={post.exports.date} />}
          </header>
          <meta itemProp="url" content={post.url} />
          <p itemProp="description" className={style({font: 'body', margin: 0})}>{renderHTMLfromMarkdown(post.exports?.description, {forceInline: true, forceBlock: false})}</p>
        </article>
      ))}
    </div>
  );
}

export function Byline({author, authorLink, date}: {author?: string, authorLink?: string, date: string}) {
  let formattedDate = new Date(date).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});

  return (
    <div className={style({font: 'detail', width: 'full', maxWidth: '--text-width', marginX: 'auto', marginTop: 4})}>
      {author && (
        <>
          {'By '}
          <span itemProp="author" itemScope itemType="https://schema.org/Person">
            {authorLink ? (<>
              <meta itemProp="url" content={authorLink} />
              <Link href={authorLink} isQuiet rel="author" target="_blank">
                <span itemProp="name">{author}</span>
              </Link>
            </>) : <span itemProp="name">{author}</span>}
          </span>
          {' · '}
        </>
      )}
      <time itemProp="datePublished" dateTime={date}>{formattedDate}</time>
    </div>
  );
}

export function Time({date}: {date: string}) {
  return <time itemProp="datePublished" dateTime={date} className={style({font: 'detail'})}>{new Date(date).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</time>;
}
