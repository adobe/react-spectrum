import {Text} from 'react-aria-components';
import {ActionButton} from '../src/ActionButton';

import type {Meta, StoryObj} from '@storybook/react';
import {Icon} from './Icon';

const meta: Meta<typeof ActionButton> = {
  component: ActionButton,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof ActionButton>;
export const Example: Story = {
  render: (args) => (<div style={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 8}}>
    <ActionButton {...args} size="XS"><Icon /><Text>Press me</Text></ActionButton>
    <ActionButton {...args} size="S"><Icon /><Text>Press me</Text></ActionButton>
    <ActionButton {...args} size="M"><Icon /><Text>Press me</Text></ActionButton>
    <ActionButton {...args} size="L"><Icon /><Text>Press me</Text></ActionButton>
    <ActionButton {...args} size="XL"><Icon /><Text>Press me</Text></ActionButton>
  </div>),
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=707-2774&t=iiwXqxruSpzhT0fe-0'
    }
  }
};
