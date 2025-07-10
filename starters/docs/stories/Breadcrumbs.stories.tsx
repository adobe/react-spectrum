import {Breadcrumbs, Breadcrumb} from '../src/Breadcrumbs';
import {Link} from '../src/Link';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof Breadcrumbs> = {
  component: Breadcrumbs,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Breadcrumbs>;

export const Example: Story = (args) => (
  <Breadcrumbs {...args}>
    <Breadcrumb>
      <Link href="/">Home</Link>
    </Breadcrumb>
    <Breadcrumb>
      <Link href="/react-aria/">React Aria</Link>
    </Breadcrumb>
    <Breadcrumb>
      <Link>Breadcrumbs</Link>
    </Breadcrumb>
  </Breadcrumbs>
);
