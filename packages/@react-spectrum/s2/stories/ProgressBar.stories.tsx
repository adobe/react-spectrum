import {ProgressBar} from '../src/ProgressBar';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof ProgressBar> = {
  component: ProgressBar,
  parameters: {
    layout: 'centered'
  },
  decorators: [
    (Story, {args}) => args.staticColor !== undefined ? (
      <div style={{backgroundColor: args.staticColor === 'black' ? 'yellow' : 'navy', padding: '15px'}}>
        <Story />
      </div>
    ) : <Story />
  ],
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => <ProgressBar {...args} />;

Example.args = {
  label: 'Loading…',
  value: 80
};
