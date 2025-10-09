import {MobileOnPageNav, Nav, OnPageNav, SideNav, SideNavItem, SideNavLink} from '../src/Nav';
import type {Page, PageProps, TocNode} from '@parcel/rsc';
import React, {ReactElement} from 'react';
import '../src/client';
import './anatomy.css';
import {ClassAPI} from './ClassAPI';
import {Code} from './Code';
import {CodeBlock} from './CodeBlock';
import {ExampleSwitcher} from './ExampleSwitcher';
import {getLibraryFromPage, getLibraryLabel} from './library';
import {H2, H3, H4} from './Headings';
import Header from './Header';
import {Link} from './Link';
import {MobileHeader} from './MobileHeader';
import {PickerItem, Provider} from '@react-spectrum/s2';
import {PropTable} from './PropTable';
import {StateTable} from './StateTable';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {TypeLink} from './types';
import {VisualExample} from './VisualExample';

const components = {
  h1: ({children, ...props}) => <h1 {...props} id="top" className={style({font: {default: 'heading-2xl', lg: 'heading-3xl'}, marginY: 0})}>{children}</h1>,
  h2: H2,
  h3: H3,
  h4: H4,
  p: ({children, ...props}) => <p {...props} className={style({font: {default: 'body', lg: 'body-lg'}, marginY: 24})}>{children}</p>,
  ul: (props) => <ul {...props} />,
  li: ({children, ...props}) => <li {...props} className={style({font: {default: 'body', lg: 'body-lg'}, marginY: 0})}>{children}</li>,
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
  ClassAPI,
  ExampleSwitcher,
  TypeLink
};

function anchorId(children) {
  return children.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
}

const getTitle = (currentPage: Page): string => {
  const explicitTitle = (currentPage as any).pageTitle || currentPage.exports?.pageTitle;
  if (explicitTitle && explicitTitle !== currentPage.tableOfContents?.[0]?.title && explicitTitle !== currentPage.name) {
    return explicitTitle as string;
  }
  
  let library = getLibraryLabel(getLibraryFromPage(currentPage));
  const pageTitle = currentPage.tableOfContents?.[0]?.title ?? currentPage.name;
  
  if (currentPage.name === 'index.html' || currentPage.name.endsWith('/index.html')) {
    return library || 'React Spectrum';
  }
  
  return library ? `${pageTitle} | ${library}` : pageTitle;
};

const getOgImageUrl = (currentPage: Page): string => {
  const slug = currentPage.url.replace(/^\//, '').replace(/\.html$/, '');
  
  if (slug.includes('s2-docs/')) {
    // For build links, use the full URL
    const ogPath = slug.replace(/s2-docs\//, 's2-docs/og/');
    return `https://reactspectrum.blob.core.windows.net/${ogPath}.png`;
  }
  
  // For production, use relative path with /og/ prefix
  return `/og/${slug}.png`;
};

const getDescription = (currentPage: Page): string => {
  let library = getLibraryLabel(getLibraryFromPage(currentPage));
  const pageTitle = currentPage.exports?.title ?? currentPage.tableOfContents?.[0]?.title ?? currentPage.name;
  const explicitDescription = (currentPage as any).description || currentPage.exports?.description;
  if (explicitDescription) {
    return explicitDescription as string;
  }
  if (currentPage.name === 'index.html' || currentPage.name.endsWith('/index.html')) {
    return `Documentation for ${library || 'React Spectrum'}`;
  }
  return library ? `Documentation for ${pageTitle} in ${library}.` : `Documentation for ${pageTitle}.`;
};

let articleStyles = style({
  maxWidth: {
    default: 'none',
    isWithToC: 768
  },
  width: 'full',
  height: 'fit'
});


export function Layout(props: PageProps & {children: ReactElement<any>}) {
  let {pages, currentPage, children} = props;
  let hasToC = currentPage.tableOfContents?.[0]?.children && currentPage.tableOfContents[0].children.length > 0;
  return (
    <Provider elementType="html" locale="en" background="layer-1" styles={style({scrollPaddingTop: {default: 64, lg: 0}})}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="alternate" type="text/markdown" title="LLM-friendly version" href={currentPage.url.replace(/\.html$/, '.md')} />
        <link rel="icon" href="https://www.adobe.com/favicon.ico" />
        <meta name="description" content={getDescription(currentPage)} />
        <meta property="og:image" content={getOgImageUrl(currentPage)} />
        <title>{getTitle(currentPage)}</title>
      </head>
      <body
        className={style({
          margin: 0,
          padding: 0,
          overscrollBehavior: {
            default: 'auto',
            lg: 'none'
          }
        })}>
        <div
          className={style({
            isolation: 'isolate',
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
            },
            paddingBottom: 0,
            gap: {
              default: 0,
              lg: 12
            }
          })}>
          <Header pages={pages} currentPage={currentPage} />
          <MobileHeader
            toc={(currentPage.tableOfContents?.[0]?.children?.length ?? 0) > 0 ? <MobileToc key="toc" toc={currentPage.tableOfContents ?? []} currentPage={currentPage} /> : null}
            pages={pages}
            currentPage={currentPage} />
          <div className={style({display: 'flex', width: 'full'})}>
            <Nav pages={pages} currentPage={currentPage} />
            <main
              key={currentPage.url}
              style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}
              className={style({
                isolation: 'isolate',
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
                position: 'relative',
                height: {
                  lg: '[calc(100vh - 72px)]'
                },
                overflow: {
                  lg: 'auto'
                }
              })}>
              <article
                className={articleStyles({isWithToC: hasToC})}>
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
                {hasToC && (
                  <div className={style({font: 'title', minHeight: 32, paddingX: 12, display: 'flex', alignItems: 'center'})}>Contents</div>
                )}
                <Toc toc={currentPage.tableOfContents?.[0]?.children ?? []} />
              </aside>
            </main>
          </div>
        </div>
      </body>
    </Provider>
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

function MobileToc({toc, currentPage}) {
  return (
    <MobileOnPageNav currentPage={currentPage}>
      {renderMobileToc(toc)}
    </MobileOnPageNav>
  );
}

function renderMobileToc(toc: TocNode[], seen = new Map()) {
  return toc.map((c) => {
    let href = c.level === 1 ? '#top' : '#' + anchorId(c.title);
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
