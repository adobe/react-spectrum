import {ExampleList} from './ExampleList';
import {Nav} from '../src/Nav';
import {OptimisticMobileToc, OptimisticToc} from './OptimisticToc';
import type {Page, PageProps} from '@parcel/rsc';
import React, {ReactElement} from 'react';
// @ts-ignore
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
import {getTextWidth} from './textWidth';
import {H2, H3, H4} from './Headings';
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

const h1 = style({
  font: 'heading-3xl',
  fontSize: {
    // On mobile, adjust heading to fit in the viewport, and clamp between a min and max font size.
    default: 'clamp(35px, (100vw - 32px) / var(--width-per-em), 55px)',
    lg: 'heading-3xl'
  },
  marginY: 0
});

const components = {
  h1: ({children, ...props}) => <h1 {...props} id="top" style={{'--width-per-em': getTextWidth(children)} as any} className={h1}>{children}</h1>,
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
  TypeLink,
  ExampleList
};

const subPageComponents = (previousPage?: Page) => ({
  ...components,
  h1: ({children, ...props}) => (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 4})}>
      <div className={style({display: 'flex', alignItems: 'center', gap: 8})}>
        <TitleLink href="./index.html">{previousPage?.exports?.title}</TitleLink>
        <ChevronRightIcon styles={iconStyle({size: 'M'})} />
      </div>
      <h1 {...props} id="top" style={{'--width-per-em': getTextWidth(children)} as any} className={h1}>{children}</h1>
    </div>
  )
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
    default: 'none',
    isWithToC: 768
  },
  width: 'full',
  height: 'fit'
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
  let hasToC = !currentPage.exports?.hideNav && currentPage.tableOfContents?.[0]?.children && currentPage.tableOfContents?.[0]?.children?.length > 0;
  let library = getLibraryLabel(getLibraryFromPage(currentPage));
  let keywords = [...new Set((currentPage.exports?.keywords ?? []).concat([library]).filter(k => !!k))];
  let ogImage = getOgImageUrl(currentPage);
  let title = getTitle(currentPage);
  let description = getDescription(currentPage);
  let isSubpage = currentPage.exports?.isSubpage;
  let parentPage = pages.find(p => {
    return p.url === currentPage.url.replace(/\/[^/]+\.html$/, '/index.html');
  });
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(
            {
              '@context': 'http://schema.org',
              '@type': 'Article',
              author: 'Adobe Inc',
              headline: title,
              description: description,
              image: ogImage,
              publisher: {
                '@type': 'Organization',
                url: 'https://www.adobe.com',
                name: 'Adobe',
                logo: 'https://www.adobe.com/favicon.ico'
              }
            }
          )}} />
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
                  width: 'full'
                })}>
                <CodePlatterProvider library={getLibraryFromUrl(currentPage.url)}>
                  <NavigationSuspense pages={pages}>
                    <article
                      className={articleStyles({isWithToC: hasToC})}>
                      {currentPage.exports?.version && <VersionBadge version={currentPage.exports.version} />}
                      {React.cloneElement(children, {
                        components: isSubpage ?
                          subPageComponents(parentPage) :
                          components,
                        pages
                      })}
                      {currentPage.exports?.relatedPages && (
                        <MobileRelatedPages pages={currentPage.exports.relatedPages} />
                      )}
                    </article>
                  </NavigationSuspense>
                </CodePlatterProvider>
                <Footer />
              </div>
              {hasToC && <aside
                className={style({
                  position: 'sticky',
                  top: 0,
                  height: {
                    default: 'fit',
                    lg: '[calc(100vh - 72px)]'
                  },
                  paddingY: 32,
                  paddingX: 4,
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

function MobileRelatedPages({pages}: {pages: Array<{title: string, url: string}>}) {
  const P = components.p;
  const Li = components.li;
  const Ul = components.ul;

  return (
    <div
      className={style({
        display: {
          default: 'block',
          lg: 'none'
        }
      })}>
      <H2>Related pages</H2>
      <Ul>
        {pages.map((page, i) => (
          <Li key={i}>
            <P>
              <Link href={page.url}>
                {page.title}
              </Link>
            </P>
          </Li>
        ))}
      </Ul>
    </div>
  );
}
export function Time({date}: {date: string}) {
  let dateObj = new Date(date);
  return (
    <time
      dateTime={date}
      className={style({font: 'detail'})}>
      {dateObj.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}
    </time>
  );
}
