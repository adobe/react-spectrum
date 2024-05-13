import type {Meta, StoryObj} from '@storybook/react';
import {Button, ComboBox, ComboBoxItem, ComboBoxSection, Form, Header, Heading, Text} from '../src';
import DeviceTabletIcon from '../s2wf-icons/assets/svg/S2_Icon_DeviceTablet_20_N.svg';
import DeviceDesktopIcon from '../s2wf-icons/assets/svg/S2_Icon_DeviceDesktop_20_N.svg';

const meta: Meta<typeof ComboBox> = {
  component: ComboBox,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?type=design&node-id=739-1453&mode=design&t=rZcwwKQ0qsEp7G8L-0'
    }
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

