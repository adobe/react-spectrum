import {Text} from 'react-aria-components';
import {Button} from '../src/Button';
import {Icon} from './Icon';
import {style} from '../style-macro/spectrum-theme.ts' with {type: 'macro'};

import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof Button>;
export const Example: Story = {
  render: (args) => (<div style={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 8}}>
    <Button {...args}>Press me</Button>
    <Button {...args}><Icon /><Text>Test</Text></Button>
    <Button {...args} isIconOnly><Icon /></Button>
    <Button variant="primary" style="fill">Test</Button>
    <Button className={style({maxWidth: 32})()}>Very long button with wrapping text to see what happens</Button>
    <Button className={style({maxWidth: 32})()}>
      <Icon />
      <Text>Very long button with wrapping text to see what happens</Text>
    </Button>
  </div>),
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=707-2774&t=iiwXqxruSpzhT0fe-0'
    }
  }
};
