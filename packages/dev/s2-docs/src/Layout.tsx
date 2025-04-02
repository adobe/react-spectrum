import {Nav} from '../src/Nav';
import type {PageProps} from '@parcel/rsc';
import React from 'react';
import '../src/client';
import '@react-spectrum/s2/page.css';
import './font.css';
import './anatomy.css';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import { Code } from './Code';
import {Link} from './Link';
import { Example } from './Example';
import {VisualExample} from './VisualExample';
import {Search} from './Search';

const components = {
  h1: ({children, ...props}) => <h1 {...props} className={style({font: 'heading-3xl', marginY: 0})}>{children}</h1>,
  h2: ({children, ...props}) => <h2 {...props} className={style({font: 'heading-xl'})}>{children}</h2>,
  h3: ({children, ...props}) => <h3 {...props} className={style({font: 'heading-lg'})}>{children}</h3>,
  h4: ({children, ...props}) => <h4 {...props} className={style({font: 'heading'})}>{children}</h4>,
  p: ({children, ...props}) => <p {...props} className={style({font: 'body-lg', marginY: 24})}>{children}</p>,
  ul: (props) => <ul {...props} />,
  li: ({children, ...props}) => <li {...props} className={style({font: 'body-lg', marginTop: 0, marginBottom: 8})}>{children}</li>,
  CodeBlock: Example,
  code: (props) => <Code {...props} />,
  strong: ({children, ...props}) => <strong {...props} className={style({fontWeight: 'bold'})}>{children}</strong>,
  a: (props) => <Link {...props} />,
  PageDescription: ({children, ...props}) => <p {...props} className={style({font: 'body-lg'})}>{children}</p>,
  VisualExample,
  Keyboard: (props) => <kbd {...props} className={style({font: 'code-sm', paddingX: 4, backgroundColor: 'gray-100', borderRadius: 'sm'})} />
};

export function Layout(props: PageProps) {
  let {pages, currentPage, children} = props;
  return (
    <html lang="en" data-background="layer-1" key={currentPage.url}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{currentPage.exports?.title ?? currentPage.tableOfContents?.[0]?.text ?? currentPage.name}</title>
      </head>
      <body className={style({display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, maxWidth: 1600, marginX: 'auto', padding: 12})}>
        <Search />
        <div className={style({display: 'flex', gap: 32, width: 'full'})}>
          <Nav pages={pages} currentPage={currentPage} />
          <main className={style({backgroundColor: 'base', padding: 40, borderRadius: 'xl', boxShadow: 'emphasized', maxWidth: 1280, boxSizing: 'border-box', flexGrow: 1, display: 'flex', justifyContent: 'space-between'})}>
            <article className={style({maxWidth: 768, width: 'full'})}>
              {React.cloneElement(children, {components})}
            </article>
            <aside>
              <Toc toc={currentPage.tableOfContents?.[0]?.children ?? []} />
            </aside>
          </main>
        </div>
      </body>
    </html>
  );
}

function Toc({toc}) {
  return (
    <ul>
      {toc.map((c, i) => (
        <li key={i}>
          {c.title}
          {c.children.length > 0 && <Toc toc={c.children} />}
        </li>
      ))}
    </ul>
  );
}
