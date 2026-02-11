/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import '@react-spectrum/s2/page.css';

import {action} from '@storybook/addon-actions';
import {Button, Menu, MenuItem, MenuTrigger, Provider} from '../src';
import {createRoot} from 'react-dom/client';
import {enableShadowDOM} from '@react-stately/flags';
import type {Meta, StoryObj} from '@storybook/react';
import {UNSAFE_PortalProvider} from 'react-aria';
import {useEffect, useRef} from 'react';

enableShadowDOM();

const meta: Meta<any> = {
  title: 'ShadowDOM'
};

export default meta;

function ShadowDOMMenuContent() {
  const hostRef = useRef<HTMLDivElement>(null);
  const portalContainerRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<ReturnType<typeof createRoot> | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    const shadowRoot = host.attachShadow({mode: 'open'});

    // So S2 theme variables apply: :host in the copied CSS targets the shadow host.
    const scheme = document.documentElement.getAttribute('data-color-scheme');
    if (scheme) {
      host.setAttribute('data-color-scheme', scheme);
    }

    // Copy all styles from the document into the shadow root so S2 (and Storybook) styles apply.
    // Shadow DOM does not inherit styles; we must duplicate every stylesheet.
    const styleRoot = document.createElement('div');
    styleRoot.setAttribute('data-shadow-styles', '');
    for (const node of document.head.children) {
      if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
        const link = node as HTMLLinkElement;
        const clone = document.createElement('link');
        clone.rel = 'stylesheet';
        clone.href = link.href;
        styleRoot.appendChild(clone);
      } else if (node.tagName === 'STYLE') {
        const style = node as HTMLStyleElement;
        const clone = style.cloneNode(true) as HTMLStyleElement;
        styleRoot.appendChild(clone);
      }
    }
    shadowRoot.appendChild(styleRoot);

    const appContainer = document.createElement('div');
    appContainer.id = 'shadow-app';
    shadowRoot.appendChild(appContainer);

    const portalContainer = document.createElement('div');
    portalContainer.id = 'shadow-portal';
    shadowRoot.appendChild(portalContainer);
    portalContainerRef.current = portalContainer;

    const root = createRoot(appContainer);
    rootRef.current = root;
    root.render(
      <Provider colorScheme="dark">
        <UNSAFE_PortalProvider getContainer={() => portalContainerRef.current}>
          <MenuTrigger>
            <Button aria-label="Open menu">Actions</Button>
            <Menu onAction={action('action')}>
              <MenuItem id="edit">Edit</MenuItem>
              <MenuItem id="duplicate">Duplicate</MenuItem>
              <MenuItem id="delete">Delete</MenuItem>
            </Menu>
          </MenuTrigger>
        </UNSAFE_PortalProvider>
      </Provider>
    );

    return () => {
      root.unmount();
      rootRef.current = null;
      portalContainerRef.current = null;
    };
  }, []);

  return <div ref={hostRef} style={{minHeight: 200}} />;
}

export const MenuInShadowRoot: StoryObj = {
  render: () => <ShadowDOMMenuContent />,
  parameters: {
  }
};
