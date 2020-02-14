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
import {BreadcrumbItem, Breadcrumbs} from '@react-spectrum/breadcrumbs';
import {Content, Header} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Divider} from '@react-spectrum/divider';
import highlightCss from './syntax-highlight.css';
import {Pressable} from '@react-aria/interactions';
import {Provider} from '@react-spectrum/provider';
import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
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

attachToToC();
