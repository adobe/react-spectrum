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
  inlineCode: ({children, ...props}) => <code {...props} className={typographyStyles['spectrum-Code4']}>{children}</code>,
  a: ({children, ...props}) => <a {...props} className={linkStyle['spectrum-Link']} target={getTarget(props.href)}>{children}</a>
};

function getTarget(href) {
  if (/localhost|reactspectrum\.blob\.core\.windows\.net|react-spectrum\.(corp\.)?adobe\.com/.test(href)) {
    return null;
  }

  return '_blank';
}

export function Layout({scripts, styles, pages, currentPage, publicUrl, children, toc}) {
  return (
    <html lang="en-US" dir="ltr" className={classNames(theme.global.spectrum, theme.light['spectrum--light'], theme.medium['spectrum--medium'], typographyStyles.spectrum, docStyles.provider, highlightCss.spectrum)}>
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
        <script src="https://use.typekit.net/pbi5ojv.js" />
        {styles.map(s => <link rel="stylesheet" href={s.url} />)}
        {scripts.map(s => <link rel="preload" as="script" href={s.url} crossOrigin="" />)}
      </head>
      <body>
        <div className={docStyles.pageHeader} id="header" />
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
        {scripts.map(s => <script type={s.type} src={s.url} />)}
      </body>
    </html>
  );
}
