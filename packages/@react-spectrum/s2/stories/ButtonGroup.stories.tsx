import type {Meta, StoryObj} from '@storybook/react';
import NewIcon from '../s2wf-icons/assets/svg/S2_Icon_New_20_N.svg';
import {Button, ButtonGroup, Text} from '../src';
import {style} from '../style/spectrum-theme' with { type: 'macro' };

const meta: Meta<typeof ButtonGroup> = {
  component: ButtonGroup,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof ButtonGroup>;
export const Example: Story = {
  render: (args) => {
    let buttons = (
      <ButtonGroup {...args}>
        <Button>Press me</Button>
        <Button variant="accent"><NewIcon /><Text>Test</Text></Button>
        <Button><NewIcon /></Button>
        <Button variant="negative" styles={style({maxWidth: 128})}>Very long button with wrapping text to see what happens</Button>
        <Button variant="secondary" styles={style({maxWidth: 128})}>
          <NewIcon />
          <Text>Very long button with wrapping text to see what happens</Text>
        </Button>
      </ButtonGroup>
    );
    return buttons;
  },
  decorators: [(Story) => <div style={{minWidth: '100px', padding: '10px', resize: 'horizontal', overflow: 'auto'}}><Story /></div>]
};
