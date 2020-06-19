/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
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

import {attachToToC} from './attachToToC';
import {Breadcrumbs, Item} from '@react-spectrum/breadcrumbs';
import {Content, View} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Divider} from '@react-spectrum/divider';
import docsStyle from './docs.css';
import {Heading} from '@react-spectrum/text';
import highlightCss from './syntax-highlight.css';
import {Pressable} from '@react-aria/interactions';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {ThemeProvider} from './ThemeSwitcher';

let links = document.querySelectorAll(':not([hidden]) a[data-link]');
for (let link of links) {
  let container = document.createElement('span');

  ReactDOM.render(
    <ThemeProvider UNSAFE_className={docsStyle.inlineProvider}>
      <DialogTrigger type="popover">
        <Pressable>
          <a role="link" tabIndex={0} aria-haspopup="dialog" data-href={link.href} data-link={link.dataset.link} className={link.className}>{link.textContent}</a>
        </Pressable>
        <LinkPopover id={link.dataset.link} />
      </DialogTrigger>
    </ThemeProvider>
  , container);

  link.parentNode.replaceChild(container.firstElementChild, link);
}

function LinkPopover({id}) {
  let ref = useRef();
  let [breadcrumbs, setBreadcrumbs] = useState([document.getElementById(id)]);

  const onBlurHeading = useCallback((event) => {
    event.target.removeEventListener('blur', onBlurHeading);
    event.target.tabIndex = -1;
  },
  []);

  useEffect(() => {
    let links = ref.current.querySelectorAll(`.${docsStyle.popover} [data-link]`);
    for (let link of links) {
      link.href = link.dataset.href;
      link.removeAttribute('aria-haspopup');
      link.addEventListener('click', (e) => {
        e.preventDefault();
        setBreadcrumbs([...breadcrumbs, document.getElementById(link.dataset.link)]);
      });
    }
    const h3 = ref.current.closest(`.${highlightCss.spectrum}.${docsStyle.popover}`).querySelector('h3[aria-current]');
    if (h3) {
      h3.tabIndex = 0;
      h3.addEventListener('blur', onBlurHeading);
      requestAnimationFrame(() => h3.focus());
    }
  }, [breadcrumbs, onBlurHeading]);

  return (
    <Dialog UNSAFE_className={`${highlightCss.spectrum} ${docsStyle.popover}`} size="L">
      <View slot="heading">
        <Breadcrumbs onAction={(key) => setBreadcrumbs(breadcrumbs.slice(0, key))}>
          {breadcrumbs.map((b, i) => (
            <Item key={i + 1} textValue={b.dataset.title}>
              {i < (breadcrumbs.length - 1) ? b.dataset.title : <Heading level={3}>{b.dataset.title}</Heading>}
            </Item>
          ))}
        </Breadcrumbs>
      </View>
      <Divider size="M" />
      <Content>
        <div ref={ref} dangerouslySetInnerHTML={{__html: breadcrumbs[breadcrumbs.length -  1].innerHTML}} />
      </Content>
    </Dialog>
  );
}

attachToToC();
