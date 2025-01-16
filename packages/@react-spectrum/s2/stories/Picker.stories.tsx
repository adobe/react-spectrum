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

import {
  Button,
  Content,
  ContextualHelp,
  Footer,
  Form,
  Header,
  Heading,
  Link,
  Picker,
  PickerItem,
  PickerSection,
  Text
} from '../src';
import {categorizeArgTypes, StaticColorDecorator} from './utils';
import DeviceDesktopIcon from '../s2wf-icons/S2_Icon_DeviceDesktop_20_N.svg';
import DeviceTabletIcon from '../s2wf-icons/S2_Icon_DeviceTablet_20_N.svg';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '../style' with {type: 'macro'};

const meta: Meta<typeof Picker<any>> = {
  component: Picker,
  parameters: {
    layout: 'centered'
  },
  decorators: [StaticColorDecorator],
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', ['onOpenChange', 'onSelectionChange'])
  },
  title: 'Picker'
};

export default meta;
type Story = StoryObj<typeof Picker<any>>;

export const Example = {
  render: (args: any) => (
    <Picker {...args}>
      <PickerItem>Chocolate</PickerItem>
      <PickerItem>Mint</PickerItem>
      <PickerItem>Strawberry</PickerItem>
      <PickerItem>Vanilla</PickerItem>
      <PickerItem>Chocolate Chip Cookie Dough</PickerItem>
    </Picker>
  ),
  args: {
    label: 'Ice cream flavor'
  }
};

export const Sections: Story = {
  render: (args) => (
    <Picker {...args}>
      <PickerSection id="neopolitan">
        <Header>
          <Heading>Neopolitan flavors</Heading>
          <Text slot="description">These flavors are common</Text>
        </Header>
        <PickerItem>Chocolate</PickerItem>
        <PickerItem>Strawberry</PickerItem>
        <PickerItem>Vanilla</PickerItem>
      </PickerSection>
      <PickerSection id="other">
        <Header>
          <Heading>Others</Heading>
          <Text slot="description">These flavors are uncommon</Text>
        </Header>
        <PickerItem>Mint</PickerItem>
        <PickerItem>Chocolate Chip Cookie Dough</PickerItem>
      </PickerSection>
    </Picker>
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
    <Picker {...args}>
      {(item) => <PickerItem id={(item as IExampleItem).id} textValue={(item as IExampleItem).label}>{(item as IExampleItem).label}</PickerItem>}
    </Picker>
  ),
  args: {
    label: 'Favorite ice cream flavor',
    items
  }
};

export const WithIcons: Story = {
  render: (args) => (
    <Picker {...args}>
      <PickerItem textValue="Illustrator for iPad">
        <DeviceTabletIcon />
        <Text slot="label">Illustrator for iPad</Text>
        <Text slot="description">Share a low-res snapshot</Text>
      </PickerItem>
      <PickerItem textValue="Illustrator for desktop">
        <DeviceDesktopIcon />
        <Text slot="label">Illustrator for desktop</Text>
        <Text slot="description">Share a hi-res</Text>
      </PickerItem>
    </Picker>
  ),
  args: {
    label: 'Where to share'
  }
};

const ValidationRender = (props) => (
  <Form>
    <Picker {...props}>
      {(item) => <PickerItem id={(item as IExampleItem).id} textValue={(item as IExampleItem).label}>{(item as IExampleItem).label}</PickerItem>}
    </Picker>
    <Button type="submit" variant="primary">Submit</Button>
  </Form>
);

export const Validation = {
  render: (args) => <ValidationRender {...args} />,
  args: {
    ...Dynamic.args,
    isRequired: true
  }
};

export const CustomWidth = {
  render: (args: any) => (
    <Picker {...args} styles={style({width: 384})}>
      <PickerItem>Chocolate</PickerItem>
      <PickerItem>Mint</PickerItem>
      <PickerItem>Strawberry</PickerItem>
      <PickerItem>Vanilla</PickerItem>
      <PickerItem>Chocolate Chip Cookie Dough</PickerItem>
    </Picker>
  ),
  args: Example.args,
  parameters: {
    docs: {
      disable: true
    }
  }
};

const ContextualHelpExampleRender = (props) => (
  <Picker
    {...props}
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
    <PickerItem>Chocolate</PickerItem>
    <PickerItem>Mint</PickerItem>
    <PickerItem>Strawberry</PickerItem>
    <PickerItem>Vanilla</PickerItem>
    <PickerItem>Chocolate Chip Cookie Dough</PickerItem>
  </Picker>
);

export const ContextualHelpExample = {
  render: (args) => <ContextualHelpExampleRender {...args} />,
  args: {
    label: 'Ice cream flavor'
  }
};
