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
import {Meta, Story} from '@storybook/react';
import {NumberField} from '@react-spectrum/numberfield';
import {Provider} from '../';
import {ProviderProps} from '@react-types/provider';
import {Radio, RadioGroup} from '@react-spectrum/radio';
import React from 'react';
import scaleLarge from '@adobe/spectrum-css-temp/vars/spectrum-large.css';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium.css';
import {SearchField} from '@react-spectrum/searchfield';
import {SearchWithin} from '@react-spectrum/searchwithin';
import {Switch} from '@react-spectrum/switch';
import {TextField} from '@react-spectrum/textfield';

const THEME = {
  light: customTheme,
  medium: scaleMedium,
  large: scaleLarge
};

const meta: Meta<ProviderProps> = {
  title: 'Provider'
};

export default meta;

const Template = (): Story<ProviderProps> => (args) => (
  <Provider {...args} UNSAFE_style={{padding: 50}}>
    <Form>
      <Flex> {/* Extra div via Flex so that the button does not expand to 100% width */}
        <Button variant="primary">I am a button</Button>
      </Flex>
      <Checkbox isSelected>Cats!</Checkbox>
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
      <RadioGroup value="dogs" label="A radio group">
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

const NestedColorSchemeTemplate = (): Story<ProviderProps> => () => (
  <Provider colorScheme="dark" UNSAFE_style={{padding: 50, textAlign: 'center', width: 500}}>
    <Button variant="primary">I am a dark button</Button>
    <Provider colorScheme="light" UNSAFE_style={{padding: 50, margin: 50, textAlign: 'center'}}>
      <Button variant="primary">I am a light button</Button>
    </Provider>
  </Provider>
);

const NestedPropTemplate = (): Story<ProviderProps> => () => (
  <Provider isDisabled>
    <Button variant="primary">I am disabled</Button>
    <Provider isQuiet>
      <Button variant="primary">I am disabled and quiet</Button>
    </Provider>
  </Provider>
);

export const Default = Template().bind({});
Default.storyName = 'default';
Default.args = {};

// keeping custom theme to show that the theme only changes expected things, in this case, the button, nothing else
export const CustomTheme = Template().bind({});
CustomTheme.storyName = 'custom theme';
CustomTheme.args = {theme: THEME};

export const NestedColorScheme = NestedColorSchemeTemplate().bind({});
NestedColorScheme.storyName = 'nested color schemes';
NestedColorScheme.args = {};

export const NestedProp = NestedPropTemplate().bind({});
NestedProp.storyName = 'nested props';
NestedProp.args = {};

// Previous this weren't included because of unit tests and visual comparisions
// in the individual components, but we should have this to confirm that components
// are using usePRoviderProps correctly
export const Quiet = Template().bind({});
Quiet.storyName = 'isQuiet';
Quiet.args = {isQuiet: true};

export const Emphasized = Template().bind({});
Emphasized.storyName = 'isEmphasized';
Emphasized.args = {isEmphasized: true};

export const Disabled = Template().bind({});
Disabled.storyName = 'isDisabled';
Disabled.args = {isDisabled: true};

export const ReadOnly = Template().bind({});
ReadOnly.storyName = 'isReadOnly';
ReadOnly.args = {isReadOnly: true};

export const Required = Template().bind({});
Required.storyName = 'isRequired';
Required.args = {isRequired: true};
