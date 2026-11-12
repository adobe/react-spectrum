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

import {afterEach, expect, it, vi} from 'vitest';
import {createIcon} from '../src/Icon';
import {Key} from '@react-types/shared';
import {page, userEvent} from 'vitest/browser';
import React, {useContext} from 'react';
import {render} from './utils/render';
import {SideNav, SideNavItem, SideNavItemContent, SideNavItemLink} from '../src/SideNav';
import {SideNavPanel, SideNavPanelContext} from '../src/SideNavPanel';
import {style} from '../style' with {type: 'macro'};
import {Text} from '../src/Content';

const TestIcon = createIcon(props => <svg {...props} viewBox="0 0 20 20" />);

function PanelState() {
  let {isCollapsed} = useContext(SideNavPanelContext);
  return <div data-testid="state">{isCollapsed ? 'rail' : 'expanded'}</div>;
}

function Example(props: {defaultCollapsed?: boolean; defaultExpandedKeys?: Iterable<Key>}) {
  return (
    <SideNavPanel
      aria-label="Side panel"
      defaultCollapsed={props.defaultCollapsed}
      styles={style({width: 240, height: 400})}>
      <SideNav
        aria-label="Navigation"
        selectedRoute="/files"
        defaultExpandedKeys={props.defaultExpandedKeys}>
        <SideNavItem id="files" href="/files" textValue="Files">
          <SideNavItemContent>
            <SideNavItemLink>
              <TestIcon />
              <Text>Files</Text>
            </SideNavItemLink>
          </SideNavItemContent>
        </SideNavItem>
        <SideNavItem id="categories" textValue="Categories">
          <SideNavItemContent>
            <TestIcon />
            <Text>Categories</Text>
          </SideNavItemContent>
          <SideNavItem id="archive" href="/archive" textValue="Archive">
            <SideNavItemContent>
              <SideNavItemLink>
                <Text>Archive</Text>
              </SideNavItemLink>
            </SideNavItemContent>
          </SideNavItem>
        </SideNavItem>
      </SideNav>
      <PanelState />
    </SideNavPanel>
  );
}

function getPanel() {
  return document.querySelector('[role=region]') as HTMLElement;
}

function getRow(name: string) {
  return [...document.querySelectorAll('[aria-level]')].find(row => row.textContent === name) as
    | HTMLElement
    | undefined;
}

function getState() {
  return document.querySelector('[data-testid=state]')?.textContent;
}

function getWidthTransition(panel: HTMLElement) {
  return panel
    .getAnimations()
    .find(animation => (animation as CSSTransition).transitionProperty === 'width');
}

function getRowAnimation(row: HTMLElement) {
  return row.getAnimations().find(animation => !(animation instanceof CSSTransition));
}

async function waitForSettle() {
  await expect.poll(() => getWidthTransition(getPanel())).toBeUndefined();
  await expect.poll(() => (getPanel().firstElementChild as HTMLElement).style.width).toBe('');
}

afterEach(() => {
  vi.restoreAllMocks();
});

it.each`
  locale     | collapse
  ${'en-US'} | ${'Collapse side panel'}
  ${'ar-AE'} | ${'طي اللوحة الجانبية'}
`('keeps the contents in place while the panel collapses ($locale)', async ({locale, collapse}) => {
  await render(<Example />, {providerOptions: {locale}});
  let panel = getPanel();
  let content = panel.firstElementChild as HTMLElement;
  let icon = getRow('Categories')!.querySelector('svg')!;
  let label = page.getByText('Categories').element();
  let iconRect = icon.getBoundingClientRect().toJSON();
  let labelRect = label.getBoundingClientRect().toJSON();
  let contentWidth = content.getBoundingClientRect().width;
  expect(panel.getBoundingClientRect().width).toBe(240);
  expect(getState()).toBe('expanded');

  await userEvent.click(page.getByRole('button', {name: collapse}));
  let transition = getWidthTransition(panel)!;
  transition.pause();
  transition.currentTime = 100;

  // The contents keep their expanded layout, and the panel clips them.
  let width = panel.getBoundingClientRect().width;
  expect(width).toBeGreaterThan(42);
  expect(width).toBeLessThan(240);
  expect(content.getBoundingClientRect().width).toBe(contentWidth);
  expect(label.getBoundingClientRect().toJSON()).toEqual(labelRect);
  expect(icon.getBoundingClientRect().toJSON()).toEqual(iconRect);
  // Consumers see the rail once the panel has finished collapsing.
  expect(getState()).toBe('expanded');

  transition.play();
  await waitForSettle();
  expect(getState()).toBe('rail');
  expect(panel.getBoundingClientRect().width).toBe(42);
  expect(icon.getBoundingClientRect().toJSON()).toEqual(iconRect);
});

it('measures the expanded width before the panel starts to expand', async () => {
  await render(<Example defaultCollapsed />);
  let panel = getPanel();
  let content = panel.firstElementChild as HTMLElement;
  // Nothing animates on mount.
  expect(panel.getAnimations()).toHaveLength(0);
  expect(panel.getBoundingClientRect().width).toBe(42);
  expect(getState()).toBe('rail');

  await userEvent.click(page.getByRole('button', {name: 'Expand side panel'}));
  expect(getState()).toBe('expanded');
  // Measuring by seeking to the end must not finish the transition, or start another one (WebKit
  // starts it on the next frame).
  await new Promise(resolve => requestAnimationFrame(resolve));
  expect(panel.getAnimations()).toHaveLength(1);
  let transition = getWidthTransition(panel)!;
  expect(transition.playState).toBe('running');
  transition.pause();
  transition.currentTime = 100;
  let width = panel.getBoundingClientRect().width;
  expect(width).toBeGreaterThan(42);
  expect(width).toBeLessThan(240);
  expect(content.getBoundingClientRect().width).toBe(240);

  transition.play();
  await waitForSettle();
  expect(panel.getBoundingClientRect().width).toBe(240);
  expect(content.getBoundingClientRect().width).toBe(240);
});

