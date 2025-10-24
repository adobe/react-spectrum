
import {Link} from './Link';
import type {Page} from '@parcel/rsc';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

export function ReleasesList({pages}: {pages: Page[]}) {
  let releases = pages;
  return (
    <article className={style({marginY: 40})}>
      {releases.map(release => (
        <div key={release.name}>
          <header className={style({marginBottom: 12})}>
            <h2 className={style({font: 'heading', margin: 0})}><Link href={release.url}>{release.exports?.title}</Link></h2>
            <time dateTime={release.exports?.date} className={style({font: 'detail'})}>{release.exports?.date}</time>
          </header>
          <p className={style({font: 'body', margin: 0})}>{release.exports?.description}</p>
        </div>
      ))}
    </article>
  );
}
