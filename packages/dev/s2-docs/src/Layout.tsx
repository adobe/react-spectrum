import {Byline, Time} from './PostList';
import {ExampleList} from './ExampleList';
import {Nav} from '../src/Nav';
import {OptimisticMobileToc, OptimisticToc} from './OptimisticToc';
import type {Page, PageProps} from '@parcel/rsc';
import React, {ReactElement, ReactNode} from 'react';
import '../src/client';
// @ts-ignore
import internationalizedFavicon from 'url:../assets/internationalized.ico';
// @ts-ignore
import reactAriaFavicon from 'url:../assets/react-aria.ico';
import './anatomy.css';
import './footer.css';
import ChevronRightIcon from '@react-spectrum/s2/icons/ChevronRight';
import {ClassAPI} from './ClassAPI';
import {Code} from './Code';
import {CodeBlock} from './CodeBlock';
import {CodePlatterProvider} from './CodePlatter';
import {Divider, Provider, UNSTABLE_ToastContainer as ToastContainer} from '@react-spectrum/s2';
import {ExampleSwitcher} from './ExampleSwitcher';
import {getLibraryFromPage, getLibraryFromUrl, getLibraryLabel} from './library';
import {H1, H2, H3, H4} from './Headings';
import Header from './Header';
import {iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Link, TitleLink} from './Link';
import {MobileHeader} from './MobileHeader';
import {NavigationSuspense} from './NavigationSuspense';
import {PropTable} from './PropTable';
import {StateTable} from './StateTable';
import {TypeLink} from './types';
import {VersionBadge} from './VersionBadge';
import {VisualExample} from './VisualExample';

const p = style({
  font: 'body-lg',
  fontFamily: {
    default: 'sans',
    isLongForm: 'serif'
  },
  textWrap: 'pretty',
  marginY: '[1lh]',
  maxWidth: '--text-width',
  marginX: 'auto'
});

const li = style({
  font: 'body-lg',
  fontFamily: {
    default: 'sans',
    isLongForm: 'serif'
  },
  textWrap: 'pretty',
  marginY: {
    default: 0,
    isLongForm: 8
  },
  maxWidth: '--text-width',
  marginX: 'auto'
});

