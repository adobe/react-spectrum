import {Toolbar} from '../src/Toolbar';
import {Button} from '../src/Button';
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

export const Example: Story = args => (
  <Toolbar aria-label="Actions" {...args}>
    <Button variant="secondary">Copy</Button>
    <Button variant="secondary">Cut</Button>
    <Button variant="secondary">Paste</Button>
  </Toolbar>
);
