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

import {describe, expect, it} from 'vitest';
import React from 'react';
import {render} from './utils/render';
import {Tab, TabList, TabPanel, Tabs} from '../src';

describe('Tabs', () => {
  it('renders', async () => {
    const screen = await render(
      <Tabs aria-label="Tabs">
        <TabList>
          <Tab id="home">Home</Tab>
          <Tab id="files">Files</Tab>
          <Tab id="search">Search</Tab>
          <Tab id="settings">Settings</Tab>
        </TabList>
        <TabPanel id="home">
          <div>Home content</div>
        </TabPanel>
        <TabPanel id="files">
          <div>Files content</div>
        </TabPanel>
        <TabPanel id="search">
          <div>Search content</div>
        </TabPanel>
        <TabPanel id="settings">
          <div>Settings content</div>
        </TabPanel>
      </Tabs>
    );
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    const tabs = screen.container.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(4);
  });
});
