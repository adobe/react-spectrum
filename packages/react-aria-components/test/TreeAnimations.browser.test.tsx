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

import {afterEach, beforeEach, expect, it} from 'vitest';
import {Button} from '../src/Button';
import {createRoot, Root} from 'react-dom/client';
import {ListLayout} from 'react-stately/useVirtualizerState';
import React from 'react';
import {Tree, TreeItem, TreeItemContent, TreeLoadMoreItem, TreeSection} from '../src/Tree';
import {Virtualizer} from '../src/Virtualizer';

const DURATION = 5000;
const LINE_HEIGHT = 30;
const PADDING = 5;
const ROW_HEIGHT = LINE_HEIGHT + PADDING * 2;

const css = `
.animated-tree-item {
  display: block;
  box-sizing: border-box;
  overflow: clip;
  height: var(--tree-item-height, auto);
  line-height: ${LINE_HEIGHT}px;
  padding-block: ${PADDING}px;
  transition: height ${DURATION}ms linear, padding ${DURATION}ms linear;
}

.animated-tree-item[data-entering],
.animated-tree-item[data-exiting] {
  padding-block: 0;
}
`;

function AnimatedTree({
  expandedKeys,
  children
}: {
  expandedKeys: string[];
  children?: React.ReactNode;
}) {
  return (
    <Tree aria-label="Animated tree" expandedKeys={expandedKeys} onExpandedChange={() => {}}>
      <TreeItem id="root" textValue="Root" className="animated-tree-item">
        <TreeItemContent>
          <Button slot="chevron">▶</Button>
          Root
        </TreeItemContent>
        {children ?? (
          <>
            <TreeItem id="child-1" textValue="Child 1" className="animated-tree-item">
              <TreeItemContent>Child 1</TreeItemContent>
            </TreeItem>
            <TreeItem id="child-2" textValue="Child 2" className="animated-tree-item">
              <TreeItemContent>Child 2</TreeItemContent>
            </TreeItem>
          </>
        )}
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
async function waitFor(condition: () => boolean, description: string) {
  await expect.poll(condition, {message: description}).toBe(true);
  // Establish a before-change style before the next expansion/collapse.
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

  let exiting = exitingRows();
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

  let children = exitingRows();
  seekToMiddle(children);
  let middleHeights = children.map(height);
  expect(middleHeights.every(h => h > 0 && h < ROW_HEIGHT)).toBe(true);
  root.render(<AnimatedTree expandedKeys={['root']} />);
  await waitFor(() => exitingRows().length === 0, 'the exiting state is cleared');

  expect(rows()).toHaveLength(3);
  expect(container.querySelectorAll('[inert]')).toHaveLength(0);
  expect(rows().slice(1)).toEqual(children);
  expect(children.every(isAnimating)).toBe(true);

  await finishAnimations(rows());
  await expect.poll(() => rows().slice(1).map(height)).toEqual([ROW_HEIGHT, ROW_HEIGHT]);
});

it('animates rows in when they are revealed by an expansion', async () => {
  root.render(<AnimatedTree expandedKeys={[]} />);
  await waitFor(() => rows().length === 1, 'only the root renders while collapsed');

  root.render(<AnimatedTree expandedKeys={['root']} />);
  await waitFor(
    () => rows().length === 3 && rows().slice(1).every(isAnimating),
    'the revealed children are animating in'
  );

  let revealed = rows().slice(1);
  expect(revealed.map(row => row.style.getPropertyValue('--tree-item-height'))).toEqual(
    revealed.map(() => `${ROW_HEIGHT}px`)
  );

  seekToMiddle(revealed);
  expect(revealed.every(row => height(row) > 0 && height(row) < ROW_HEIGHT)).toBe(true);

  await finishAnimations(rows());
  await expect.poll(() => rows().slice(1).map(height)).toEqual([ROW_HEIGHT, ROW_HEIGHT]);
});

it('releases siblings independently without restoring a finished row', async () => {
  root.render(<AnimatedTree expandedKeys={['root']} />);
  await waitFor(() => rows().length === 3, 'expanded rows mount');
  root.render(<AnimatedTree expandedKeys={[]} />);
  await waitFor(
    () => exitingRows().length === 2 && exitingRows().every(isAnimating),
    'children exit'
  );
  let [first, second] = exitingRows();
  seekToMiddle([first, second]);
  await finishAnimations([first]);
  await expect.poll(() => first.isConnected).toBe(false);
  expect(second).toHaveAttribute('data-exiting');
  expect(second).toHaveAttribute('inert');
  expect(height(second)).toBeGreaterThan(0);
  await finishAnimations([second]);
  await expect.poll(() => rows().length).toBe(1);
});

it('retains a grandchild after its parent has finished exiting', async () => {
  let children = (
    <TreeItem id="branch" textValue="Branch" className="animated-tree-item">
      <TreeItemContent>
        <Button slot="chevron">Expand</Button>Branch
      </TreeItemContent>
      <TreeItem id="leaf" textValue="Leaf" className="animated-tree-item">
        <TreeItemContent>Leaf</TreeItemContent>
      </TreeItem>
    </TreeItem>
  );
  root.render(<AnimatedTree expandedKeys={['root', 'branch']}>{children}</AnimatedTree>);
  await waitFor(() => rows().length === 3, 'nested rows mount');
  root.render(<AnimatedTree expandedKeys={[]}>{children}</AnimatedTree>);
  await waitFor(
    () => exitingRows().length === 2 && exitingRows().every(isAnimating),
    'nested rows exit'
  );
  let [branch, leaf] = exitingRows();
  seekToMiddle([branch, leaf]);
  await finishAnimations([branch]);
  await expect.poll(() => branch.isConnected).toBe(false);
  expect(leaf.isConnected).toBe(true);
  expect(leaf).toHaveAttribute('inert');
  await finishAnimations([leaf]);
  await expect.poll(() => rows().length).toBe(1);
});

it('removes loaders immediately and does not reveal newly added collapsed children', async () => {
  let children = (
    <>
      <TreeItem id="child" textValue="Child" className="animated-tree-item">
        <TreeItemContent>Child</TreeItemContent>
      </TreeItem>
      <TreeLoadMoreItem isLoading onLoadMore={() => {}}>
        Loading
      </TreeLoadMoreItem>
    </>
  );
  root.render(<AnimatedTree expandedKeys={['root']}>{children}</AnimatedTree>);
  await waitFor(() => rows().length === 2, 'children mount');
  expect(container.textContent).toContain('Loading');
  root.render(<AnimatedTree expandedKeys={[]}>{children}</AnimatedTree>);
  await waitFor(
    () => exitingRows().length === 1 && exitingRows().every(isAnimating),
    'child exits'
  );
  let [child] = exitingRows();
  seekToMiddle([child]);
  expect(container.textContent).not.toContain('Loading');
  expect(container.querySelector('[data-testid="loadMoreSentinel"]')).toBeNull();
  root.render(
    <AnimatedTree expandedKeys={[]}>
      {children}
      <TreeItem id="new" textValue="New" className="animated-tree-item">
        <TreeItemContent>New</TreeItemContent>
      </TreeItem>
    </AnimatedTree>
  );
  await waitFor(() => exitingRows().length === 1, 'existing child remains exiting');
  expect(container.textContent).not.toContain('New');
  await finishAnimations([child]);
  await expect.poll(() => rows().length).toBe(1);
});

it('releases independently animated rows inside a section', async () => {
  let tree = (expandedKeys: string[]) => (
    <Tree aria-label="Section tree" expandedKeys={expandedKeys} onExpandedChange={() => {}}>
      <TreeSection aria-label="Section">
        <TreeItem id="root" textValue="Root" className="animated-tree-item">
          <TreeItemContent>
            <Button slot="chevron">Expand</Button>Root
          </TreeItemContent>
          <TreeItem id="a" textValue="A" className="animated-tree-item">
            <TreeItemContent>A</TreeItemContent>
          </TreeItem>
          <TreeItem id="b" textValue="B" className="animated-tree-item">
            <TreeItemContent>B</TreeItemContent>
          </TreeItem>
        </TreeItem>
      </TreeSection>
    </Tree>
  );
  root.render(tree(['root']));
  await waitFor(() => rows().length === 3, 'section rows mount');
  root.render(tree([]));
  await waitFor(
    () => exitingRows().length === 2 && exitingRows().every(isAnimating),
    'section rows exit'
  );
  let [a, b] = exitingRows();
  seekToMiddle([a, b]);
  await finishAnimations([a]);
  await expect.poll(() => a.isConnected).toBe(false);
  expect(b).toHaveAttribute('inert');
  await finishAnimations([b]);
  await expect.poll(() => rows().length).toBe(1);
});

it('refreshes intrinsic height after content resizes', async () => {
  root.render(<AnimatedTree expandedKeys={['root']} />);
  await waitFor(() => rows().length === 3, 'expanded rows mount');
  let children = rows().slice(1);
  for (let child of children) {
    child.style.lineHeight = '60px';
  }
  await waitFor(() => children.every(row => height(row) === 70), 'content resizes');
  root.render(<AnimatedTree expandedKeys={[]} />);
  await waitFor(
    () => exitingRows().length === 2 && exitingRows().every(isAnimating),
    'children exit'
  );
  seekToMiddle(children);
  expect(children.map(height)).toEqual([35, 35]);
  root.render(<AnimatedTree expandedKeys={['root']} />);
  await waitFor(
    () => exitingRows().length === 0 && children.every(isAnimating),
    'collapse reverses'
  );
  await finishAnimations(children);
  await expect.poll(() => children.map(height)).toEqual([70, 70]);
});

it('restores content-driven sizing when an entering transition is canceled', async () => {
  root.render(<AnimatedTree expandedKeys={[]} />);
  await waitFor(() => rows().length === 1, 'root mounts');
  root.render(<AnimatedTree expandedKeys={['root']} />);
  await waitFor(() => rows().length === 3 && rows().slice(1).every(isAnimating), 'children enter');
  let children = rows().slice(1);
  for (let child of children) {
    child.style.transition = 'none';
    child.getAnimations();
  }
  await expect
    .poll(() => children.map(row => row.style.getPropertyValue('--tree-item-height')))
    .toEqual(['auto', 'auto']);
  for (let child of children) {
    child.style.lineHeight = '60px';
  }
  await expect.poll(() => children.map(height)).toEqual([70, 70]);
});

it('measures the CSS height box rather than assuming border-box sizing', async () => {
  style.textContent += '.animated-tree-item { box-sizing: content-box; border-block: 2px solid; }';
  root.render(<AnimatedTree expandedKeys={[]} />);
  await waitFor(() => rows().length === 1, 'root mounts');
  root.render(<AnimatedTree expandedKeys={['root']} />);
  await waitFor(() => rows().length === 3 && rows().slice(1).every(isAnimating), 'children enter');
  let children = rows().slice(1);
  expect(children.map(row => row.style.getPropertyValue('--tree-item-height'))).toEqual([
    '30px',
    '30px'
  ]);
  await finishAnimations(children);
  await expect.poll(() => children.map(height)).toEqual([44, 44]);
});

it('does not cancel entering keyframes while measuring a height transition', async () => {
  style.textContent += `
    @keyframes tree-fade { from { opacity: 0; } to { opacity: 1; } }
    .animated-tree-item[data-entering] { animation: tree-fade ${DURATION}ms linear; }
  `;
  root.render(<AnimatedTree expandedKeys={[]} />);
  await waitFor(() => rows().length === 1, 'root mounts');
  root.render(<AnimatedTree expandedKeys={['root']} />);
  await waitFor(
    () =>
      rows().length === 3 &&
      rows()
        .slice(1)
        .every(row => row.hasAttribute('data-entering') && isAnimating(row)),
    'entering keyframes run'
  );
  let children = rows().slice(1);
  seekToMiddle(children);
  expect(children.map(row => Number(window.getComputedStyle(row).opacity))).toEqual([0.5, 0.5]);
  expect(children.every(row => height(row) > 0)).toBe(true);
  await finishAnimations(children);
  await waitFor(
    () => children.every(row => !row.hasAttribute('data-entering') && isAnimating(row)),
    'height transitions follow the keyframes'
  );
  await finishAnimations(children);
  await expect.poll(() => children.map(height)).toEqual([ROW_HEIGHT, ROW_HEIGHT]);
});

it('collapses virtualized branches without waiting for unmounted rows', async () => {
  style.textContent += '[role="treegrid"] { height: 80px; width: 300px; overflow: auto; }';
  let tree = (expandedKeys: string[]) => (
    <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: ROW_HEIGHT}}>
      <AnimatedTree expandedKeys={expandedKeys}>
        {Array.from({length: 100}, (_, i) => (
          <TreeItem
            id={`child-${i}`}
            key={i}
            textValue={`Child ${i}`}
            className="animated-tree-item">
            <TreeItemContent>Child {i}</TreeItemContent>
          </TreeItem>
        ))}
      </AnimatedTree>
    </Virtualizer>
  );
  root.render(tree(['root']));
  await waitFor(() => rows().length > 1, 'virtualized children mount');
  expect(rows().length).toBeLessThan(101);
  root.render(tree([]));
  await expect.poll(() => rows().length).toBe(1);
  expect(exitingRows()).toHaveLength(0);
  expect(container.querySelector('[role="treegrid"]')!.scrollHeight).toBe(80);
});

