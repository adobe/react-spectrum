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
//
// Nothing here is timed against the wall clock. A concurrent root commits asynchronously and CI
// machines are slow, so the transition is deliberately far longer than any plausible scheduling
// delay, every observation polls for the state it is about to assert, and animations are finished
// explicitly rather than waited out.

import {afterEach, beforeEach, expect, it} from 'vitest';
import {Button} from '../src/Button';
import {createRoot, Root} from 'react-dom/client';
import React from 'react';
import {Tree, TreeItem, TreeItemContent} from '../src/Tree';

const DURATION = 5000;
const ROW_HEIGHT = 30;

// Exercises the --tree-item-height polyfill rather than a hard-coded height: the row sizes to its
// content, and the Tree publishes that height so it can be animated to and from zero.
const css = `
.animated-tree-item {
  display: block;
  box-sizing: border-box;
  overflow: clip;
  height: var(--tree-item-height, auto);
  line-height: ${ROW_HEIGHT}px;
  transition: height ${DURATION}ms linear;
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
let exitingRows = () => rows().filter(row => row.hasAttribute('data-exiting'));
let isAnimating = (row: HTMLElement) => row.getAnimations().length > 0;
let height = (row: HTMLElement) => row.getBoundingClientRect().height;
let wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Waits for a state and then for the browser to actually render it. A transition is only generated
 * when the property has a before-change style from a completed style pass, so mutating the tree in
 * the same frame the rows first appeared would silently produce no animation at all.
 */
async function waitFor(condition: () => boolean, description: string) {
  for (let i = 0; i < 250 && !condition(); i++) {
    await wait(20);
  }

  expect(condition(), description).toBe(true);
  await new Promise<void>(resolve =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
}

/** Seeks to the midpoint so the intermediate state can be asserted without racing the clock. */
function seekToMiddle(elements: HTMLElement[]) {
  for (let animation of elements.flatMap(el => el.getAnimations())) {
    animation.pause();
    animation.currentTime = DURATION / 2;
  }
}

/** Jumps the elements' animations to their end rather than waiting out DURATION. */
async function finishAnimations(elements: HTMLElement[]) {
  let animations = elements.flatMap(el => el.getAnimations());
  for (let animation of animations) {
    animation.play();
    animation.finish();
  }

  await Promise.all(animations.map(a => a.finished.catch(() => {})));
}

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
  await waitFor(() => rows().length === 3, 'three rows render while expanded');

  root.render(<AnimatedTree expandedKeys={[]} />);
  await waitFor(
    () => exitingRows().length === 2 && exitingRows().every(isAnimating),
    'both children are held in the DOM and animating out'
  );

  // The rows are still mounted and collapsing, but the tree already reports itself collapsed.
  let exiting = exitingRows();
  // The row sizes to its content, so it can only animate because the Tree published a height for it.
  expect(exiting.every(row => row.style.getPropertyValue('--tree-item-height') !== '')).toBe(true);
  seekToMiddle(exiting);
  expect(exiting.every(row => height(row) > 0 && height(row) < ROW_HEIGHT)).toBe(true);
  expect(rows()[0]).toHaveAttribute('aria-expanded', 'false');
  expect(exiting.every(row => row.hasAttribute('inert'))).toBe(true);

  await finishAnimations(exiting);
  await waitFor(() => rows().length === 1, 'the held rows are released once they finish animating');
});

it('restores rows when a collapse is interrupted by re-expanding', async () => {
  root.render(<AnimatedTree expandedKeys={['root']} />);
  await waitFor(() => rows().length === 3, 'three rows render while expanded');

  root.render(<AnimatedTree expandedKeys={[]} />);
  await waitFor(
    () => exitingRows().length === 2 && exitingRows().every(isAnimating),
    'both children are held in the DOM and animating out'
  );

  root.render(<AnimatedTree expandedKeys={['root']} />);
  await waitFor(() => exitingRows().length === 0, 'the exiting state is cleared');

  expect(rows()).toHaveLength(3);
  expect(container.querySelectorAll('[inert]')).toHaveLength(0);

  await finishAnimations(rows());
  await waitFor(
    () => rows().length === 3 && rows().every(row => height(row) === ROW_HEIGHT),
    'the restored rows animate back to full height'
  );
});

it('animates rows in when they are revealed by an expansion', async () => {
  root.render(<AnimatedTree expandedKeys={[]} />);
  await waitFor(() => rows().length === 1, 'only the root renders while collapsed');

  root.render(<AnimatedTree expandedKeys={['root']} />);
  await waitFor(
    () => rows().length === 3 && rows().slice(1).every(isAnimating),
    'the revealed children are animating in'
  );

  // The new rows grow to their full height rather than appearing at it.
  let revealed = rows().slice(1);
  seekToMiddle(revealed);
  expect(revealed.every(row => height(row) > 0 && height(row) < ROW_HEIGHT)).toBe(true);

  await finishAnimations(rows());
  await waitFor(
    () => rows().every(row => height(row) === ROW_HEIGHT),
    'the revealed rows reach full height'
  );
});
