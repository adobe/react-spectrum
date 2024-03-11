import type {Meta, StoryObj} from '@storybook/react';
import {Text} from 'react-aria-components';
import NewIcon from '../src/wf-icons/New';
import {ButtonGroup} from '../src/ButtonGroup';
import {Button} from '../src/Button';
import {style} from '../style-macro/spectrum-theme' with { type: 'macro' };

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
        <Button variant="negative" css={style({maxWidth: 128})}>Very long button with wrapping text to see what happens</Button>
        <Button variant="secondary" css={style({maxWidth: 128})}>
          <NewIcon />
          <Text>Very long button with wrapping text to see what happens</Text>
        </Button>
      </ButtonGroup>
    );
    return buttons;
  },
  decorators: [(Story) => <div style={{minWidth: '100px', padding: '10px', resize: 'horizontal', overflow: 'auto'}}><Story /></div>],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=13663%3A7115'
    }
  }
};
