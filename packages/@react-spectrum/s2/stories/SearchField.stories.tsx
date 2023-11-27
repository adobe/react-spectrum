import {SearchField} from '../src/SearchField';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof SearchField> = {
  component: SearchField,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

export const Example = (args: any) => <SearchField {...args} />;

Example.args = {
  label: 'Search'
};
