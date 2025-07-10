import {Toolbar} from '../src/Toolbar';
import {
  Group,
  Separator
} from 'react-aria-components';
import {Button} from '../src/Button';
import {ToggleButton} from '../src/ToggleButton';
import {Checkbox} from '../src/Checkbox';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof Toolbar> = {
  component: Toolbar,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryFn<typeof Toolbar>;

export const Example: Story = (args) => (
  <Toolbar aria-label="Text formatting" {...args}>
    <Group aria-label="Style">
      <ToggleButton aria-label="Bold">
        <b>B</b>
      </ToggleButton>
      <ToggleButton aria-label="Italic">
        <i>I</i>
      </ToggleButton>
      <ToggleButton aria-label="Underline">
        <u>U</u>
      </ToggleButton>
    </Group>
    <Separator orientation="vertical" />
    <Group aria-label="Clipboard">
      <Button>Copy</Button>
      <Button>Paste</Button>
      <Button>Cut</Button>
    </Group>
    <Separator orientation="vertical" />
    <Checkbox>
      Night Mode
    </Checkbox>
  </Toolbar>
);
