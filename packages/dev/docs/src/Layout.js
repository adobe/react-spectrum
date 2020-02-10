import classNames from 'classnames';
import {Divider} from '@react-spectrum/divider';
import docStyles from './docs.css';
import highlightCss from './syntax-highlight.css';
import {MDXProvider} from '@mdx-js/react';
import path from 'path';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import sideNavStyles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import {theme} from '@react-spectrum/theme-default';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';

const mdxComponents = {
  h1: ({children}) => <h1 className={classNames(typographyStyles['spectrum-Heading1--display'], typographyStyles['spectrum-Article'])}>{children}</h1>,
  h2: ({children}) => (
    <>
      <h2 className={typographyStyles['spectrum-Heading3']}>{children}</h2>
      <Divider />
    </>
  ),
  h3: ({children}) => <h3 className={typographyStyles['spectrum-Heading4']}>{children}</h3>,
  p: ({children}) => <p className={typographyStyles['spectrum-Body3']}>{children}</p>,
  code: ({children}) => <code className={typographyStyles['spectrum-Code4']}>{children}</code>,
  inlineCode: ({children}) => <code className={typographyStyles['spectrum-Code4']}>{children}</code>
};

export function Layout({scripts, styles, pages, currentPage, children}) {
  return (
    <html lang="en-US">
      <head>
        <meta charset="utf-8" />
        <script src="https://use.typekit.net/pbi5ojv.js" />
        {styles.map(s => <link rel="stylesheet" href={s.url} />)}
        {scripts.map(s => <link rel="preload" as="script" href={s.url} />)}
      </head>
      <body>
        <Provider theme={theme} colorScheme="light" scale="medium" UNSAFE_className={classNames(docStyles.provider, highlightCss.spectrum)}>
          <nav className={docStyles.nav}>
            <header>
              <a href="/">
                <img src="https://spectrum.adobe.com/static/adobe_logo-2.svg" alt="Adobe Logo" />
                <h2 className={typographyStyles['spectrum-Heading4']}>React Spectrum</h2>
              </a>
            </header>
            <ul className={sideNavStyles['spectrum-SideNav']}>
              {pages.filter(p => p.url !== '/index.html').map(p => (
                <li className={classNames(sideNavStyles['spectrum-SideNav-item'], {[sideNavStyles['is-selected']]: p.name === currentPage})}>
                  <a className={sideNavStyles['spectrum-SideNav-itemLink']} href={p.url}>{path.basename(p.name, path.extname(p.name))}</a>
                </li>
              ))}
            </ul>
          </nav>
          <main>
            <article className={typographyStyles['spectrum-Typography']}>
              <MDXProvider components={mdxComponents}>
                {children}
              </MDXProvider>
            </article>
          </main>
        </Provider>
        {scripts.map(s => <script type={s.type} src={s.url} />)}
      </body>
    </html>
  );
}
