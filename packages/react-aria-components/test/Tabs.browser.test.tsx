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
import {page, userEvent} from 'vitest/browser';
import React from 'react';
import {render} from 'vitest-browser-react';
import {Tab, TabList, TabPanel, TabPanels, Tabs} from '../src/Tabs';
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

const panelsStyle = {
  height: 'var(--tab-panel-height)',
  transition: 'height 500ms linear',
  overflow: 'clip'
};

function NestedTabsExample() {
  return (
    <Tabs>
      <TabList aria-label="Outer">
        <Tab id="general">General</Tab>
        <Tab id="nested">Nested</Tab>
      </TabList>
      <TabPanels data-testid="outer" style={panelsStyle}>
        <TabPanel id="general">
          <div style={{height: 50}} />
        </TabPanel>
        <TabPanel id="nested">
          <Tabs>
            <TabList aria-label="Inner" style={{display: 'flex'}}>
              <Tab id="one" style={{height: 30}}>
                One
              </Tab>
              <Tab id="two" style={{height: 30}}>
                Two
              </Tab>
            </TabList>
            <TabPanels data-testid="inner" style={panelsStyle}>
              <TabPanel id="one">
                <div style={{height: 100}} />
              </TabPanel>
              <TabPanel id="two">
                <div style={{height: 100}} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

it('animates TabPanels to the full size of a nested Tabs', async () => {
  await render(<NestedTabsExample />);
  let outer = document.querySelector('[data-testid=outer]') as HTMLElement;
  expect(outer.getBoundingClientRect().height).toBe(50);

  await userEvent.click(page.getByRole('tab', {name: 'Nested'}));
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  // Mid transition, the outer panels should be animating towards the nested TabList + TabPanel,
  // and the nested panels should not inherit the outer panels' size.
  let inner = document.querySelector('[data-testid=inner]') as HTMLElement;
  expect(outer.style.getPropertyValue('--tab-panel-height')).toBe('130px');
  expect(inner.getBoundingClientRect().height).toBe(100);

  await Promise.all(outer.getAnimations().map(a => a.finished));
  expect(outer.getBoundingClientRect().height).toBe(130);
});
