import type {Meta, StoryObj} from '@storybook/react';
import {Text} from 'react-aria-components';
import NewIcon from '../s2wf-icons/assets/react/s2IconNew20N';
import {ButtonGroup} from '../src/ButtonGroup';
import {Button} from '../src/Button';
import {Icon} from '../src/Icon';
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
        <Button variant='accent'><Icon><NewIcon /></Icon><Text>Test</Text></Button>
        <Button><Icon><NewIcon /></Icon></Button>
        <Button variant="negative" className={style({maxWidth: 32})()}>Very long button with wrapping text to see what happens</Button>
        <Button variant="secondary" className={style({maxWidth: 32})()}>
          <Icon><NewIcon /></Icon>
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
