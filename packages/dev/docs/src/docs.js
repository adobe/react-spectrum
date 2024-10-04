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
import {Button} from 'react-aria-components';
import {Content, View} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Divider} from '@react-spectrum/divider';
import docsStyle from './docs.css';
import {FocusScope} from '@react-aria/focus';
import highlightCss from './syntax-highlight.css';
import {Modal} from '@react-spectrum/overlays';
import {Pressable} from '@react-aria/interactions';
import React, {useRef, useState} from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider} from './ThemeSwitcher';
import {useLayoutEffect} from '@react-aria/utils';
import {useOverlayTriggerState} from 'react-stately';

let links = document.querySelectorAll('a[data-link]');
let images = document.querySelectorAll('img[data-img]');

for (let link of links) {
  if (link.closest('[hidden]')) {
    continue;
  }

  let container = document.createElement('span');

  ReactDOM.createRoot(container).render(
    <ThemeProvider UNSAFE_className={docsStyle.inlineProvider}>
      <DialogTrigger type="popover">
        <Pressable>
          {/* eslint-disable jsx-a11y/click-events-have-key-events */}
          {/* eslint-disable jsx-a11y/anchor-is-valid */}
          <a role="button" tabIndex={0} aria-haspopup="dialog" data-link={link.dataset.link} className={link.className} onClick={e => e.preventDefault()}>{link.textContent}</a>
        </Pressable>
        <LinkPopover id={link.dataset.link} />
      </DialogTrigger>
    </ThemeProvider>
  );

  link.parentNode.replaceChild(container, link);
}

function ImageModal({children}) {
  let [trigger, contents] = React.Children.toArray(children);
  let state = useOverlayTriggerState({});

  trigger = React.cloneElement(trigger, {onPress: () => state.setOpen(true)});
  return (
    <>
      {trigger}
      <Modal isDismissable state={state} onClose={() => state.close()} UNSAFE_style={{overflow: 'scroll'}}>
        <FocusScope contain restoreFocus autoFocus>
          {contents}
        </FocusScope>
      </Modal>
    </>
  );
}

for (let image of images) {
  let container = document.createElement('span');
  let url = image.src.replace(/.*\/\/[^/]*/, '');
  let style = {};
  for (let key of image.style) {
    style[key.replace(/-([a-z])/g, (_, m) => m.toUpperCase())] = image.style[key];
  }

  ReactDOM.createRoot(container).render(
    <ThemeProvider UNSAFE_className={docsStyle.inlineProvider}>
      <ImageModal>
        <Button className={docsStyle.expandableImageButton}>
          <img src={url} className={image.className} alt={image.alt} style={style} />
        </Button>
        <div role="dialog" tabIndex={0}>
          <img src={url} alt={image.alt} />
        </div>
      </ImageModal>
    </ThemeProvider>
  );

  image.parentNode.replaceChild(container, image);
}

function LinkPopover({id}) {
  let ref = useRef();
  let breadcrumbsRef = useRef();
  let [breadcrumbs, setBreadcrumbs] = useState([document.getElementById(id)]);

  useLayoutEffect(() => {
    // Update links within the rendered popover content, so that when clicked
    // they will open as the new current breadcrumb and popover content.
    let links = ref.current.querySelectorAll('[data-link]');
    for (let link of links) {
      // Links with [data-link] will open within the LinkPopover, so [aria-haspopup] is not appropriate.
      link.removeAttribute('aria-haspopup');
      // Add click event handler so that the link updates the content of the popover.
      link.addEventListener('click', (e) => {
        e.preventDefault();
        setBreadcrumbs([...breadcrumbs, document.getElementById(link.dataset.link)]);
      });
    }
  }, [breadcrumbs]);

  return (
    <Dialog aria-label={breadcrumbs[breadcrumbs.length - 1].dataset.title} UNSAFE_className={`${highlightCss.spectrum} ${docsStyle.popover}`} size="L">
      <View slot="heading">
        <Breadcrumbs
          ref={breadcrumbsRef}
          onAction={(key) => setBreadcrumbs(breadcrumbs.slice(0, key))}
          autoFocusCurrent>
          {breadcrumbs.map((b, i) => (
            <Item key={i + 1}>
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

attachToToC();
