/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Heading, Text} from '@react-spectrum/text';
import {Item, TabList, TabPanels, Tabs} from '../';
import {Meta} from '@storybook/react';
import React from 'react';
import {SpectrumTabsProps} from '@react-types/tabs';

const meta: Meta<SpectrumTabsProps<object>> = {
  title: 'Tabs',
  component: Tabs,
  parameters: {chromaticProvider: {disableAnimations: true}}
  /*
  parameters: {
    // Might need a delay for font calculations or tab indicator movement/calculations
    chromatic: { delay: 300 },
  }*/
};

export default meta;

const Template = (args: SpectrumTabsProps<object>) => (
  <Tabs {...args} aria-label="Tab example" maxWidth={500}>
    <TabList>
      <Item key="val1">Tab 1</Item>
      <Item key="val2">Tab 2</Item>
      <Item key="val3">Tab 3</Item>
      <Item key="val4">Tab 4</Item>
      <Item key="val5">Tab 5</Item>
    </TabList>
    <TabPanels>
      <Item key="val1">
        <Heading>Tab Body 1</Heading>
        <Text>
          Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui adipisicing.
        </Text>
      </Item>
      <Item key="val2">
        <Heading>Tab Body 2</Heading>
        <Text>
          Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui adipisicing.
        </Text>
      </Item>
      <Item key="val3">
        <Heading>Tab Body 3</Heading>
        <Text>
          Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui adipisicing.
        </Text>
      </Item>
      <Item key="val4">
        <Heading>Tab Body 4</Heading>
        <Text>
          Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui adipisicing.
        </Text>
      </Item>
      <Item key="val5">
        <Heading>Tab Body 5</Heading>
        <Text>
          Dolore ex esse laboris elit magna esse sunt. Pariatur in veniam Lorem est occaecat do magna nisi mollit ipsum sit adipisicing fugiat ex. Pariatur ullamco exercitation ea qui adipisicing.
        </Text>
      </Item>
    </TabPanels>
  </Tabs>
);

export const Default = {
  render: Template,
  args: {}
};

export const DefaultMobileViewport = {
  render: Template,
  parameters: {chromatic: {viewports: [320]}}
};

export const Quiet = {
  render: Template,
  args: {...Default.args, isQuiet: true}
};

export const Emphasized = {
  render: Template,
  args: {...Default.args, isEmphasized: true}
};

export const Compact = {
  render: Template,
  args: {...Default.args, density: 'compact'}
};

export const CompactQuiet = {
  render: Template,
  args: {...Quiet.args, ...Compact.args}
};

export const Vertical = {
  render: Template,
  args: {...Default.args, orientation: 'vertical'}
};

export const VerticalQuiet = {
  render: Template,
  args: {...Vertical.args, ...Quiet.args}
};

export const VerticalCompact = {
  render: Template,
  args: {...Vertical.args, ...Compact.args}
};

export const VerticalCompactQuiet = {
  render: Template,
  args: {...Vertical.args, ...CompactQuiet.args}
};

export const EmphasizedQuiet = {
  render: Template,
  args: {...Emphasized.args, ...Quiet.args}
};

export const EmphasizedVertical = {
  render: Template,
  args: {...Emphasized.args, ...Vertical.args}
};

export const EmphasizedVerticalQuiet = {
  render: Template,
  args: {...Emphasized.args, ...Vertical.args, ...Quiet.args}
};

export const EmphasizedCompact = {
  render: Template,
  args: {...Emphasized.args, ...Compact.args}
};

export const EmphasizedCompactVertical = {
  render: Template,
  args: {...Emphasized.args, ...Compact.args, ...Vertical.args}
};
