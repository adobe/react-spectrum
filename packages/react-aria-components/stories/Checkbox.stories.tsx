import {action} from '@storybook/addon-actions';
import {Checkbox} from 'react-aria-components';
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
  render: (args) => (
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
