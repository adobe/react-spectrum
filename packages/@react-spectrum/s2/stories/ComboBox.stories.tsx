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

import {Button, ComboBox, ComboBoxItem, ComboBoxSection, Content, ContextualHelp, Footer, Form, Header, Heading, Link, Text} from '../src';
import {categorizeArgTypes} from './utils';
import {ComboBoxProps} from 'react-aria-components';
import DeviceDesktopIcon from '../s2wf-icons/S2_Icon_DeviceDesktop_20_N.svg';
import DeviceTabletIcon from '../s2wf-icons/S2_Icon_DeviceTablet_20_N.svg';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '../style' with {type: 'macro'};

const meta: Meta<typeof ComboBox<any>> = {
  component: ComboBox,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', ['onInputChange', 'onOpenChange', 'onSelectionChange'])
  },
  title: 'ComboBox'
};

export default meta;
type Story = StoryObj<typeof ComboBox<any>>;

export const Example = {
  render: (args: ComboBoxProps<any>) => (
    <ComboBox {...args}>
      <ComboBoxItem>Chocolate</ComboBoxItem>
      <ComboBoxItem>Mint</ComboBoxItem>
      <ComboBoxItem>Strawberry</ComboBoxItem>
      <ComboBoxItem>Vanilla</ComboBoxItem>
      <ComboBoxItem>Chocolate Chip Cookie Dough</ComboBoxItem>
    </ComboBox>
  ),
  args: {
    label: 'Ice cream flavor'
  }
};

export const Sections: Story = {
  render: (args) => (
    <ComboBox {...args}>
      <ComboBoxSection id="neopolitan">
        <Header>
          <Heading>Neopolitan flavors</Heading>
          <Text slot="description">These flavors are common</Text>
        </Header>
        <ComboBoxItem>Chocolate</ComboBoxItem>
        <ComboBoxItem>Strawberry</ComboBoxItem>
        <ComboBoxItem>Vanilla</ComboBoxItem>
      </ComboBoxSection>
      <ComboBoxSection id="other">
        <Header>
          <Heading>Others</Heading>
          <Text slot="description">These flavors are uncommon</Text>
        </Header>
        <ComboBoxItem>Mint</ComboBoxItem>
        <ComboBoxItem>Chocolate Chip Cookie Dough</ComboBoxItem>
      </ComboBoxSection>
    </ComboBox>
  ),
  args: {
    label: 'Ice cream flavor'
  }
};

interface IExampleItem {
  id: string,
  label: string
}
let items: IExampleItem[] = [
  {id: 'chocolate', label: 'Chocolate'},
  {id: 'strawberry', label: 'Strawberry'},
  {id: 'vanilla', label: 'Vanilla'},
  {id: 'mint', label: 'Mint'},
  {id: 'cookie-dough', label: 'Chocolate Chip Cookie Dough'}
];
export const Dynamic: Story = {
  render: (args) => (
    <ComboBox {...args}>
      {(item) => <ComboBoxItem id={(item as IExampleItem).id} textValue={(item as IExampleItem).label}>{(item as IExampleItem).label}</ComboBoxItem>}
    </ComboBox>
  ),
  args: {
    label: 'Favorite ice cream flavor',
    items
  }
};


export const WithIcons: Story = {
  render: (args) => (
    <ComboBox {...args}>
      <ComboBoxItem textValue="Illustrator for iPad">
        <DeviceTabletIcon />
        <Text slot="label">Illustrator for iPad</Text>
        <Text slot="description">Share a low-res snapshot</Text>
      </ComboBoxItem>
      <ComboBoxItem textValue="Illustrator for desktop">
        <DeviceDesktopIcon />
        <Text slot="label">Illustrator for desktop</Text>
        <Text slot="description">Share a hi-res</Text>
      </ComboBoxItem>
    </ComboBox>
  ),
  args: {
    label: 'Where to share'
  }
};

export const Validation = {
  render: (args: any) => (
    <Form>
      <ComboBox {...args}>
        {(item) => <ComboBoxItem id={(item as IExampleItem).id} textValue={(item as IExampleItem).label}>{(item as IExampleItem).label}</ComboBoxItem>}
      </ComboBox>
      <Button type="submit" variant="primary">Submit</Button>
    </Form>
  ),
  args: {
    ...Dynamic.args,
    isRequired: true
  }
};

export const ContextualHelpExample: Story = {
  render: (args) => (
    <ComboBox
      {...args}
      contextualHelp={
        <ContextualHelp>
          <Heading>What is a ice cream?</Heading>
          <Content>
            <Text>
              A combination of sugar, eggs, milk, and cream is cooked to make
              a custard base. Then, flavorings are added, and this flavored
              mixture is carefully churned and frozen to make ice cream.
            </Text>
          </Content>
          <Footer>
            <Link
              isStandalone
              href="https://en.wikipedia.org/wiki/Ice_cream"
              target="_blank">Learn more about ice cream</Link>
          </Footer>
        </ContextualHelp>
      }>
      <ComboBoxItem>Chocolate</ComboBoxItem>
      <ComboBoxItem>Mint</ComboBoxItem>
      <ComboBoxItem>Strawberry</ComboBoxItem>
      <ComboBoxItem>Vanilla</ComboBoxItem>
      <ComboBoxItem>Chocolate Chip Cookie Dough</ComboBoxItem>
    </ComboBox>
  ),
  args: {
    label: 'Ice cream flavor'
  }
};

export const CustomWidth = {
  render: (args) => (
    <ComboBox {...args} styles={style({width: 384})}>
      <ComboBoxItem>Chocolate</ComboBoxItem>
      <ComboBoxItem>Mint</ComboBoxItem>
      <ComboBoxItem>Strawberry</ComboBoxItem>
      <ComboBoxItem>Vanilla</ComboBoxItem>
      <ComboBoxItem>Chocolate Chip Cookie Dough</ComboBoxItem>
    </ComboBox>
  ),
  args: Example.args,
  parameters: {
    docs: {
      disable: true
    }
  }
};
