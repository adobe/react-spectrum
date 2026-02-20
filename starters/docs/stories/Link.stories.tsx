import {Link} from '../src/Link';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof Link> = {
  component: Link,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Link>;

export const Example: Story = (args) => <Link {...args}>The missing link</Link>;

Example.args = {
  href: 'https://www.imdb.com/title/tt6348138/',
  target: '_blank'
};
