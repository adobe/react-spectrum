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
import {Checkbox, CheckboxGroup} from '@react-spectrum/checkbox';
import {ComboBox} from '@react-spectrum/combobox';
import customTheme from './custom-theme.css';
import {Flex} from '@react-spectrum/layout';
import {Form} from '@react-spectrum/form';
import {Item, Picker} from '@react-spectrum/picker';
import {NumberField} from '@react-spectrum/numberfield';
import {Provider} from '../';
import {Radio, RadioGroup} from '@react-spectrum/radio';
import React from 'react';
import scaleLarge from '@adobe/spectrum-css-temp/vars/spectrum-large.css';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium.css';
import {SearchField} from '@react-spectrum/searchfield';
import {SearchWithin} from '@react-spectrum/searchwithin';
import {storiesOf} from '@storybook/react';
import {Switch} from '@react-spectrum/switch';
import {TextField} from '@react-spectrum/textfield';
import {useBreakpoint} from '@react-spectrum/utils';

const THEME = {
  light: customTheme,
  medium: scaleMedium,
  large: scaleLarge
};

storiesOf('Provider', module)
  .addParameters({providerSwitcher: {status: 'positive'}})
  .add(
    'colorScheme: dark',
    () => render({colorScheme: 'dark', style: {padding: 50, textAlign: 'center', width: 500}})
  )
  .add(
    'scale: large',
    () => render({scale: 'large'})
  )
  .add(
    'nested color schemes',
    () => (
      <Provider colorScheme="dark" UNSAFE_style={{padding: 50, textAlign: 'center', width: 500}}>
        <Button variant="primary">I am a dark button</Button>
        <Provider colorScheme="light" UNSAFE_style={{padding: 50, margin: 50, textAlign: 'center'}}>
          <Button variant="primary">I am a light button</Button>
        </Provider>
      </Provider>
    )
  )
  .add(
    'nested props',
    () => (
      <Provider isDisabled>
        <Button variant="primary">I am disabled</Button>
        <Provider isQuiet>
          <Button variant="primary">I am disabled and quiet</Button>
        </Provider>
      </Provider>
    )
  )
  .add(
    'isQuiet',
    () => render({isQuiet: true})
  )
  .add(
    'isEmphasized',
    () => render({isEmphasized: true})
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true})
  )
  .add(
    'isReadOnly',
    () => render({isReadOnly: true})
  )
  .add(
    'isRequired',
    () => render({isRequired: true})
  )
  .add(
    'custom theme',
    () => render({theme: THEME})
  )
  .add(
    'responsive styleProps',
    () => (
      <Provider UNSAFE_style={{padding: 50}}>
        <div>
          <TextField
            label="A text field"
            placeholder="Something"
            width={{base: 'size-800', S: 'size-1000', M: 'size-2000', L: 'size-3000'}} />
        </div>
        <Button
          isHidden={{base: false, S: false, M: false, L: true}}
          marginTop={{base: 'size-100', M: 'size-1000'}}
          variant="primary" >
          This button is hidden in large display.
        </Button>
      </Provider>
    )
  )
  .add(
    'custom responsive styleProps',
    () => {
      let Breakpoint = () => {
        let {matchedBreakpoints} = useBreakpoint();
        let breakpoint = matchedBreakpoints[0];
        let width = {base: 'size-1600', XS: 'size-2000', S: 'size-2400', M: 'size-3000', L: 'size-3400', XL: 'size-4600', XXL: 'size-6000'};
        return (
          <>
            <Button
              variant="primary"
              width={width} >
              Button with {breakpoint} breakpoint.
            </Button>
            <div>
              width: {width[breakpoint]}
            </div>
          </>
        );
      };
      return (
        <Provider
          breakpoints={{S: 480, M: 640, L: 1024}}
          UNSAFE_style={{padding: 50}}>
          <Breakpoint />
        </Provider>
      );
    })
    .add(
      'breakpoint omitted',
      () => {
        let Breakpoint = () => {
          let {matchedBreakpoints} = useBreakpoint();
          let breakpoint = matchedBreakpoints[0];
          let width = {base: 'size-1600', S: 'size-2400', L: 'size-3400'};
          return (
            <>
              <p>
                button's width will be S: 'size-2400' at M viewport.
              </p>
              <Button
                variant="primary"
                width={width} >
                Button with {breakpoint} breakpoint.
              </Button>
            </>
          );
        };
        return (
          <Provider UNSAFE_style={{padding: 50}}>
            <Breakpoint />
          </Provider>
        );
      });

function render(props = {}) {
  return (
    <Provider {...props} UNSAFE_style={{padding: 50}}>
      <Form>
        <Flex> {/* Extra div via Flex so that the button does not expand to 100% width */}
          <Button variant="primary">I am a button</Button>
        </Flex>
        <CheckboxGroup defaultValue={['dragons']} label="Pets">
          <Checkbox value="dogs">Dogs</Checkbox>
          <Checkbox value="cats">Cats</Checkbox>
          <Checkbox value="dragons">Dragons</Checkbox>
        </CheckboxGroup>
        <ComboBox label="More Animals">
          <Item key="red panda">Red Panda</Item>
          <Item key="aardvark">Aardvark</Item>
          <Item key="kangaroo">Kangaroo</Item>
          <Item key="snake">Snake</Item>
        </ComboBox>
        <NumberField label="Years lived there" />
        <RadioGroup label="A radio group">
          <Radio value="dogs">Dogs</Radio>
          <Radio value="cats">Cats</Radio>
          <Radio value="horses">Horses</Radio>
        </RadioGroup>
        <SearchField label="Search" />
        <SearchWithin label="Search">
          <SearchField placeholder="Search" />
          <Picker name="favorite-color3" label="Favorite color searchwithin">
            <Item key="red">Red</Item>
            <Item key="orange">Orange</Item>
            <Item key="yellow">Yellow</Item>
            <Item key="green">Green</Item>
            <Item key="blue">Blue</Item>
            <Item key="purple">Purple</Item>
          </Picker>
        </SearchWithin>
        <Switch isSelected>Dogs!</Switch>
        <TextField
          label="A text field"
          placeholder="Something"
          marginTop="size-100"
          necessityIndicator="label"
          value="dummy value" />
      </Form>
    </Provider>
  );
}