it('does not clear an inert attribute supplied by the consumer', async () => {
  root.render(
    <AnimatedTree expandedKeys={['root']}>
      <TreeItem id="child" textValue="Child" inert className="animated-tree-item">
        <TreeItemContent>Child</TreeItemContent>
      </TreeItem>
    </AnimatedTree>
  );
  await waitFor(() => rows().length === 2, 'inert child mounts');
  expect(rows()[1]).toHaveAttribute('inert');
});

it('does not retain rows when transitions are disabled for reduced motion', async () => {
  style.textContent += '.animated-tree-item { transition: none; }';
  root.render(<AnimatedTree expandedKeys={['root']} />);
  await waitFor(() => rows().length === 3, 'expanded rows mount');
  root.render(<AnimatedTree expandedKeys={[]} />);
  await expect.poll(() => rows().length).toBe(1);
  root.render(<AnimatedTree expandedKeys={['root']} />);
  await expect.poll(() => rows().slice(1).map(height)).toEqual([ROW_HEIGHT, ROW_HEIGHT]);
  expect(rows().some(isAnimating)).toBe(false);
});

it('prepares intrinsic sizing only once when StrictMode replays effects', async () => {
  root.render(
    <React.StrictMode>
      <AnimatedTree expandedKeys={[]} />
    </React.StrictMode>
  );
  await waitFor(() => rows().length === 1, 'root mounts in StrictMode');
  root.render(
    <React.StrictMode>
      <AnimatedTree expandedKeys={['root']} />
    </React.StrictMode>
  );
  await waitFor(() => rows().length === 3 && rows().slice(1).every(isAnimating), 'children enter');
  let children = rows().slice(1);
  expect(children.map(row => row.style.getPropertyValue('--tree-item-height'))).toEqual([
    '40px',
    '40px'
  ]);
  seekToMiddle(children);
  expect(children.map(height)).toEqual([20, 20]);
  await finishAnimations(children);
  await expect.poll(() => children.map(height)).toEqual([ROW_HEIGHT, ROW_HEIGHT]);
});

it('observes padding changes as well as content changes', async () => {
  root.render(<AnimatedTree expandedKeys={['root']} />);
  await waitFor(() => rows().length === 3, 'children mount');
  style.textContent +=
    '.animated-tree-item:not([data-entering]):not([data-exiting]) { padding-block: 15px; }';
  let children = rows().slice(1);
  await waitFor(() => children.every(isAnimating), 'padding transitions start');
  await finishAnimations(children);
  await waitFor(
    () => children.every(row => height(row) === 60),
    'padding increases the resting height'
  );
  root.render(<AnimatedTree expandedKeys={[]} />);
  await waitFor(
    () => exitingRows().length === 2 && exitingRows().every(isAnimating),
    'children exit'
  );
  seekToMiddle(children);
  expect(children.map(height)).toEqual([30, 30]);
});
