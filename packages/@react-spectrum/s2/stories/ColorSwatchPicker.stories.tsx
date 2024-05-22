import {ColorSwatch} from '../src/ColorSwatch';
import {ColorSwatchPicker} from '../src/ColorSwatchPicker';
import type {Meta} from '@storybook/react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof ColorSwatchPicker> = {
  component: ColorSwatchPicker,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <ColorSwatchPicker defaultValue="#f00" {...args}>
    <ColorSwatch color="#f00" />
    <ColorSwatch color="#0f0" />
    <ColorSwatch color="#0ff" />
    <ColorSwatch color="#00f" />
  </ColorSwatchPicker>
);

export const ManySwatches = (args: any) => (
  <ColorSwatchPicker {...args} styles={style({maxWidth: 192})}>
    {Array.from(Array(24)).map(() => {
      let color = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
      return <ColorSwatch key={color} color={color} />;
    })}
  </ColorSwatchPicker>
);
