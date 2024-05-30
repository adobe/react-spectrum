import {Badge, Text} from '../src';
import CheckmarkCircle from '../s2wf-icons/assets/svg/S2_Icon_CheckmarkCircle_20_N.svg';
import type {Meta} from '@storybook/react';
import {style} from '../style/spectrum-theme' with { type: 'macro' };

const meta: Meta<typeof Badge> = {
  component: Badge,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 8}}>
    <Badge {...args}>
      Licensed
    </Badge>
    <Badge {...args}>
      <CheckmarkCircle aria-label="done" />
      <Text>Licensed</Text>
    </Badge>
    <Badge {...args}>
      <CheckmarkCircle aria-label="done" />
    </Badge>
    <Badge {...args} styles={style({maxWidth: 128})}>
      <CheckmarkCircle aria-label="done" />
      <Text>Very long badge with wrapping text to see what happens</Text>
    </Badge>
  </div>
);
