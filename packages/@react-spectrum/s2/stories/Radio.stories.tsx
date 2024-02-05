import type {Meta} from '@storybook/react';
import {Radio} from '../src/Radio';
import {RadioGroup} from '../src/RadioGroup';
import {style} from '../style-macro/spectrum-theme.ts' with {type: 'macro'};

const meta: Meta<typeof Radio> = {
  component: Radio,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=164%3A16723'
    }
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <RadioGroup>
    <Radio value="soccer" {...args}>Soccer</Radio>
  </RadioGroup>
);

export const LongLabel = (args: any) => (
  <RadioGroup {...args}>
    <Radio value="soccer" className={style({maxWidth: 32})()} {...args}>Radio with very long label so we can see wrapping</Radio>
  </RadioGroup>
);
