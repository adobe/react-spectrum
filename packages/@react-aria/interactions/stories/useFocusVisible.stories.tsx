/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button} from '@react-spectrum/button';
import {ComponentMeta} from '@storybook/react';
import React, {useRef} from 'react';
import {TextField} from '@react-spectrum/textfield';
import {useFocusVisible} from '../src';

export default {
  title: 'useFocusVisible',
  argTypes: {}
} as ComponentMeta<typeof FocusVisibleExample>;

export const FocusVisible = {
  render: () => <FocusVisibleExample />
};

function FocusVisibleExample() {
  let firstField = useRef(null);
  let secondField = useRef(null);
  const {isFocusVisible} = useFocusVisible();
  return (
    <div>
      <div role="article">isFocusVisible: {`${isFocusVisible}`}</div>
      <Button variant="primary" onPress={() => firstField.current.focus()}>Focus first</Button>
      <Button variant="primary" onPress={() => secondField.current.focus()}>Focus second</Button>
      <fieldset>
        <legend>React Spectrum Textfield</legend>
        <div tabIndex={-1}>
          <TextField
            ref={firstField}
            label={
              <>
                In tabIndex={'{-1}'}
              </>
            }
            defaultValue="test" />
        </div>
        <div>
          <TextField
            ref={secondField}
            label={
              <>
                Not In tabIndex={'{-1}'}
              </>
            }
            defaultValue="test" />
        </div>
      </fieldset>
    </div>
  );
}
