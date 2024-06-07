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

import type {Meta, StoryObj} from '@storybook/react';
import {Button, ComboBox, ComboBoxItem, ComboBoxSection, Form, Header, Heading, Text} from '../src';
import DeviceTabletIcon from '../s2wf-icons/assets/svg/S2_Icon_DeviceTablet_20_N.svg';
import DeviceDesktopIcon from '../s2wf-icons/assets/svg/S2_Icon_DeviceDesktop_20_N.svg';

const meta: Meta<typeof ComboBox> = {
  component: ComboBox,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof ComboBox>;

export const Example: Story = {
  render: (args) => (
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

export const Validation = (args: any) => (
  <Form>
    <ComboBox {...args}>
      {(item) => <ComboBoxItem id={(item as IExampleItem).id} textValue={(item as IExampleItem).label}>{(item as IExampleItem).label}</ComboBoxItem>}
    </ComboBox>
    <Button type="submit" variant="primary">Submit</Button>
  </Form>
);

Validation.args = {
  ...Dynamic.args,
  isRequired: true
};

