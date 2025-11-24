import {getLibraryFromPage, getLibraryLabel} from './library';
import {Link} from './Link';
import type {Page} from '@parcel/rsc';
import {renderHTMLfromMarkdown} from './types';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

export function PostList({currentPage, pages}: {currentPage: Page, pages: Page[]}) {
  let posts = pages.sort((a, b) => {
    return new Date(b.exports?.date).getTime() - new Date(a.exports?.date).getTime();
  });
  let feedUrl = currentPage.url.replace(/\/(index.html)?$/, '.xml');

  return (
    <>
      {/* React hoists this into the <head> */}
      <link
        rel="alternate"
        type="application/atom+xml"
        title={`${getLibraryLabel(getLibraryFromPage(currentPage))} ${currentPage.tableOfContents?.[0].title}`}
        href={feedUrl} />
      <div className={style({marginTop: 8})}>
        <Link isStandalone isQuiet href={feedUrl} target="_blank">
          <span className={style({display: 'inline-flex', alignItems: 'center', columnGap: 4})}>
            <RSSIcon />
            Subscribe
          </span>
        </Link>
      </div>
      <div
        itemScope
        itemType="https://schema.org/Blog"
        className={style({marginY: 48, display: 'flex', flexDirection: 'column', gap: 40})}>
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
    </>
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

function RSSIcon() {
  return (
    <svg viewBox="0 0 36 36" style={{width: 16, verticalAlign: 'middle'}} focusable="false" aria-hidden="true" role="img" fill="currentColor">
      <circle fillRule="evenodd" cx="7.993" cy="28.007" r="4" />
      <path fillRule="evenodd" d="M21.983,32.007h-4a.5.5,0,0,1-.5-.489,13.519,13.519,0,0,0-13-13,.5.5,0,0,1-.488-.5l0-4a.5.5,0,0,1,.511-.5A18.525,18.525,0,0,1,22.486,31.5.5.5,0,0,1,21.983,32.007Z" />
      <path fillRule="evenodd" d="M31.985,32.007h-4a.5.5,0,0,1-.5-.493,23.7,23.7,0,0,0-23-23.19.5.5,0,0,1-.493-.5V4.015a.5.5,0,0,1,.51-.5A28.535,28.535,0,0,1,32.489,31.5.5.5,0,0,1,31.985,32.007Z" />
    </svg>
  );
}
