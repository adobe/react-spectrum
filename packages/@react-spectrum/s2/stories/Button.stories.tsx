import type {Meta, StoryObj} from '@storybook/react';
import {Text} from 'react-aria-components';
import NewIcon from '../s2wf-icons/assets/react/s2IconNew20N';
import {Button} from '../src/Button';
import {Icon} from '../src/Icon.tsx';
import {style} from '../style-macro/spectrum-theme.ts' with { type: 'macro' };

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
        <Button {...args}><Icon><NewIcon /></Icon><Text>Test</Text></Button>
        <Button {...args}><Icon><NewIcon /></Icon></Button>
        <Button {...args} className={style({maxWidth: 32})()}>Very long button with wrapping text to see what happens</Button>
        <Button {...args} className={style({maxWidth: 32})()}>
          <Icon><NewIcon /></Icon>
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
                black: {default: 'yellow-400', dark: 'yellow-1100'},
                white: {default: 'blue-900', dark: 'blue-500'}
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
