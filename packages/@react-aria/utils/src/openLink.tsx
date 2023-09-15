/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {focusWithoutScrolling, isWebKit} from './index';
import {LinkDOMProps} from '@react-types/shared';
import React, {createContext, ReactNode, useContext, useMemo} from 'react';

interface Router {
  open: (target: Element, modifiers: Modifiers) => void
}

const RouterContext = createContext<Router>({
  open: openSyntheticLink
});

interface RouterProviderProps {
  navigate: (path: string) => void,
  children: ReactNode
}

export function RouterProvider(props: RouterProviderProps) {
  let {children, navigate} = props;

  let ctx = useMemo(() => ({
    open: (target: Element, modifiers: Modifiers) => {
      getSyntheticLink(target, link => {
        if (
          (!link.target || link.target === '_self') &&
          link.origin === location.origin &&
          !link.hasAttribute('download') &&
          !modifiers.metaKey && // open in new tab (mac)
          !modifiers.ctrlKey && // open in new tab (windows)
          !modifiers.altKey && // download
          !modifiers.shiftKey
        ) {
          navigate(link.pathname + link.search + link.hash);
        } else {
          openLink(link, modifiers);
        }
      });
    }
  }), [navigate]);

  return (
    <RouterContext.Provider value={ctx}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter(): Router {
  return useContext(RouterContext);
}

interface Modifiers {
  metaKey?: boolean,
  ctrlKey?: boolean,
  altKey?: boolean,
  shiftKey?: boolean
}

export function openLink(target: HTMLAnchorElement, modifiers: Modifiers, setOpening = true) {
  let {metaKey, ctrlKey, altKey, shiftKey} = modifiers;
  // WebKit does not support firing click events with modifier keys, but does support keyboard events.
  // https://github.com/WebKit/WebKit/blob/c03d0ac6e6db178f90923a0a63080b5ca210d25f/Source/WebCore/html/HTMLAnchorElement.cpp#L184
  let event = isWebKit() && process.env.NODE_ENV !== 'test'
    // @ts-ignore - keyIdentifier is a non-standard property, but it's what webkit expects
    ? new KeyboardEvent('keydown', {keyIdentifier: 'Enter', metaKey, ctrlKey, altKey, shiftKey})
    : new MouseEvent('click', {metaKey, ctrlKey, altKey, shiftKey, bubbles: true, cancelable: true});
  openLink.isOpening = setOpening;
  focusWithoutScrolling(target);
  target.dispatchEvent(event);
  openLink.isOpening = false;
}

openLink.isOpening = false;

function getSyntheticLink(target: Element, open: (link: HTMLAnchorElement) => void) {
  if (target instanceof HTMLAnchorElement) {
    open(target);
  } else if (target.hasAttribute('data-href')) {
    let link = document.createElement('a');
    link.href = target.getAttribute('data-href');
    if (target.hasAttribute('data-target')) {
      link.target = target.getAttribute('data-target');
    }
    if (target.hasAttribute('data-rel')) {
      link.rel = target.getAttribute('data-rel');
    }
    if (target.hasAttribute('data-download')) {
      link.download = target.getAttribute('data-download');
    }
    if (target.hasAttribute('data-ping')) {
      link.ping = target.getAttribute('data-ping');
    }
    if (target.hasAttribute('data-referrer-policy')) {
      link.referrerPolicy = target.getAttribute('data-referrer-policy');
    }
    target.appendChild(link);
    open(link);
    target.removeChild(link);
  }
}

function openSyntheticLink(target: Element, modifiers: Modifiers) {
  getSyntheticLink(target, link => openLink(link, modifiers));
}

export function getSyntheticLinkProps(props: LinkDOMProps) {
  return {
    'data-href': props.href,
    'data-target': props.target,
    'data-rel': props.rel,
    'data-download': props.download,
    'data-ping': props.ping,
    'data-referrer-policy': props.referrerPolicy
  };
}
