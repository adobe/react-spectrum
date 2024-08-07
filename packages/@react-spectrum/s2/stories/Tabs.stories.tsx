/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import Edit from '../s2wf-icons/S2_Icon_Edit_20_N.svg';
import Bell from '../s2wf-icons/S2_Icon_Bell_20_N.svg';
import Heart from '../s2wf-icons/S2_Icon_Heart_20_N.svg';
import type {Meta} from '@storybook/react';
import {style} from '../style/spectrum-theme' with { type: 'macro' };
import {Tab, TabList, TabPanel, Tabs} from '../src/Tabs';

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

export const Example = (args: any) => (
  <Tabs {...args} styles={style({maxWidth: '[450px]', height: 144})}>
    <TabList aria-label="History of Ancient Rome">
      <Tab id="FoR"><Edit />Founding of Rome</Tab>
      <Tab id="MaR">Monarchy and Republic</Tab>
      <Tab id="Emp">Empire</Tab>
    </TabList>
    <TabPanel id="FoR">
      Arma virumque cano, Troiae qui primus ab oris.
    </TabPanel>
    <TabPanel id="MaR">
      Senatus Populusque Romanus.
    </TabPanel>
    <TabPanel id="Emp">
      Alea jacta est.
    </TabPanel>
  </Tabs>
);

export const Disabled = (args: any) => (
  <Tabs {...args} styles={style({maxWidth: '[450px]', height: 144})} disabledKeys={['FoR', 'MaR', 'Emp']}>
    <TabList aria-label="History of Ancient Rome">
      <Tab id="FoR"><Edit />Founding of Rome</Tab>
      <Tab id="MaR">Monarchy and Republic</Tab>
      <Tab id="Emp">Empire</Tab>
    </TabList>
    <TabPanel id="FoR">
      Arma virumque cano, Troiae qui primus ab oris.
    </TabPanel>
    <TabPanel id="MaR">
      Senatus Populusque Romanus.
    </TabPanel>
    <TabPanel id="Emp">
      Alea jacta est.
    </TabPanel>
  </Tabs>
);

export const Icons = (args: any) => (
  <Tabs {...args} styles={style({maxWidth: 208, height: 144})}>
    <TabList aria-label="History of Ancient Rome">
      <Tab id="FoR"><Edit /></Tab>
      <Tab id="MaR"><Bell /></Tab>
      <Tab id="Emp"><Heart /></Tab>
    </TabList>
    <TabPanel id="FoR">
      Arma virumque cano, Troiae qui primus ab oris.
    </TabPanel>
    <TabPanel id="MaR">
      Senatus Populusque Romanus.
    </TabPanel>
    <TabPanel id="Emp">
      Alea jacta est.
    </TabPanel>
  </Tabs>
);
