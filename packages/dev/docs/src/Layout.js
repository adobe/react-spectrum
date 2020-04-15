/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import classNames from 'classnames';
import {Divider} from '@react-spectrum/divider';
import docStyles from './docs.css';
import highlightCss from './syntax-highlight.css';
import linkStyle from '@adobe/spectrum-css-temp/components/link/vars.css';
import {MDXProvider} from '@mdx-js/react';
import path from 'path';
import React from 'react';
import sideNavStyles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import {theme} from '@react-spectrum/theme-default';
import {ToC} from './ToC';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';

const mdxComponents = {
  h1: ({children, ...props}) => (
    <h1 {...props} className={classNames(typographyStyles['spectrum-Heading1--display'], typographyStyles['spectrum-Article'], docStyles['articleHeader'])}>
      {children}
    </h1>
  ),
  h2: ({children, ...props}) => (
    <>
      <h2 {...props} className={classNames(typographyStyles['spectrum-Heading3'], docStyles['sectionHeader'], docStyles['docsHeader'])}>
        {children}
        <span className={classNames(docStyles['headingAnchor'])}>
          <a className={classNames(linkStyle['spectrum-Link'], docStyles['anchor'])} href={`#${props.id}`}>#</a>
        </span>
      </h2>
      <Divider marginBottom="33px" />
    </>
  ),
  h3: ({children, ...props}) => (
    <h3 {...props} className={classNames(typographyStyles['spectrum-Heading4'], docStyles['sectionHeader'], docStyles['docsHeader'])}>
      {children}
      <span className={docStyles['headingAnchor']}>
        <a className={classNames(linkStyle['spectrum-Link'], docStyles['anchor'])} href={`#${props.id}`} aria-label="§">#</a>
      </span>
    </h3>
  ),
  p: ({children, ...props}) => <p {...props} className={typographyStyles['spectrum-Body3']}>{children}</p>,
  code: ({children, ...props}) => <code {...props} className={typographyStyles['spectrum-Code4']}>{children}</code>,
  inlineCode: ({children, ...props}) => <code {...props} className={typographyStyles['spectrum-Code4']}>{children}</code>,
  a: ({children, ...props}) => <a {...props} className={linkStyle['spectrum-Link']} target={getTarget(props.href)}>{children}</a>
};

function getTarget(href) {
  if (/localhost|reactspectrum\.blob\.core\.windows\.net|react-spectrum\.(corp\.)?adobe\.com/.test(href)) {
    return null;
  }

  if (/^\//.test(href)) {
    return null;
  }

  return '_blank';
}

function Html({children}) {
  return (
    <html
      lang="en-US"
      dir="ltr"
      className={classNames(
        theme.global.spectrum,
        theme.light['spectrum--light'],
        theme.medium['spectrum--medium'],
        typographyStyles.spectrum,
        docStyles.provider,
        highlightCss.spectrum)}>
      {children}
    </html>
  );
}

function Head({scripts, styles}) {
  return (
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {/* Server rendering means we cannot use a real <Provider> component to do this.
          Instead, we apply the default theme classes to the html element. In order to
          prevent a flash between themes when loading the page, an inline script is put
          as close to the top of the page as possible to switch the theme as soon as
          possible during loading. It also handles when the media queries update, or
          local storage is updated. */}
      <script 
        dangerouslySetInnerHTML={{__html: `(() => {
          let classList = document.documentElement.classList;
          let dark = window.matchMedia('(prefers-color-scheme: dark)');
          let fine = window.matchMedia('(any-pointer: fine)');
          let update = () => {
            if (localStorage.theme === "dark" || (!localStorage.theme && dark.matches)) {
              classList.remove("${theme.light['spectrum--light']}");
              classList.add("${theme.dark['spectrum--dark']}");
            } else {
              classList.add("${theme.light['spectrum--light']}");
              classList.remove("${theme.dark['spectrum--dark']}");
            }

            if (!fine.matches) {
              classList.remove("${theme.medium['spectrum--medium']}");
              classList.add("${theme.large['spectrum--large']}");
            } else {
              classList.add("${theme.medium['spectrum--medium']}");
              classList.remove("${theme.large['spectrum--large']}");
            }
          };
          
          update();
          dark.addListener(update);
          fine.addListener(update);
          window.addEventListener('storage', update);
        })();
      `.replace(/\n|\s{2,}/g, '')}} />
      <link rel="stylesheet" href="https://use.typekit.net/uma8ayv.css" />
      <link rel="preload" as="font" href="https://use.typekit.net/af/eaf09c/000000000000000000017703/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3" crossOrigin="" />
      <link rel="preload" as="font" href="https://use.typekit.net/af/cb695f/000000000000000000017701/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3" crossOrigin="" />
      <link rel="preload" as="font" href="https://use.typekit.net/af/505d17/00000000000000003b9aee44/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n9&v=3" crossOrigin="" />
      <link rel="preload" as="font" href="https://use.typekit.net/af/74ffb1/000000000000000000017702/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=i4&v=3" crossOrigin="" />
      {styles.map(s => <link rel="stylesheet" href={s.url} />)}
      {scripts.map(s => <link rel="preload" as="script" href={s.url} crossOrigin="" />)}
    </head>
  );
}

function Body({children, scripts}) {
  return (
    <body>
      {children}
      {scripts.map(s => <script type={s.type} src={s.url} />)}
    </body>
  );
}

function Nav({currentPage, pages, publicUrl}) {
  let isIndex = /index\.html$/;
  let currentParts = currentPage.split('/');
  let currentDir = currentParts[0];
  pages = pages.filter(p => {
    let pageParts = p.name.split('/');
    let pageDir = pageParts[0];

    if (currentParts.length > 1) {
      return currentDir === pageDir && !isIndex.test(p.name);
    }

    if (currentParts.length === 1 && pageParts.length > 1 && isIndex.test(p.name)) {
      return true;
    }
    return !isIndex.test(p.name) && pageParts.length === 1;
  }).map(p => {
    if (isIndex.test(p.name)) {
      p.title = p.name
        .split('/')[0]
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    } else {
      p.title = path.basename(p.name, path.extname(p.name));
    }
    return p;
  })

  return (
    <nav className={docStyles.nav}>
      <header>
        <a href={publicUrl}>
          <svg viewBox="0 0 30 26" fill="#E1251B">
            <polygon points="19,0 30,0 30,26" />
            <polygon points="11.1,0 0,0 0,26" />
            <polygon points="15,9.6 22.1,26 17.5,26 15.4,20.8 10.2,20.8" />
          </svg>
          <h2 className={typographyStyles['spectrum-Heading4']}>React Spectrum</h2>
        </a>
      </header>
      <ul className={sideNavStyles['spectrum-SideNav']}>
        {pages.map(p => (
          <li className={classNames(sideNavStyles['spectrum-SideNav-item'], {[sideNavStyles['is-selected']]: p.name === currentPage})}>
            <a className={sideNavStyles['spectrum-SideNav-itemLink']} href={p.url}>{p.title}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Layout({scripts, styles, pages, currentPage, publicUrl, children, toc}) {
  return (
    <Html>
      <Head scripts={scripts} styles={styles} />
      <Body scripts={scripts}>
        <div className={docStyles.pageHeader} id="header" />
        <Nav currentPage={currentPage} pages={pages} publicUrl={publicUrl} />
        <main>
          <article className={typographyStyles['spectrum-Typography']}>
            <MDXProvider components={mdxComponents}>
              {children}
            </MDXProvider>
          </article>
          <ToC toc={toc} />
        </main>
      </Body>
    </Html>
  );
}
