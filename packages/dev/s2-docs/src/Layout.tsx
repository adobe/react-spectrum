import {ExampleList} from './ExampleList';
import {Nav} from '../src/Nav';
import {OptimisticMobileToc, OptimisticToc} from './OptimisticToc';
import type {Page, PageProps} from '@parcel/rsc';
import React, {ReactElement, ReactNode} from 'react';
import '../src/client';
// @ts-ignore
import reactAriaFavicon from 'url:../assets/react-aria-favicon.svg';
// @ts-ignore
import rspFavicon from 'url:../assets/rsp-favicon.svg';
import './anatomy.css';
import './footer.css';
import {ClassAPI} from './ClassAPI';
import {Code} from './Code';
import {CodeBlock, standaloneCode} from './CodeBlock';
import {CodePlatterProvider} from './CodePlatter';
import {Divider, Provider, ToastContainer} from '@react-spectrum/s2';
import {ExampleSwitcher} from './ExampleSwitcher';
import {getCurrentPage, getPages} from './getPages';
import {getLibraryFromPage, getLibraryLabel} from './library';
import {H1, H2, H3, H4, LI, P, PageDescription, SubpageHeader} from './typography';
import Header from './Header';
import {Link} from './Link';
import {Main, NavigationSuspense, Router} from './Router';
import {MobileHeader} from './MobileHeader';
import {PropTable} from './PropTable';
import {StateTable} from './StateTable';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {TypeLink} from './types';
import {VersionBadge} from './VersionBadge';
import {VisualExample} from './VisualExample';

const components = (isLongForm?: boolean) => ({
  // h1 is rendered separately
  h1: () => null,
  h2: H2,
  h3: H3,
  h4: H4,
  p: props => <P {...props} isLongForm={isLongForm} />,
  ul: (props) => <ul {...props} />,
  li: props => <LI {...props} isLongForm={isLongForm} />,
  Figure: (props) => <figure {...props} className={style({display: 'flex', flexDirection: 'column', alignItems: 'center', marginY: 32, marginX: 0})} />,
  Caption: (props) => <figcaption {...props} className={style({font: 'body-sm'})} />,
  CodeBlock: CodeBlock,
  pre: ({children, ...props}) => (
    <pre {...props} className={standaloneCode}>
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {isFencedBlock: true})
          : child
      )}
    </pre>
  ),
  code: (props) => <Code {...props} />,
  strong: ({children, ...props}) => <strong {...props} className={style({fontWeight: 'bold'})}>{children}</strong>,
  a: (props) => <Link {...props} />,
  Link,
  PageDescription,
  VisualExample,
  Keyboard: (props) => <kbd {...props} className={style({font: 'code-sm', paddingX: 4, whiteSpace: 'nowrap', backgroundColor: 'gray-100', borderRadius: 'sm'})} />,
  PropTable,
  StateTable,
  ClassAPI,
  ExampleSwitcher,
  TypeLink,
  ExampleList
});

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
  let currentURL = new URL(currentPage.url);
  let publicUrl = (process.env.PUBLIC_URL || '').replace(/\/$/, '');
  let path = currentURL.pathname || '/';
  if (path.endsWith('/')) {
    path += 'index';
  }
  return new URL(`${publicUrl}/og${path}.png`, currentURL).href;
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

const getFaviconUrl = (currentPage: Page): string => {
  const library = getLibraryFromPage(currentPage);
  switch (library) {
    case 'react-aria':
      return reactAriaFavicon;
    default:
      return rspFavicon;
  }
};

let articleStyles = style({
  maxWidth: {
    default: 768,
    isWide: 'none',
    isLongForm: 900
  },
  marginX: 'auto',
  width: 'full',
  height: 'fit',
  flexGrow: 1,
  '--text-width': {
    type: 'width',
    value: {
      default: 'auto',
      isLongForm: 600 // ~80 characters at body font size
    }
  }
});

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className={style({
        marginTop: 32,
        paddingY: 12
      })}>
      <Divider size="S" />
      <ul
        className={style({
          display: 'flex',
          justifyContent: 'end',
          flexWrap: 'wrap',
          paddingX: 12,
          margin: 0,
          marginTop: 16,
          font: 'body-2xs',
          listStyleType: 'none'
        })}>
        <li>Copyright © {year} Adobe. All rights reserved.</li>
        <li><Link isQuiet href="//www.adobe.com/privacy.html" variant="secondary">Privacy</Link></li>
        <li><Link isQuiet href="//www.adobe.com/legal/terms.html" variant="secondary">Terms of Use</Link></li>
        <li><Link isQuiet href="//www.adobe.com/privacy/cookies.html" variant="secondary">Cookies</Link></li>
        <li><Link isQuiet href="//www.adobe.com/privacy/ca-rights.html" variant="secondary">Do not sell my personal information</Link></li>
      </ul>
    </footer>
  );
}

