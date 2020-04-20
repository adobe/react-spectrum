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

import {ActionButton} from '@react-spectrum/button';
import {attachToToC} from './attachToToC';
import {Breadcrumbs, Item} from '@react-spectrum/breadcrumbs';
import {Content, View} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Divider} from '@react-spectrum/divider';
import docsStyle from './docs.css';
import highlightCss from './syntax-highlight.css';
import {Pressable} from '@react-aria/interactions';
import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import ShowMenu from '@spectrum-icons/workflow/ShowMenu';
import {ThemeProvider, ThemeSwitcher} from './ThemeSwitcher';

let links = document.querySelectorAll(':not([hidden]) a[data-link]');
for (let link of links) {
  let container = document.createElement('span');

  ReactDOM.render(
    <ThemeProvider UNSAFE_className={docsStyle.inlineProvider}>
      <DialogTrigger type="popover">
        <Pressable>
          <a href={link.href} data-link={link.dataset.link} className={link.className} onClick={e => e.preventDefault()}>{link.textContent}</a>
        </Pressable>
        <LinkPopover id={link.dataset.link} />
      </DialogTrigger>
    </ThemeProvider>
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
    <Dialog UNSAFE_className={highlightCss.spectrum} size="L">
      <View slot="heading">
        <Breadcrumbs isHeading headingAriaLevel={3} onAction={(key) => setBreadcrumbs(breadcrumbs.slice(0, key))}>
          {breadcrumbs.map((b, i) => (
            <Item uniqueKey={i + 1}>
              {b.dataset.title}
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

function Hamburger() {
  let onPress = () => {
    document.querySelector('.' + docsStyle.nav).classList.toggle(docsStyle.visible);
  };

  useEffect(() => {
    let nav = document.querySelector('.' + docsStyle.nav);
    let main = document.querySelector('main');
    let onClick = () => {
      nav.classList.remove(docsStyle.visible);
    };

    main.addEventListener('click', onClick);
    return () => {
      main.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <ActionButton onPress={onPress}>
      <ShowMenu />
    </ActionButton>
  );
}

ReactDOM.render(<>
  <Hamburger />
  <ThemeSwitcher />
</>, document.getElementById('header'));

attachToToC();
