import {Tag, TagGroup} from '../src/TagGroup';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof TagGroup> = {
  component: TagGroup,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <TagGroup {...args}>
    <Tag>Chocolate</Tag>
    <Tag>Mint</Tag>
    <Tag>Strawberry</Tag>
    <Tag>Vanilla</Tag>
  </TagGroup>
);

Example.args = {
  label: 'Ice cream flavor',
  selectionMode: 'single'
};