export async function Layout(props: PageProps & {children: ReactElement<any>}) {
  let {children} = props;
  let pages = await getPages();
  let currentPage = getCurrentPage(props.currentPage);
  let isToastPage = currentPage.name === 's2/Toast';
  let isSubpage = currentPage.exports?.isSubpage;
  let section = currentPage.exports?.section;
  let isLongForm = isSubpage && section === 'Blog';
  let hasToC = (!currentPage.exports?.hideNav || section === 'Blog' || section === 'Releases') && currentPage.tableOfContents?.[0]?.children && currentPage.tableOfContents?.[0]?.children?.length > 0;
  let isWide = !hasToC && !isLongForm && section !== 'Blog' && section !== 'Releases';
  let library = getLibraryLabel(getLibraryFromPage(currentPage));
  let keywords = [...new Set((currentPage.exports?.keywords ?? []).concat([library]).filter(k => !!k))];
  let ogImage = getOgImageUrl(currentPage);
  let title = getTitle(currentPage);
  let description = getDescription(currentPage);
  let parentUrl = new URL('./', currentPage.url);
  let parentIndex = parentUrl.href;
  let parentPageUrl = parentUrl.href.slice(0, -1);
  let parentPage = pages.find(p => p.url === parentIndex || p.url === parentPageUrl);
  let isPostList = currentPage.exports?.isPostList;
  let Content = isPostList ? PostListContainer : Article;
  return (
    <Router currentPage={currentPage} pages={pages}>
      <Provider elementType="html" locale="en" background="layer-1" styles={style({scrollPaddingTop: {default: 64, lg: 0}})}>
        <head>
          <meta charSet="utf-8" />
          <title>{title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="alternate" type="text/markdown" title="LLM-friendly version" href={currentPage.url.replace(/\.html$/, '.md')} />
          <link rel="icon" href={getFaviconUrl(currentPage)} />
          <meta name="description" content={description} />
          {keywords.length > 0 ? <meta name="keywords" content={keywords.join(',')} /> : null}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content={ogImage} />
          <meta property="og:title" content={title} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={currentPage.url} />
          <meta property="og:image" content={ogImage} />
          <meta property="og:description" content={description} />
          <meta property="og:locale" content="en_US" />
          <link rel="canonical" href={currentPage.url} />
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
                lg: 1440
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
              },
              minHeight: {
                default: 'screen',
                lg: 'auto'
              }
            })}>
            <Header />
            <MobileHeader toc={(currentPage.tableOfContents?.[0]?.children?.length ?? 0) <= 1 ? null : <OptimisticMobileToc />} />
            <div className={style({display: 'flex', width: 'full', flexGrow: {default: 1, lg: 0}})}>
              <Nav />
              <Main
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
                  columnGap: {
                    default: 12,
                    lg: 40
                  },
                  position: 'relative',
                  height: {
                    lg: '[calc(100vh - 72px)]'
                  },
                  overflow: {
                    lg: 'auto'
                  }
                })}>
                <div
                  className={style({
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    minWidth: 0,
                    width: 'full'
                  })}>
                  <CodePlatterProvider library={getLibraryFromPage(currentPage)}>
                    <NavigationSuspense>
                      <Content page={currentPage} parentPage={parentPage} isLongForm={isLongForm} isWide={isWide}>
                        {React.cloneElement(children, {
                          components: components(isLongForm),
                          pages
                        })}
                      </Content>
                    </NavigationSuspense>
                  </CodePlatterProvider>
                  <Footer />
                </div>
                <OptimisticToc />
              </Main>
            </div>
          </div>
          {!isToastPage && <ToastContainer placement="bottom" />}
        </body>
      </Provider>
    </Router>
  );
}

interface ArticleProps {
  page: Page,
  parentPage?: Page,
  children: ReactNode,
  isLongForm?: boolean,
  isWide?: boolean
}

function Article({page, parentPage, children, isLongForm, isWide}: ArticleProps) {
  let section = page.exports?.section;
  return (
    <article
      className={articleStyles({isLongForm, isWide})}
      itemScope
      itemType={`https://schema.org/${section === 'Blog' || section === 'Releases' ? 'BlogPosting' : 'TechArticle'}`}>
      <meta itemProp="description" content={getDescription(page)} />
      <meta itemProp="image" content={getOgImageUrl(page)} />
      <div itemProp="publisher" itemScope itemType="https://schema.org/Organization" hidden>
        <meta itemProp="name" content="Adobe" />
        <meta itemProp="url" content="https://www.adobe.com" />
        <meta itemProp="logo" content="https://www.adobe.com/favicon.ico" />
      </div>
      {page.exports?.version && <VersionBadge version={page.exports.version} />}
      {page.exports?.isSubpage
        ? <SubpageHeader currentPage={page} parentPage={parentPage} isLongForm={isLongForm} />
        : page.tableOfContents?.[0]?.level === 1 && <H1 itemProp="headline" isLongForm={isLongForm}>{page.tableOfContents?.[0].title}</H1>
      }
      <div
        className={style({display: 'contents'})}
        itemProp="articleBody">
        {children}
      </div>
      {page.exports?.relatedPages && (
        <MobileRelatedPages pages={page.exports.relatedPages} />
      )}
    </article>
  );
}

function PostListContainer({page, children, isLongForm, isWide}: ArticleProps) {
  return (
    <div className={articleStyles({isLongForm, isWide})}>
      {page.tableOfContents?.[0]?.level === 1 && <H1 isLongForm={isLongForm}>{page.tableOfContents?.[0].title}</H1>}
      {children}
    </div>
  );
}

function isExternalUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

function MobileRelatedPages({pages}: {pages: Array<{title: string, url: string}>}) {
  return (
    <div
      className={style({
        display: {
          default: 'block',
          lg: 'none'
        }
      })}>
      <H2 id="related-pages">Related pages</H2>
      <ul>
        {pages.map((page, i) => {
          let isExternal = isExternalUrl(page.url);
          return (
            <LI key={i}>
              <Link
                href={page.url}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}>
                {page.title}
              </Link>
            </LI>
          );
        })}
      </ul>
    </div>
  );
}
