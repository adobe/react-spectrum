import type {Meta, StoryObj} from '@storybook/react';
import NewIcon from '../s2wf-icons/assets/svg/S2_Icon_New_20_N.svg';
import {LinkButton, Text} from '../src';
import {style} from '../style/spectrum-theme' with { type: 'macro' };
import {StaticColorDecorator} from './utils';

const meta: Meta<typeof LinkButton> = {
  component: LinkButton,
  parameters: {
    layout: 'centered'
  },
  decorators: [StaticColorDecorator],
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof LinkButton>;
export const Example: Story = {
  render: (args) => {
    return (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 8}}>
        <LinkButton {...args}>Press me</LinkButton>
        <LinkButton {...args}><NewIcon /><Text>Test</Text></LinkButton>
        <LinkButton {...args}><NewIcon /></LinkButton>
        <LinkButton {...args} styles={style({maxWidth: 128})}>Very long button with wrapping text to see what happens</LinkButton>
        <LinkButton {...args} styles={style({maxWidth: 128})}>
          <NewIcon />
          <Text>Very long button with wrapping text to see what happens</Text>
        </LinkButton>
      </div>
    );
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
