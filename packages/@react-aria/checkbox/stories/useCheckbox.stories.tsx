/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from '@storybook/addon-actions';
import {AriaCheckboxProps, useCheckbox} from '../';
import React from 'react';
import {StoryObj} from '@storybook/react';
import {useToggleState} from '@react-stately/toggle';

export default {
  title: 'useCheckbox'
};

export type CheckboxStory = StoryObj<typeof Checkbox>;

function Checkbox(props: AriaCheckboxProps) {
  let {children} = props;
  let state = useToggleState(props);
  let ref = React.useRef(null);
  let {inputProps, labelProps} = useCheckbox(props, state, ref);

  return (
    <>
      <label {...labelProps} style={{display: 'block'}}>
        {children}
      </label>
      <input {...inputProps} ref={ref} />
    </>
  );
}

export const Example: CheckboxStory = {
  render: (args) => <Checkbox {...args}>Unsubscribe</Checkbox>,
  args: {
    onFocus: action('onFocus'),
    onBlur: action('onBlur')
  }
};
