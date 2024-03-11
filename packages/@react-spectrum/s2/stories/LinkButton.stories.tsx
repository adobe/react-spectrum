import type {Meta, StoryObj} from '@storybook/react';
import {Text} from 'react-aria-components';
import NewIcon from '../src/wf-icons/New';
import {LinkButton} from '../src/Button';
import {style} from '../style-macro/spectrum-theme' with { type: 'macro' };

const meta: Meta<typeof LinkButton> = {
  component: LinkButton,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof LinkButton>;
export const Example: Story = {
  render: (args) => {
    let buttons = (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 8}}>
        <LinkButton {...args}>Press me</LinkButton>
        <LinkButton {...args}><NewIcon /><Text>Test</Text></LinkButton>
        <LinkButton {...args}><NewIcon /></LinkButton>
        <LinkButton {...args} css={style({maxWidth: 128})}>Very long button with wrapping text to see what happens</LinkButton>
        <LinkButton {...args} css={style({maxWidth: 128})}>
          <NewIcon />
          <Text>Very long button with wrapping text to see what happens</Text>
        </LinkButton>
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
            gap: 8
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
  },
  args: {
    href: 'https://react-spectrum.adobe.com/',
    target: '_blank'
  }
};
