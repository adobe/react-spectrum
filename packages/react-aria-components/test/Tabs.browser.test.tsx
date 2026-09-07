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

import {expect, it} from 'vitest';
import {hydrateRoot} from 'react-dom/client';
import React, {StrictMode, useEffect} from 'react';
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
