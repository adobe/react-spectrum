import {Picker, PickerItem} from '../src/Picker';

import type {Meta} from '@storybook/react';
import {StaticColorDecorator} from './utils';

const meta: Meta<typeof Picker> = {
  component: Picker,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?type=design&node-id=739-1453&mode=design&t=rZcwwKQ0qsEp7G8L-0'
    }
  },
  decorators: [StaticColorDecorator],
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <Picker {...args}>
    <PickerItem>Chocolate</PickerItem>
    <PickerItem>Mint</PickerItem>
    <PickerItem>Strawberry</PickerItem>
    <PickerItem>Vanilla</PickerItem>
    <PickerItem>Chocolate Chip Cookie Dough</PickerItem>
  </Picker>
);

Example.args = {
  label: 'Ice cream flavor'
};
