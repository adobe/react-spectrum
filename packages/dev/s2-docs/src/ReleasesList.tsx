
import {Link} from './Link';
import type {Page} from '@parcel/rsc';
import {renderHTMLfromMarkdown} from './types';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

export function ReleasesList({pages}: {pages: Page[]}) {
  let releases = pages.sort((a, b) => {
    return new Date(b.exports?.date).getTime() - new Date(a.exports?.date).getTime();
  });
  return (
    <article className={style({marginY: 40, display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 600})}>
      {releases.map(release => (
        <div key={release.name}>
          <header className={style({marginBottom: 12})}>
            <h2 className={style({font: 'heading-lg', margin: 0})}><Link href={release.url}>{release.exports?.title}</Link></h2>
            <Time date={release.exports?.date} />
          </header>
          <p className={style({font: 'body', margin: 0})}>{renderHTMLfromMarkdown(release.exports?.description, {forceInline: false, forceBlock: true})}</p>
        </div>
      ))}
    </article>
  );
}

export function Time({date}: {date: string}) {
  return <time dateTime={date} className={style({font: 'detail'})}>{new Date(date).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</time>;
}
