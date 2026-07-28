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

// JSDOM has no getAnimations, so the exit hold can only be verified end to end in a real browser.

import {afterEach, beforeEach, expect, it} from 'vitest';
import {Button} from '../src/Button';
import {createRoot, Root} from 'react-dom/client';
import React from 'react';
import {Tree, TreeItem, TreeItemContent} from '../src/Tree';

const DURATION = 150;
const ROW_HEIGHT = 30;

const css = `
.animated-tree-item {
  display: block;
  box-sizing: border-box;
  height: ${ROW_HEIGHT}px;
  overflow: clip;
  transition: height ${DURATION}ms linear, opacity ${DURATION}ms linear;
}

.animated-tree-item[data-entering],
.animated-tree-item[data-exiting] {
  height: 0;
  opacity: 0;
}
`;

function AnimatedTree({expandedKeys}: {expandedKeys: string[]}) {
  return (
    <Tree aria-label="Animated tree" expandedKeys={expandedKeys} onExpandedChange={() => {}}>
      <TreeItem id="root" textValue="Root" className="animated-tree-item">
        <TreeItemContent>
          <Button slot="chevron">▶</Button>
          Root
        </TreeItemContent>
        <TreeItem id="child-1" textValue="Child 1" className="animated-tree-item">
          <TreeItemContent>Child 1</TreeItemContent>
        </TreeItem>
        <TreeItem id="child-2" textValue="Child 2" className="animated-tree-item">
          <TreeItemContent>Child 2</TreeItemContent>
        </TreeItem>
      </TreeItem>
    </Tree>
  );
}

let container: HTMLDivElement;
let style: HTMLStyleElement;
let root: Root;

let rows = () => Array.from(container.querySelectorAll<HTMLElement>('.animated-tree-item'));
let wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// The collection renders over two passes, and a cold browser start can take a while to get there.
let waitForRows = async (count: number) => {
  for (let i = 0; i < 100 && rows().length !== count; i++) {
    await wait(20);
  }
  expect(rows()).toHaveLength(count);
};

beforeEach(() => {
  style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  root.unmount();
  container.remove();
  style.remove();
});

it('keeps collapsed rows mounted until their exit transition finishes', async () => {
  root.render(<AnimatedTree expandedKeys={['root']} />);
  await waitForRows(3);

  root.render(<AnimatedTree expandedKeys={[]} />);
  await wait(0);

  // The rows are still mounted and animating, but the tree already reports itself as collapsed.
  let exiting = rows().filter(row => row.hasAttribute('data-exiting'));
  expect(exiting).toHaveLength(2);
  expect(exiting.every(row => row.getAnimations().length > 0)).toBe(true);
  expect(rows()[0]).toHaveAttribute('aria-expanded', 'false');
  expect(exiting.every(row => row.hasAttribute('inert'))).toBe(true);

  // Halfway through, they should be partway collapsed rather than gone.
  await wait(DURATION / 2);
  let height = exiting[0].getBoundingClientRect().height;
  expect(height).toBeGreaterThan(0);
  expect(height).toBeLessThan(ROW_HEIGHT);

  await wait(DURATION);
  expect(rows()).toHaveLength(1);
});

it('restores rows when a collapse is interrupted by re-expanding', async () => {
  root.render(<AnimatedTree expandedKeys={['root']} />);
  await waitForRows(3);

  root.render(<AnimatedTree expandedKeys={[]} />);
  await wait(DURATION / 2);
  expect(rows().filter(row => row.hasAttribute('data-exiting'))).toHaveLength(2);

  root.render(<AnimatedTree expandedKeys={['root']} />);
  await wait(DURATION * 2);

  expect(rows()).toHaveLength(3);
  expect(container.querySelectorAll('[data-exiting]')).toHaveLength(0);
  expect(rows()[1].getBoundingClientRect().height).toBeCloseTo(ROW_HEIGHT, 0);
});

it('animates rows in when they are revealed by an expansion', async () => {
  root.render(<AnimatedTree expandedKeys={[]} />);
  await waitForRows(1);

  root.render(<AnimatedTree expandedKeys={['root']} />);
  await wait(DURATION / 2);

  // Mid-transition the new rows exist but have not reached their full height yet.
  expect(rows()).toHaveLength(3);
  let height = rows()[1].getBoundingClientRect().height;
  expect(height).toBeGreaterThan(0);
  expect(height).toBeLessThan(ROW_HEIGHT);

  await wait(DURATION);
  expect(rows()[1].getBoundingClientRect().height).toBeCloseTo(ROW_HEIGHT, 0);
});
