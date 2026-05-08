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
import React from 'react';
import {render} from 'vitest-browser-react';
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