it('reverses part way through', async () => {
  await render(<Example />);
  let panel = getPanel();
  let content = panel.firstElementChild as HTMLElement;

  await userEvent.click(page.getByRole('button', {name: 'Collapse side panel'}));
  let transition = getWidthTransition(panel)!;
  transition.pause();
  transition.currentTime = 100;
  let width = panel.getBoundingClientRect().width;

  await userEvent.click(page.getByRole('button', {name: 'Expand side panel'}));
  expect(getState()).toBe('expanded');
  let reversed = getWidthTransition(panel)!;
  expect(reversed).not.toBe(transition);
  reversed.pause();
  // The panel turns around from where it was, and the contents keep the width they had.
  expect(panel.getBoundingClientRect().width).toBeGreaterThanOrEqual(width - 1);
  expect(panel.getBoundingClientRect().width).toBeLessThan(240);
  expect(content.getBoundingClientRect().width).toBe(240);

  reversed.play();
  await waitForSettle();
  expect(getState()).toBe('expanded');
  expect(panel.getBoundingClientRect().width).toBe(240);
});

// Returns the row's height a quarter, half, and three quarters of the way through its animation.
function sampleHeights(row: HTMLElement) {
  let animation = getRowAnimation(row)!;
  animation.pause();
  let heights = [50, 100, 150].map(time => {
    animation.currentTime = time;
    return row.getBoundingClientRect().height;
  });
  animation.play();
  return heights;
}

it('closes nested items as the panel collapses, and opens them again as it expands', async () => {
  await render(<Example defaultExpandedKeys={['categories']} />);
  let row = getRow('Archive')!;
  let height = row.getBoundingClientRect().height;

  await userEvent.click(page.getByRole('button', {name: 'Collapse side panel'}));
  let [start, middle, end] = sampleHeights(row);
  expect(start).toBeLessThan(height);
  expect(middle).toBeLessThan(start);
  expect(end).toBeLessThan(middle);
  expect(end).toBeGreaterThan(0);

  await waitForSettle();
  // The rail only shows top level items.
  expect(getRow('Archive')).toBeUndefined();

  await userEvent.click(page.getByRole('button', {name: 'Expand side panel'}));
  row = getRow('Archive')!;
  [start, middle, end] = sampleHeights(row);
  expect(start).toBeGreaterThan(0);
  expect(middle).toBeGreaterThan(start);
  expect(end).toBeGreaterThan(middle);
  expect(end).toBeLessThan(height);

  await waitForSettle();
  expect(row.getAnimations()).toHaveLength(0);
  expect(row.getBoundingClientRect().height).toBe(height);
});

// React only animates with view transitions that support types.
it.skipIf(!('ViewTransitionTypeSet' in window))(
  'clips the view transition for an item toggle to the nav',
  async () => {
    await render(<Example />);
    let startViewTransition = vi.spyOn(document, 'startViewTransition');

    await userEvent.click(page.getByText('Categories'));
    await expect.poll(() => startViewTransition.mock.results.length).toBe(1);
    let viewTransition = startViewTransition.mock.results[0].value as ViewTransition;
    await viewTransition.ready;

    let nav = document
      .querySelector('[aria-label=Navigation]')!
      .parentElement!.getBoundingClientRect();
    let polygon = `polygon(${nav.left}px ${nav.top}px, ${nav.right}px ${nav.top}px, ${nav.right}px ${nav.bottom}px, ${nav.left}px ${nav.bottom}px)`;
    let getClip = () =>
      document.documentElement
        .getAnimations({subtree: true})
        .find(animation =>
          (animation.effect as KeyframeEffect)
            .getKeyframes()
            .some(keyframe => keyframe.clipPath != null)
        );
    expect(getComputedStyle(document.documentElement, '::view-transition').clipPath).toBe(polygon);

    await viewTransition.finished;
    await expect.poll(getClip).toBeUndefined();
    expect(getRow('Archive')).toBeDefined();
  }
);

it.skipIf(!('ViewTransitionTypeSet' in window))(
  'keeps the pressed item out of the view transition',
  async () => {
    await render(<Example />);
    let startViewTransition = vi.spyOn(document, 'startViewTransition');
    let named = new Set<string | null>();
    let observer = new MutationObserver(records => {
      for (let record of records) {
        let row = record.target as HTMLElement;
        if (
          row.matches('[aria-level]') &&
          (row.style.viewTransitionName || record.oldValue?.includes('view-transition-name'))
        ) {
          named.add(row.textContent);
        }
      }
    });
    observer.observe(document.querySelector('[role=treegrid]')!, {
      subtree: true,
      attributeFilter: ['style'],
      attributeOldValue: true
    });

    await userEvent.click(page.getByText('Categories'));
    await expect.poll(() => startViewTransition.mock.results.length).toBe(1);
    await (startViewTransition.mock.results[0].value as ViewTransition).finished;
    observer.disconnect();

    // Captured elements can't be hovered, so the pressed row stays live.
    expect(named).toContain('Archive');
    expect(named).not.toContain('Categories');
  }
);

it('can unmount while animating', async () => {
  let {unmount} = await render(<Example defaultExpandedKeys={['categories']} />);
  await userEvent.click(page.getByRole('button', {name: 'Collapse side panel'}));
  await unmount();
  await new Promise(resolve => setTimeout(resolve, 300));
});
