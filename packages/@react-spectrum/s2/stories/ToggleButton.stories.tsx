import {ToggleButton} from '../src/ToggleButton';
import type {Meta, StoryFn} from '@storybook/react';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import NewIcon from '../src/wf-icons/New';
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
    <ToggleButton {...args}><NewIcon /></ToggleButton>
    <ToggleButton {...args}>Press me</ToggleButton>
    <ToggleButton {...args}><NewIcon /><Text>Press me</Text></ToggleButton>
  </div>);
  if (args.staticColor) {
    return (
      <div
        className={style({
          padding: 8,
          backgroundColor: {
            staticColor: {
              black: 'yellow',
              white: 'blue'
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
