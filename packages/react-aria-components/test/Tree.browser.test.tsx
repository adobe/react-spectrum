/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Regression test for https://github.com/adobe/react-spectrum/issues/10093

import {createRoot} from 'react-dom/client';
import {enableShadowDOM} from 'react-stately/private/flags/flags';
import {expect, it} from 'vitest';
import {ListLayout} from 'react-stately/useVirtualizerState';
import React from 'react';
import {Tree, TreeItem, TreeItemContent} from '../src/Tree';
import {Virtualizer} from '../src/Virtualizer';

// Mirror what the reproduction does — must be set before mounting.
enableShadowDOM();

const ROW_HEIGHT = 30;
const CONTAINER_HEIGHT = 300;
const items = Array.from({length: 50}, (_, i) => ({id: `item-${i}`, name: `Item ${i}`}));

function VirtualizedTree() {
  return (
    <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: ROW_HEIGHT}}>
      <Tree
        aria-label="Shadow DOM tree"
        items={items}
        style={{
          display: 'block',
          height: `${CONTAINER_HEIGHT}px`,
          width: '300px',
          overflow: 'auto'
        }}>
        {(item: any) => (
          <TreeItem id={item.id} textValue={item.name}>
            <TreeItemContent>{item.name}</TreeItemContent>
          </TreeItem>
        )}
      </Tree>
    </Virtualizer>
  );
}

it('virtualizer inside shadow DOM updates visible items on scroll', async () => {
  let host = document.createElement('div');
  document.body.appendChild(host);
  let shadowRoot = host.attachShadow({mode: 'open'});
  let mountPoint = document.createElement('div');
  shadowRoot.appendChild(mountPoint);

  let root = createRoot(mountPoint);
  root.render(<VirtualizedTree />);
  // Wait for initial render, ResizeObserver measurement, and ScrollView's size update.
  await new Promise<void>(resolve => setTimeout(() => resolve(), 200));

  // The scrollport is the treegrid element (Tree's outer div with overflow: auto).
  // The [role="presentation"] div is the inner content container, not the scrollport.
  let scrollport = shadowRoot.querySelector<HTMLElement>('[role="treegrid"]');
  expect(scrollport).not.toBeNull();
  expect(scrollport!.scrollHeight).toBeGreaterThan(CONTAINER_HEIGHT);

  let rows = shadowRoot.querySelectorAll('[role="row"]');
  expect(rows.length).toBeGreaterThan(0);
  // Only a subset of items should be visible (not all 50) due to virtualization.
  expect(rows.length).toBeLessThan(items.length);
  expect(Array.from(rows).some(r => r.textContent?.includes('Item 0'))).toBe(true);

  // Scroll past 20 items (20 × 30px) so Item 0 is outside any extra items the layout may buffer.
  scrollport!.scrollTop = ROW_HEIGHT * 20;
  await new Promise<void>(resolve => setTimeout(() => resolve(), 200));

  let updatedRows = shadowRoot.querySelectorAll('[role="row"]');
  expect(Array.from(updatedRows).some(r => r.textContent?.includes('Item 0'))).toBe(false);
  expect(Array.from(updatedRows).some(r => r.textContent?.includes('Item 20'))).toBe(true);

  root.unmount();
  document.body.removeChild(host);
});
