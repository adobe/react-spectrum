import {Slider} from '../src/Slider';
import type {Meta} from '@storybook/react';
import {style} from '../style/spectrum-theme' with { type: 'macro' };

const meta: Meta<typeof Slider> = {
  component: Slider,
  parameters: {
    layout: 'centered',
    controls: {exclude: ['onChange']} // purposely excluded this control because it was slowing slider down a lot 
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 8}}>
    <Slider {...args} />
  </div>
);

Example.args = {
  label: 'Cookies',
  defaultValue: 30,
  thumbLabel: 'cookie'
};

export const FillOffset = (args: any) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 8}}>
    <Slider {...args} />
  </div>
);

FillOffset.args = {
  label: 'Exposure',
  fillOffset: 0,
  defaultValue: 1.83,
  minValue: -5,
  maxValue: 5,
  formatOptions: {signDisplay: 'always'},
  step: 0.01,
  thumbLabel: 'exposure'
};

export const FormatOptions = (args: any) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 8}}>
    <Slider {...args} styles={style({width: '[300px]'})} />
  </div>
);

FormatOptions.args = {
  label: 'Currency',
  defaultValue: 0,
  maxValue: 500,
  formatOptions: {style: 'currency', currency: 'JPY'},
  thumbLabel: 'currency'
};
