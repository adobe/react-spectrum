import {Picker, PickerItem} from '../src/Picker';
import React from 'react';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};

import type {Meta} from '@storybook/react';

const meta: Meta<typeof Picker> = {
  component: Picker,
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

export const Example = (args: any) => (
  <section
    className={style({
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: 8,
      color: 'neutral',
      backgroundColor: {
        staticColor: {
          black: {default: 'yellow-400', dark: 'yellow-1100'},
          white: {default: 'blue-900', dark: 'blue-500'}
        }
      }
    })({staticColor: args.staticColor})}>
    <Picker {...args}>
      <PickerItem>Chocolate</PickerItem>
      <PickerItem>Mint</PickerItem>
      <PickerItem>Strawberry</PickerItem>
      <PickerItem>Vanilla</PickerItem>
      <PickerItem>Chocolate Chip Cookie Dough</PickerItem>
    </Picker>
  </section>
);

Example.args = {
  label: 'Ice cream flavor'
};
