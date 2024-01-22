import React from 'react';
import { Breadcrumb, Breadcrumbs } from '../src/Breadcrumbs';

import type { Meta } from '@storybook/react';

const meta: Meta<typeof Breadcrumbs> = {
  component: Breadcrumbs,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <Breadcrumbs {...args}>
    <Breadcrumb href="/">Home</Breadcrumb>
    <Breadcrumb href="/react-aria">React Aria</Breadcrumb>
    <Breadcrumb>Breadcrumbs</Breadcrumb>
  </Breadcrumbs>
);
