import docStyles from './docs.css';
import path from 'path';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import sideNavStyles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import {theme} from '@react-spectrum/theme-default';

export function Layout({scripts, styles, pages, children}) {
  return (
    <html lang="en-US">
      <head>
        <meta charset="utf-8" />
        {styles.map(s => <link rel="stylesheet" href={s.url} />)}
        {scripts.map(s => <link rel="preload" as="script" href={s.url} />)}
      </head>
      <body>
        <Provider theme={theme} colorScheme="light" scale="medium" UNSAFE_className={docStyles.provider}>
          <nav className={docStyles.nav}>
            <ul className={sideNavStyles['spectrum-SideNav']}>
              {pages.map(p => (
                <li className={sideNavStyles['spectrum-SideNav-item']}>
                  <a className={sideNavStyles['spectrum-SideNav-itemLink']} href={p.url}>{path.basename(p.name, path.extname(p.name))}</a>
                </li>
              ))}
            </ul>
          </nav>
          <main>
            <article>{children}</article>
          </main>
        </Provider>
        {scripts.map(s => <script type={s.type} src={s.url} />)}
      </body>
    </html>
  );
}
