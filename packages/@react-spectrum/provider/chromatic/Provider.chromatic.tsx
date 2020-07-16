/*
 * Copyright 2020 Adobe. All rights reserved.
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
import {Checkbox} from '@react-spectrum/checkbox';
import customTheme from './custom-theme.css';
import {Flex} from '@react-spectrum/layout';
import {Form} from '@react-spectrum/form';
import {Provider} from '../';
import {Radio, RadioGroup} from '@react-spectrum/radio';
import React from 'react';
import scaleLarge from '@adobe/spectrum-css-temp/vars/spectrum-large.css';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium.css';
import {storiesOf} from '@storybook/react';
import {Switch} from '@react-spectrum/switch';
import {TextField} from '@react-spectrum/textfield';

const THEME = {
  light: customTheme,
  medium: scaleMedium,
  large: scaleLarge
};

storiesOf('Provider', module)
  // don't need all the isEmphasized etc tests, the value being sent is tested in unit tests
  // that the components look correctly with those values is being tested in those components chromatic tests

  // keeping custom theme to show that the theme only changes expected things, in this case, the button, nothing else
  .add(
    'custom theme',
    () => render({theme: THEME})
  );

function render(props = {}) {
  return (
    <Provider {...props} UNSAFE_style={{padding: 50}}>
      <Form>
        <Flex> {/* Extra div via Flex so that the button does not expand to 100% width */}
          <Button variant="primary">I am a button</Button>
        </Flex>
        <TextField
          label="A text field"
          placeholder="Something"
          marginTop="size-100"
          necessityIndicator="label"
          value="dummy value"/>
        <Checkbox isSelected>Cats!</Checkbox>
        <Switch isSelected>Dogs!</Switch>
        <RadioGroup value="dogs" label="A radio group">
          <Radio value="dogs">Dogs</Radio>
          <Radio value="cats">Cats</Radio>
          <Radio value="horses">Horses</Radio>
        </RadioGroup>
      </Form>
    </Provider>
  );
}
