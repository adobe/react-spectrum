import type {Meta, StoryObj} from '@storybook/react';
import NewIcon from '../src/wf-icons/New';
import {Button, Text} from '../src';
import {style} from '../style/spectrum-theme' with { type: 'macro' };
import {StaticColorDecorator} from './utils';

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: {
    layout: 'centered'
  },
  decorators: [StaticColorDecorator],
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof Button>;
export const Example: Story = {
  render: (args) => {
    return (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 8}}>
        <Button {...args}>Press me</Button>
        <Button {...args}><NewIcon /><Text>Test</Text></Button>
        <Button {...args}><Text>Test</Text><NewIcon /></Button>
        <Button {...args}><NewIcon /></Button>
        <Button {...args} css={style({maxWidth: 128})}>Very long button with wrapping text to see what happens</Button>
        <Button {...args} css={style({maxWidth: 128})}>
          <NewIcon />
          <Text>Very long button with wrapping text to see what happens</Text>
        </Button>
      </div>
    );
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=707-2774&t=iiwXqxruSpzhT0fe-0'
    }
  }
};
