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
import {Meta, StoryObj} from '@storybook/react';
import React, {JSX} from 'react';
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

export type TabsStoryProps = StoryObj<SpectrumTabsProps<object>>;

const Template = (args: SpectrumTabsProps<object>): JSX.Element => (
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

export const Default: TabsStoryProps = {
  render: (args) => <Template {...args} />,
  args: {}
};

export const DefaultMobileViewport: TabsStoryProps = {
  render: (args) => <Template {...args} />,
  parameters: {chromatic: {viewports: [320]}}
};

export const Quiet: TabsStoryProps = {
  render: (args) => <Template {...args} />,
  args: {...Default.args, isQuiet: true}
};

export const Emphasized: TabsStoryProps = {
  render: (args) => <Template {...args} />,
  args: {...Default.args, isEmphasized: true}
};

export const Compact: TabsStoryProps = {
  render: (args) => <Template {...args} />,
  args: {...Default.args, density: 'compact'}
};

export const CompactQuiet: TabsStoryProps = {
  render: (args) => <Template {...args} />,
  args: {...Quiet.args, ...Compact.args}
};

export const Vertical: TabsStoryProps = {
  render: (args) => (
    <Tabs {...args} aria-label="Tab example" maxWidth={500}>
      <TabList>
        <Item key="val1">Tab 1</Item>
        <Item key="val2"><span lang="ja">バナーおよびディスプレイ広告</span></Item>
        <Item key="val3"><span lang="de" style={{hyphens: 'auto'}}>Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz</span></Item>
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
  ),
  args: {...Default.args, orientation: 'vertical'}
};

export const VerticalMaxWidth: TabsStoryProps = {
  render: (args) => (
    <Tabs {...args} aria-label="Tab example" maxWidth={500}>
      <TabList width={120}>
        <Item key="val1">Tab 1</Item>
        <Item key="val2"><span lang="ja">バナーおよびディスプレイ広告</span></Item>
        <Item key="val3"><span lang="de" style={{hyphens: 'auto'}}>Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz</span></Item>
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
  ),
  args: {...Default.args, orientation: 'vertical'}
};

export const VerticalQuiet: TabsStoryProps = {
  render: (args) => <Template {...args} />,
  args: {...Vertical.args, ...Quiet.args}
};

export const VerticalCompact: TabsStoryProps = {
  render: (args) => <Template {...args} />,
  args: {...Vertical.args, ...Compact.args}
};

export const VerticalCompactQuiet: TabsStoryProps = {
  render: (args) => <Template {...args} />,
  args: {...Vertical.args, ...CompactQuiet.args}
};

export const EmphasizedQuiet: TabsStoryProps = {
  render: (args) => <Template {...args} />,
  args: {...Emphasized.args, ...Quiet.args}
};

export const EmphasizedVertical: TabsStoryProps = {
  render: (args) => <Template {...args} />,
  args: {...Emphasized.args, ...Vertical.args}
};

export const EmphasizedVerticalQuiet: TabsStoryProps = {
  render: (args) => <Template {...args} />,
  args: {...Emphasized.args, ...Vertical.args, ...Quiet.args}
};

export const EmphasizedCompact: TabsStoryProps = {
  render: (args) => <Template {...args} />,
  args: {...Emphasized.args, ...Compact.args}
};

export const EmphasizedCompactVertical: TabsStoryProps = {
  render: (args) => <Template {...args} />,
  args: {...Emphasized.args, ...Compact.args, ...Vertical.args}
};
