import {ActionButton} from '@react-spectrum/button';
import classNames from 'classnames';
import {Content} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import path from 'path';
import {Provider} from '@react-spectrum/provider';
import RailIcon from '@spectrum-icons/workflow/Rail';
import React from 'react';
import ReactDOM from 'react-dom';
import sideNavStyles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import {theme} from '@react-spectrum/theme-default';


export function attachMobileNav() {
  let container = document.querySelector('#mobile-nav');
  let siteNav = document.querySelector('#site-nav');
  let pages = JSON.parse(siteNav.dataset.pages);
  let currentPage = undefined;
  ReactDOM.render(
    <Provider theme={theme} UNSAFE_style={{display: 'inline', background: 'none', fontFamily: 'inherit'}}>
      <DialogTrigger type="popover">
        <ActionButton aria-label="Nav" isQuiet icon={<RailIcon />} />
        <Dialog>
          <Content>
            <ul className={sideNavStyles['spectrum-SideNav']}>
              {pages.filter(p => p.name !== 'index.html').map(p => (
                <li className={classNames(sideNavStyles['spectrum-SideNav-item'], {[sideNavStyles['is-selected']]: p.name === currentPage})}>
                  <a className={sideNavStyles['spectrum-SideNav-itemLink']} href={p.url}>{path.basename(p.name, path.extname(p.name))}</a>
                </li>
              ))}
            </ul>
          </Content>
        </Dialog>
      </DialogTrigger>
    </Provider>
    , container);
}
