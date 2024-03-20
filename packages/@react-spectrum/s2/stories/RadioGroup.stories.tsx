import type {Meta} from '@storybook/react';
import {RadioGroup, Radio} from '../src';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof RadioGroup> = {
  component: RadioGroup,
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
  <RadioGroup description="A long description to test help text wrapping." errorMessage="A long error message to test help text wrapping. Only shows when invalid is set which makes it red too!" {...args}>
    <Radio value="soccer">Soccer</Radio>
    <Radio value="baseball">Baseball</Radio>
    <Radio value="football" isDisabled>Football</Radio>
    <Radio value="basketball">Basketball</Radio>
  </RadioGroup>
);

Example.args = {
  label: 'Favorite sport'
};

export const LongLabel = (args: any) => (
  <RadioGroup css={style({maxWidth: 128})} {...args}>
    <Radio value="longLabel">Radio with very long label so we can see wrapping</Radio>
  </RadioGroup>
);
