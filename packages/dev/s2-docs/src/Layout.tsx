import {MobileNav, MobileOnPageNav, Nav, OnPageNav, SideNav, SideNavItem, SideNavLink} from '../src/Nav';
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
import {MobileHeader} from './MobileHeader';
import {PickerItem, SearchField} from '@react-spectrum/s2';
import {PropTable} from './PropTable';
import {StateTable} from './StateTable';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {TypeLink} from './types';
import {VisualExample} from './VisualExample';

const components = {
  h1: ({children, ...props}) => <h1 {...props} id={anchorId(children)} className={style({font: {default: 'heading-2xl', lg: 'heading-3xl'}, marginY: 0})}>{children}</h1>,
  h2: H2,
  h3: H3,
  h4: H4,
  p: ({children, ...props}) => <p {...props} className={style({font: {default: 'body', lg: 'body-lg'}, marginY: 24})}>{children}</p>,
  ul: (props) => <ul {...props} />,
  li: ({children, ...props}) => <li {...props} className={style({font: {default: 'body', lg: 'body-lg'}, marginTop: 0, marginBottom: 8})}>{children}</li>,
  Figure: (props) => <figure {...props} className={style({display: 'flex', flexDirection: 'column', alignItems: 'center', marginY: 32, marginX: 0})} />,
  Caption: (props) => <figcaption {...props} className={style({font: 'body-sm'})} />,
  CodeBlock: CodeBlock,
  code: (props) => <Code {...props} />,
  strong: ({children, ...props}) => <strong {...props} className={style({fontWeight: 'bold'})}>{children}</strong>,
  a: (props) => <Link {...props} />,
  PageDescription: ({children, ...props}) => <p {...props} className={style({font: {default: 'body-lg', lg: 'body-xl'}})}>{children}</p>,
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
        <link rel="alternate" type="text/markdown" title="LLM-friendly version" href={currentPage.url.replace(/\.html$/, '.md')} />
        <title>{currentPage.exports?.title ?? currentPage.tableOfContents?.[0]?.title ?? currentPage.name}</title>
      </head>
      <body
        className={style({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: {
            default: 'full',
            lg: 1280
          },
          marginX: 'auto',
          marginY: 0,
          padding: {
            default: 0,
            lg: 12
          }
        })}>
        <Header pages={pages} currentPage={currentPage}  />
        <MobileHeader
          toc={<MobileToc key="toc" toc={currentPage.tableOfContents ?? []} />}
          nav={<MobileNav key="nav" pages={pages} currentPage={currentPage} />} />
        <div className={style({display: 'flex', gap: 32, width: 'full'})}>
          <Nav pages={pages} currentPage={currentPage} />
          <main 
            key={currentPage.url}
            style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}
            className={style({
              backgroundColor: 'base',
              padding: {
                default: 12,
                lg: 40
              },
              borderRadius: {
                default: 'none',
                lg: 'xl'
              },
              boxShadow: {
                lg: 'emphasized'
              },
              width: 'full',
              boxSizing: 'border-box',
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'space-between',
              height: '[calc(100vh - 68px)]',
              overflow: 'auto'
            })}>
            <article
              className={style({
                maxWidth: 768,
                width: 'full'
              })}>
              {React.cloneElement(children, {components})}
            </article>
            <aside
              className={style({
                position: 'sticky',
                top: 0,
                height: 'fit',
                maxHeight: 'screen',
                overflow: 'auto',
                paddingY: 32,
                boxSizing: 'border-box',
                display: {
                  default: 'none',
                  lg: 'block'
                }
              })}>
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

function MobileToc({toc}) {
  return (
    <MobileOnPageNav>
      {renderMobileToc(toc)}
    </MobileOnPageNav>
  );
}

function renderMobileToc(toc, seen = new Map()) {
  return toc.map((c) => {
    let href = '#' + anchorId(c.title);
    if (seen.has(href)) {
      seen.set(href, seen.get(href) + 1);
      href += '-' + seen.get(href);
    } else {
      seen.set(href, 1);
    }
    return (<React.Fragment key={href}>
      <PickerItem id={href} href={href}>{c.title}</PickerItem>
      {c.children.length > 0 && renderMobileToc(c.children, seen)}
    </React.Fragment>);
  });
}
