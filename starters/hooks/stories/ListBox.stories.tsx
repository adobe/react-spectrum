import {ListBox, ListBoxItem} from '../src/ListBox';
import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof ListBox> = {
  component: ListBox,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof ListBox>;

export const Example: Story = args => (
  <ListBox aria-label="Favorite animal" selectionMode="single" {...args}>
    <ListBoxItem id="aardvark">Aardvark</ListBoxItem>
    <ListBoxItem id="cat">Cat</ListBoxItem>
    <ListBoxItem id="dog">Dog</ListBoxItem>
    <ListBoxItem id="kangaroo">Kangaroo</ListBoxItem>
    <ListBoxItem id="panda">Panda</ListBoxItem>
    <ListBoxItem id="snake">Snake</ListBoxItem>
  </ListBox>
);
