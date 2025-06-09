import {Nav, OnPageNav, SideNav, SideNavItem, SideNavLink} from '../src/Nav';
import type {PageProps} from '@parcel/rsc';
import React, {ReactElement} from 'react';
import '../src/client';
import '@react-spectrum/s2/page.css';
import './font.css';
import './anatomy.css';
import {Code} from './Code';
import {CodeBlock} from './CodeBlock';
import {ExampleSwitcher} from './ExampleSwitcher';
import {H2, H3, H4} from './Headings';
import Header from './Header';
import {Link} from './Link';
import {PropTable} from './PropTable';
import {StateTable} from './StateTable';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {TypeLink} from './types';
import {VisualExample} from './VisualExample';

const components = {
  h1: ({children, ...props}) => <h1 {...props} className={style({font: 'heading-3xl', marginY: 0})}>{children}</h1>,
  h2: H2,
  h3: H3,
  h4: H4,
  p: ({children, ...props}) => <p {...props} className={style({font: 'body-lg', marginY: 24})}>{children}</p>,
  ul: (props) => <ul {...props} />,
  li: ({children, ...props}) => <li {...props} className={style({font: 'body-lg', marginTop: 0, marginBottom: 8})}>{children}</li>,
  Figure: (props) => <figure {...props} className={style({display: 'flex', flexDirection: 'column', alignItems: 'center', marginY: 32, marginX: 0})} />,
  Caption: (props) => <figcaption {...props} className={style({font: 'body-sm'})} />,
  CodeBlock: CodeBlock,
  code: (props) => <Code {...props} />,
  strong: ({children, ...props}) => <strong {...props} className={style({fontWeight: 'bold'})}>{children}</strong>,
  a: (props) => <Link {...props} />,
  PageDescription: ({children, ...props}) => <p {...props} className={style({font: 'body-xl'})}>{children}</p>,
  VisualExample,
  Keyboard: (props) => <kbd {...props} className={style({font: 'code-sm', paddingX: 4, whiteSpace: 'nowrap', backgroundColor: 'gray-100', borderRadius: 'sm'})} />,
  PropTable,
  StateTable,
  ExampleSwitcher,
  TypeLink
};

function anchorId(children) {
  return children.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
}

export function Layout(props: PageProps & {children: ReactElement<any>}) {
  let {pages, currentPage, children} = props;
  return (
    <html lang="en" data-background="layer-1">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{currentPage.exports?.title ?? currentPage.tableOfContents?.[0]?.title ?? currentPage.name}</title>
      </head>
      <body className={style({display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, maxWidth: 1600, marginX: 'auto', padding: 12})}>
        <Header pages={pages} currentPage={currentPage}  />
        <div className={style({display: 'flex', gap: 32, width: 'full'})}>
          <Nav pages={pages} currentPage={currentPage} />
          <main 
            key={currentPage.url}
            className={style({
              backgroundColor: 'base',
              padding: 40,
              borderRadius: 'xl',
              boxShadow: 'emphasized',
              maxWidth: 1280,
              boxSizing: 'border-box',
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'space-between'
            })}>
            <article className={style({maxWidth: 768, width: 'full'})}>
              {React.cloneElement(children, {components})}
            </article>
            <aside className={style({position: 'sticky', top: 0, height: 'fit', maxHeight: 'screen', overflow: 'auto', paddingY: 32, boxSizing: 'border-box'})}>
              <div className={style({font: 'title', minHeight: 32, paddingX: 12, display: 'flex', alignItems: 'center'})}>Contents</div>
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
    <OnPageNav>
      <SideNav>
        {toc.map((c, i) => (
          <SideNavItem key={i}>
            <SideNavLink href={'#' + anchorId(c.title)}>{c.title}</SideNavLink>
            {c.children.length > 0 && <Toc toc={c.children} />}
          </SideNavItem>
        ))}
      </SideNav>
    </OnPageNav>
  );
}
