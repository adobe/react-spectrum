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
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import sideNavStyles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import {theme} from '@react-spectrum/theme-default';
import {ToC} from './ToC';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';

const mdxComponents = {
  h1: ({children, ...props}) => (
    <h1 {...props} className={classNames(typographyStyles['spectrum-Heading1--display'], typographyStyles['spectrum-Article'])}>
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
      <Divider />
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
  inlineCode: ({children, ...props}) => <code {...props} className={typographyStyles['spectrum-Code4']}>{children}</code>
};

export function Layout({scripts, styles, pages, currentPage, publicUrl, children, toc}) {
  return (
    <html lang="en-US">
      <head>
        <meta charset="utf-8" />
        <script src="https://use.typekit.net/pbi5ojv.js" />
        {styles.map(s => <link rel="stylesheet" href={s.url} />)}
        {scripts.map(s => <link rel="preload" as="script" href={s.url} crossOrigin="" />)}
      </head>
      <body>
        <Provider theme={theme} colorScheme="light" scale="medium" UNSAFE_className={classNames(docStyles.provider, highlightCss.spectrum)}>
          <nav className={docStyles.nav}>
            <header>
              <a href={publicUrl}>
                <img src="https://spectrum.adobe.com/static/adobe_logo-2.svg" alt="Adobe Logo" />
                <h2 className={typographyStyles['spectrum-Heading4']}>React Spectrum</h2>
              </a>
            </header>
            <ul className={sideNavStyles['spectrum-SideNav']}>
              {pages.filter(p => p.name !== 'index.html').map(p => (
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
            <ToC toc={toc} />
          </main>
        </Provider>
        {scripts.map(s => <script type={s.type} src={s.url} />)}
      </body>
    </html>
  );
}
