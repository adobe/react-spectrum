import {action} from 'storybook/actions';
import {Checkbox} from '../src/Checkbox';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import './styles.css';

export default {
  title: 'React Aria Components/Checkbox',
  component: Checkbox,
  args: {
    onFocus: action('onFocus'),
    onBlur: action('onBlur')
  }
} as Meta<typeof Checkbox>;

export type CheckboxStory = StoryObj<typeof Checkbox>;

export const CheckboxExample: CheckboxStory = {
  render: args => (
    <Checkbox {...args}>
      <div className="checkbox">
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <polyline points="1 9 7 14 15 4" />
        </svg>
      </div>
      Unsubscribe
    </Checkbox>
  )
};

// Demonstrates stretching the hidden input over the visible component so the
// screen reader focus ring tracks the checkbox instead of collapsing to a 1x1px
// square. Requires the label (or a positioned ancestor) to be a containing block.
export const CheckboxScreenReaderFocusRing: CheckboxStory = {
  render: args => (
    <Checkbox
      {...args}
      style={{position: 'relative'}}
      visuallyHiddenStyle={{inset: 0, width: 'auto', height: 'auto'}}
      inputStyle={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
      <div className="checkbox">
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <polyline points="1 9 7 14 15 4" />
        </svg>
      </div>
      Unsubscribe
    </Checkbox>
  )
};