const components = (isLongForm?: boolean) => ({
  // h1 is rendered separately
  h1: () => null,
  h2: H2,
  h3: H3,
  h4: H4,
  p: ({children, ...props}) => <p {...props} className={p({isLongForm})}>{children}</p>,
  ul: (props) => <ul {...props} />,
  li: ({children, ...props}) => <li {...props} className={li({isLongForm})}>{children}</li>,
  Figure: (props) => <figure {...props} className={style({display: 'flex', flexDirection: 'column', alignItems: 'center', marginY: 32, marginX: 0})} />,
  Caption: (props) => <figcaption {...props} className={style({font: 'body-sm'})} />,
  CodeBlock: CodeBlock,
  code: (props) => <Code {...props} />,
  strong: ({children, ...props}) => <strong {...props} className={style({fontWeight: 'bold'})}>{children}</strong>,
  a: (props) => <Link {...props} />,
  PageDescription: ({children, ...props}) => <p {...props} className={style({font: 'body-xl', maxWidth: '--text-width', marginX: 'auto', marginTop: 8, marginBottom: 24})}>{children}</p>,
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
  let publicUrl = process.env.PUBLIC_URL || '/';
  if (!publicUrl.endsWith('/')) {
    publicUrl += '/';
  }
  return publicUrl + 'og/' + currentPage.url.replace(publicUrl, '').replace(/\.html$/, '.png');
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
    case 'internationalized':
      return internationalizedFavicon;
    default:
      return 'https://www.adobe.com/favicon.ico';
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

export function Layout(props: PageProps & {children: ReactElement<any>}) {
  let {pages, currentPage, children} = props;
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
  let parentUrl;
  let parentPage;
  if (isSubpage) {
    let pathParts = currentPage.url.split('/');
    let fileName = pathParts.pop();

    if (fileName === 'testing.html') {
      // for testing pages like /CheckboxGroup/testing.html, parent is /CheckboxGroup.html
      let parentDir = pathParts.pop();
      parentUrl = `../${parentDir}.html`;

      let parentPageUrl = pathParts.join('/') + `/${parentDir}.html`;
      parentPage = pages.find(p => p.url === parentPageUrl);
    } else {
      // for release subpages like releases/2024-01-15.html, parent is just the same but with the end replaced with index.html
      parentUrl = './index.html';
      let parentIndexUrl = pathParts.join('/') + '/index.html';
      parentPage = pages.find(p => p.url === parentIndexUrl);
    }
  }

  let isPostList = currentPage.exports?.isPostList;
  let Content = isPostList ? PostListContainer : Article;
  return (
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
          <Header pages={pages} currentPage={currentPage} />
          <MobileHeader
            toc={<OptimisticMobileToc currentPage={currentPage} pages={pages} />}
            pages={pages}
            currentPage={currentPage} />
          <div className={style({display: 'flex', width: 'full', flexGrow: {default: 1, lg: 0}})}>
            {currentPage.exports?.hideNav ? null : <Nav pages={pages} currentPage={currentPage} />}
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
                <CodePlatterProvider library={getLibraryFromUrl(currentPage.url)}>
                  <NavigationSuspense pages={pages}>
                    <Content page={currentPage} parentPage={parentPage} isLongForm={isLongForm} isWide={isWide} parentHref={parentUrl}>
                      {React.cloneElement(children, {
                        components: components(isLongForm),
                        pages
                      })}
                    </Content>
                  </NavigationSuspense>
                </CodePlatterProvider>
                <Footer />
              </div>
              {hasToC && <aside
                className={style({
                  position: 'sticky',
                  top: 0,
                  paddingTop: 32,
                  marginBottom: -40,
                  boxSizing: 'border-box',
                  width: 180,
                  flexShrink: 0,
                  display: {
                    default: 'none',
                    lg: 'flex'
                  },
                  flexDirection: 'column'
                })}>
                <OptimisticToc currentPage={currentPage} pages={pages} />
              </aside>}
            </main>
          </div>
        </div>
        <ToastContainer placement="bottom" />
      </body>
    </Provider>
  );
}

interface ArticleProps {
  page: Page,
  parentPage?: Page,
  children: ReactNode,
  isLongForm?: boolean,
  isWide?: boolean,
  parentHref?: string
}

function Article({page, parentPage, children, isLongForm, isWide, parentHref}: ArticleProps) {
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
        ? <SubpageHeader currentPage={page} parentPage={parentPage} isLongForm={isLongForm} parentHref={parentHref} />
        : page.tableOfContents?.[0].level === 1 && <H1 itemProp="headline" isLongForm={isLongForm}>{page.tableOfContents?.[0].title}</H1>
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
      {page.tableOfContents?.[0].level === 1 && <H1 isLongForm={isLongForm}>{page.tableOfContents?.[0].title}</H1>}
      {children}
    </div>
  );
}

interface SubpageHeaderProps {
  currentPage: Page,
  parentPage?: Page,
  isLongForm?: boolean,
  parentHref?: string
}

function SubpageHeader({currentPage, parentPage, isLongForm, parentHref}: SubpageHeaderProps) {
  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '--text-width', marginX: 'auto', marginBottom: 40})}>
      <div className={style({display: 'flex', alignItems: 'center', gap: 2})}>
        <TitleLink href={parentHref ?? './index.html'}>{parentPage?.exports?.title ?? parentPage?.tableOfContents?.[0]?.title ?? parentPage?.name}</TitleLink>
        <ChevronRightIcon styles={iconStyle({size: 'XS'})} />
      </div>
      <H1 itemProp="headline" isLongForm={isLongForm}>{currentPage.tableOfContents?.[0].title}</H1>
      {currentPage.exports?.author && <Byline author={currentPage.exports.author} authorLink={currentPage.exports.authorLink} date={currentPage.exports.date} />}
      {currentPage.exports?.date && !currentPage.exports?.author && <Time date={currentPage.exports.date} />}
    </div>
  );
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
      <H2>Related pages</H2>
      <ul>
        {pages.map((page, i) => (
          <li key={i} className={li({isLongForm: false})}>
            <Link href={page.url}>
              {page.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
