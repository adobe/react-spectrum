import {ActionButton} from '@react-spectrum/button';
import {attachToToC} from './attachToToC';
import classNames from 'classnames';
import {BreadcrumbItem, Breadcrumbs} from '@react-spectrum/breadcrumbs';
import {Content, Header} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Divider} from '@react-spectrum/divider';
import highlightCss from './syntax-highlight.css';
import path from 'path';
import {Pressable} from '@react-aria/interactions';
import {Provider} from '@react-spectrum/provider';
import RailIcon from '@spectrum-icons/workflow/Rail';
import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import sideNavStyles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import {theme} from '@react-spectrum/theme-default';

let links = document.querySelectorAll(':not([hidden]) table a[data-link]');
for (let link of links) {
  let container = document.createElement('span');

  ReactDOM.render(
    <Provider theme={theme} UNSAFE_style={{display: 'inline', background: 'none', fontFamily: 'inherit'}}>
      <DialogTrigger type="popover">
        <Pressable>
          <a href={link.href} data-link={link.dataset.link} className={link.className} onClick={e => e.preventDefault()}>{link.textContent}</a>
        </Pressable>
        <LinkPopover id={link.dataset.link} />
      </DialogTrigger>
    </Provider>
  , container);

  link.parentNode.replaceChild(container, link);
}

function LinkPopover({id}) {
  let ref = useRef();
  let [breadcrumbs, setBreadcrumbs] = useState([document.getElementById(id)]);

  useEffect(() => {
    let links = ref.current.querySelectorAll('[data-link]');
    for (let link of links) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        setBreadcrumbs([...breadcrumbs, document.getElementById(link.dataset.link)]);
      });
    }
  }, [breadcrumbs]);

  return (
    <Dialog UNSAFE_className={highlightCss.spectrum}>
      <Header>
        <Breadcrumbs isHeading headingAriaLevel={3}>
          {breadcrumbs.map((b, i) => (
            <BreadcrumbItem
              onPress={() => setBreadcrumbs(breadcrumbs.slice(0, i + 1))}>
              {b.dataset.title}
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>
      </Header>
      <Divider size="M" />
      <Content>
        <div ref={ref} dangerouslySetInnerHTML={{__html: breadcrumbs[breadcrumbs.length -  1].innerHTML}} />
      </Content>
    </Dialog>
  );
}


function attachMobileNav() {
  let container = document.querySelector('#collapsed-nav');
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

attachMobileNav();
attachToToC();
