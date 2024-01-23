import {ToggleButton} from '../src/ToggleButton';
import type {Meta, StoryFn} from '@storybook/react';
import {Icon} from '../src/Icon';
import {style} from '../style-macro/spectrum-theme.ts' with {type: 'macro'};
import NewIcon from '../s2wf-icons/assets/react/s2IconNew20N';
import {Text} from 'react-aria-components';

const meta: Meta<typeof ToggleButton> = {
  component: ToggleButton,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example: StoryFn<typeof ToggleButton> = (args) => {
  let buttons = (<div style={{display: 'flex', gap: 8}}>
    <ToggleButton {...args}><Icon><NewIcon /></Icon></ToggleButton>
    <ToggleButton {...args}>Press me</ToggleButton>
    <ToggleButton {...args}><Icon><NewIcon /></Icon><Text>Press me</Text></ToggleButton>
  </div>);
  if (args.staticColor) {
    return (
      <div
        className={style({
          padding: 8,
          backgroundColor: {
            staticColor: {
              black: {default: 'yellow-400', dark: 'yellow-1100'},
              white: {default: 'blue-900', dark: 'blue-500'}
            }
          },
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        })({staticColor: args.staticColor})}>
        {buttons}
      </div>
    );
  }
  return buttons;
};
