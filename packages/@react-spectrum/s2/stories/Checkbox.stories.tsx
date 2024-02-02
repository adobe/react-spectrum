import type {Meta} from '@storybook/react';
import {Checkbox} from '../src/Checkbox';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (<Checkbox {...args}>Unsubscribe</Checkbox>);

export const LongLabel = (args: any) => (<Checkbox {...args} className={style({maxWidth: 32})()}>Checkbox with very long label so we can see wrapping</Checkbox>);
  
