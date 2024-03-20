import {StatusLight} from '../src';
import type {Meta} from '@storybook/react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof StatusLight> = {
  component: StatusLight,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => <StatusLight {...args}>Status</StatusLight>;

Example.args = {
  variant: 'positive'
};

export const LongLabel = (args: any) => <StatusLight {...args} css={style({maxWidth: 128})}>StatusLight with very long label so we can see wrapping</StatusLight>;

LongLabel.args = {
  variant: 'positive'
};
