import type {Meta, StoryObj} from '@storybook/react';
import {Text} from 'react-aria-components';
import NewIcon from '../s2wf-icons/assets/react/s2IconNew20N';
import {ActionButton} from '../src/ActionButton';
import {Icon} from '../src/Icon';

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
  render: (args) => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 8}}>
      <ActionButton {...args} size="XS"><Icon><NewIcon /></Icon><Text>Press me</Text></ActionButton>
      <ActionButton {...args} size="S"><Icon><NewIcon /></Icon><Text>Press me</Text></ActionButton>
      <ActionButton {...args} size="M"><Icon><NewIcon /></Icon><Text>Press me</Text></ActionButton>
      <ActionButton {...args} size="L"><Icon><NewIcon /></Icon><Text>Press me</Text></ActionButton>
      <ActionButton {...args} size="XL"><Icon><NewIcon /></Icon><Text>Press me</Text></ActionButton>
    </div>
  ),
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=707-2774&t=iiwXqxruSpzhT0fe-0'
    }
  }
};
