import type {Meta, StoryObj} from '@storybook/react';
import {Text} from 'react-aria-components';
import NewIcon from '../src/wf-icons/New';
import {Button} from '../src/Button';
import {style} from '../style-macro/spectrum-theme' with { type: 'macro' };

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
  render: (args) => {
    let buttons = (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 8}}>
        <Button {...args}>Press me</Button>
        <Button {...args}><NewIcon /><Text>Test</Text></Button>
        <Button {...args}><NewIcon /></Button>
        <Button {...args} css={style({maxWidth: 32})}>Very long button with wrapping text to see what happens</Button>
        <Button {...args} css={style({maxWidth: 32})}>
          <NewIcon />
          <Text>Very long button with wrapping text to see what happens</Text>
        </Button>
      </div>
    );
    if (args.staticColor) {
      return (
        <div
          className={style({
            padding: 8,
            backgroundColor: {
              staticColor: {
                black: 'yellow',
                white: 'blue'
              }
            },
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          })({staticColor: args.staticColor})}>
          {buttons}
        </div>
      );
    }
    return buttons;
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=707-2774&t=iiwXqxruSpzhT0fe-0'
    }
  }
};
