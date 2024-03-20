import {ToggleButton, Text} from '../src';
import type {Meta, StoryFn} from '@storybook/react';
import NewIcon from '../s2wf-icons/assets/svg/S2_Icon_New_20_N.svg';
import {StaticColorDecorator} from './utils';

const meta: Meta<typeof ToggleButton> = {
  component: ToggleButton,
  parameters: {
    layout: 'centered'
  },
  decorators: [StaticColorDecorator],
  tags: ['autodocs']
};

export default meta;

export const Example: StoryFn<typeof ToggleButton> = (args) => {
  return (
    <div style={{display: 'flex', gap: 8}}>
      <ToggleButton {...args}><NewIcon /></ToggleButton>
      <ToggleButton {...args}>Press me</ToggleButton>
      <ToggleButton {...args}><NewIcon /><Text>Press me</Text></ToggleButton>
    </div>
  );
};
