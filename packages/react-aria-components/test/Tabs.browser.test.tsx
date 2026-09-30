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

import {useLayoutEffect} from '@react-aria/utils';
import {expect, it} from 'vitest';
import {hydrateRoot} from 'react-dom/client';
import React, {StrictMode, useEffect, useRef} from 'react';
import {render} from 'vitest-browser-react';
import {renderToString} from 'react-dom/server.browser';
import {SelectionIndicator} from '../src/SelectionIndicator';
import {Tab, TabList, TabPanel, Tabs} from '../src/Tabs';
import {User} from '@react-aria/test-utils';

function TabsExample() {
  return (
    <Tabs>
      <TabList aria-label="Test">
        <Tab id="one">One</Tab>
        <Tab id="two">Two</Tab>
        <Tab id="three">Three</Tab>
      </TabList>
      <TabPanel id="one">Panel One</TabPanel>
      <TabPanel id="two">Panel Two</TabPanel>
      <TabPanel id="three">Panel Three</TabPanel>
    </Tabs>
  );
}

it.each([
  {strict: false, selectedKey: 'one'},
  {strict: false, selectedKey: 'five'},
  {strict: true, selectedKey: 'one'},
  {strict: true, selectedKey: 'five'}
])(
  'aligns the indicator after hydration (strict: $strict, selected: $selectedKey)',
  async ({strict, selectedKey}) => {
    let hydrated = false;
    function HydrationMarker() {
      useEffect(() => {
        hydrated = true;
      }, []);
      return null;
    }
    let keys = ['one', 'two', 'three', 'four', 'five'];
    let tree = (
      <Tabs defaultSelectedKey={selectedKey}>
        <HydrationMarker />
        <TabList aria-label="Hydrated tabs" style={{display: 'flex', gap: 12}}>
          {keys.map(key => (
            <Tab key={key} id={key} style={{position: 'relative', padding: '12px 20px'}}>
              <SelectionIndicator
                style={{
                  position: 'absolute',
                  inset: 0,
                  transitionProperty: 'translate, width, height',
                  transitionDuration: '200ms'
                }}
              />
              {key}
            </Tab>
          ))}
        </TabList>
        {keys.map(key => (
          <TabPanel key={key} id={key}>
            {key}
          </TabPanel>
        ))}
      </Tabs>
    );
    if (strict) {
      tree = <StrictMode>{tree}</StrictMode>;
    }
    let container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = renderToString(tree);
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      root = hydrateRoot(container, tree);
      await expect.poll(() => hydrated).toBe(true);
      await expect
        .poll(() => container.querySelector('[role="tab"][aria-selected="true"]')?.textContent)
        .toBe(selectedKey);
      let selectedTab = container.querySelector(
        '[role="tab"][aria-selected="true"]'
      ) as HTMLElement;
      let indicator = selectedTab.querySelector('.react-aria-SelectionIndicator') as HTMLElement;
      expect(selectedTab.textContent).toBe(selectedKey);
      await expect.poll(() => indicator.style.translate).toBe('');
      await expect
        .poll(() =>
          Math.abs(
            indicator.getBoundingClientRect().left - selectedTab.getBoundingClientRect().left
          )
        )
        .toBeLessThan(1);
      expect(indicator.style.width).toBe('');
      expect(indicator.style.height).toBe('');
    } finally {
      root?.unmount();
      container.remove();
    }
  }
);

it.each`
  interactionType
  ${'mouse'}
  ${'keyboard'}
`('triggers a tab via $interactionType', async ({interactionType}) => {
  let testUtilUser = new User();
  let {container} = await render(<TabsExample />);

  let tester = testUtilUser.createTester('Tabs', {
    root: container.querySelector('[role=tablist]') as HTMLElement,
    interactionType
  });
  let tabs = tester.getTabs();
  await tester.triggerTab({tab: tabs[1]});
  expect(tester.getSelectedTab()).toBe(tabs[1]);
});

const interruptedKeys = ['one', 'two', 'three'];

interface EnteringTabsProps {
  onEntering: () => void;
}

function EnteringTabs({onEntering}: EnteringTabsProps) {
  let ref = useRef<HTMLDivElement | null>(null);
  // `data-entering` is only applied for a single frame, so observe it rather than polling
  // for it. The observer is attached during the commit that mounts the tabs, which is
  // before the microtask that applies the entering state runs.
  useLayoutEffect(() => {
    let observer = new MutationObserver(records => {
      if (records.some(r => (r.target as HTMLElement).hasAttribute('data-entering'))) {
        onEntering();
      }
    });
    observer.observe(ref.current!, {
      attributes: true,
      attributeFilter: ['data-entering'],
      subtree: true
    });
    return () => observer.disconnect();
  }, [onEntering]);

  return (
    <div ref={ref}>
      <Tabs defaultSelectedKey="two">
        <TabList aria-label="Entering tabs" style={{display: 'flex', gap: 12}}>
          {interruptedKeys.map(key => (
            <Tab key={key} id={key} style={{position: 'relative', padding: '12px 20px'}}>
              <SelectionIndicator
                style={{
                  position: 'absolute',
                  inset: 0,
                  transitionProperty: 'translate, width, height',
                  transitionDuration: '200ms'
                }}
              />
              {key}
            </Tab>
          ))}
        </TabList>
        {interruptedKeys.map(key => (
          <TabPanel key={key} id={key}>
            {key}
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
}

it('does not get stuck in the entering state when effects are double invoked', async () => {
  let enteringCount = 0;
  let onEntering = () => {
    enteringCount++;
  };
  let {container} = await render(
    <StrictMode>
      <EnteringTabs onEntering={onEntering} />
    </StrictMode>
  );

  let getSelectedIndicator = () => {
    let selectedTab = container.querySelector('[role="tab"][aria-selected="true"]') as HTMLElement;
    return selectedTab.querySelector('.react-aria-SelectionIndicator') as HTMLElement;
  };

  // The entering state is applied on mount...
  await expect.poll(() => enteringCount).toBeGreaterThan(0);
  // ...and must be cleared once the entering frame has run.
  await expect.poll(() => getSelectedIndicator().hasAttribute('data-entering')).toBe(false);
});
