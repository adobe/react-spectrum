import type {Meta} from '@storybook/react';
import {Meter} from '../src/Meter';
import {StaticColorDecorator} from './utils';

const meta: Meta<typeof Meter> = {
  component: Meter,
  parameters: {
    layout: 'centered'
  },
  decorators: [StaticColorDecorator],
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => <Meter {...args} />;

Example.args = {
  label: 'Storage space',
  value: 80,
  variant: 'informative'
};
