import type {Meta} from '@storybook/react';
import {Checkbox} from '../src';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (<Checkbox {...args}>Unsubscribe</Checkbox>);

export const LongLabel = (args: any) => (<Checkbox {...args} css={style({maxWidth: 128})}>Checkbox with very long label so we can see wrapping</Checkbox>);
