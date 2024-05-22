import {SearchField} from '../src';
import type {Meta} from '@storybook/react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof SearchField> = {
  component: SearchField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => <SearchField {...args} />;

Example.args = {
  label: 'Search'
};

export const CustomWidth = (args: any) => <SearchField {...args} styles={style({width: 256})} />;

CustomWidth.args = {
  label: 'Search'
};
CustomWidth.parameters = {
  docs: {
    disable: true
  }
};
