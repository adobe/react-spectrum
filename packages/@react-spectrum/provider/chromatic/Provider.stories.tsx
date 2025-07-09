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
import {ComboBox, Item} from '@react-spectrum/combobox';
import customTheme from './custom-theme.css';
import {Flex} from '@react-spectrum/layout';
import {Form} from '@react-spectrum/form';
import {Meta, StoryFn, StoryObj} from '@storybook/react';
import {NumberField} from '@react-spectrum/numberfield';
import {Provider} from '../';
import {ProviderProps} from '@react-types/provider';
import {Radio, RadioGroup} from '@react-spectrum/radio';
import React, {JSX} from 'react';
import scaleLarge from '@adobe/spectrum-css-temp/vars/spectrum-large.css';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium.css';
import {SearchField} from '@react-spectrum/searchfield';
import {Switch} from '@react-spectrum/switch';
import {TextField} from '@react-spectrum/textfield';
import {useBreakpoint} from '@react-spectrum/utils';

const THEME = {
  light: customTheme,
  medium: scaleMedium,
  large: scaleLarge
};

const meta: Meta<ProviderProps> = {
  title: 'Provider'
} as Meta<ProviderProps>;

export default meta;

export type ProviderStory = StoryFn<typeof Template>;

const Template = (args: ProviderProps): JSX.Element => (
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

const NestedColorSchemeTemplate = (props: ProviderProps): JSX.Element => (
  <Provider colorScheme="dark" UNSAFE_style={{padding: 50, textAlign: 'center', width: 500}} {...props}>
    <Button variant="primary">I am a dark button</Button>
    <Provider colorScheme="light" UNSAFE_style={{padding: 50, margin: 50, textAlign: 'center'}}>
      <Button variant="primary">I am a light button</Button>
    </Provider>
  </Provider>
);

const NestedPropTemplate = (props: ProviderProps): JSX.Element => (
  <Provider isDisabled {...props}>
    <Button variant="primary">I am disabled</Button>
    <Provider isQuiet>
      <Button variant="primary">I am disabled and quiet</Button>
    </Provider>
  </Provider>
);

const ResponsiveStyleTemplate = (props: ProviderProps): JSX.Element => (
  <Provider {...props}>
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
);

const CustomResponsivStylePropsTemplate = (props: ProviderProps): JSX.Element => {
  let Breakpoint = () => {
    let {matchedBreakpoints} = useBreakpoint()!;
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
      UNSAFE_style={{padding: 50}}
      {...props}>
      <Breakpoint />
    </Provider>
  );
};

const BreakpointOmittedTemplate = (props: ProviderProps): JSX.Element => {
  let Breakpoint = () => {
    let {matchedBreakpoints} = useBreakpoint()!;
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
    <Provider UNSAFE_style={{padding: 50}} {...props}>
      <Breakpoint />
    </Provider>
  );
};

export type ProviderStoryObj = StoryObj<typeof Template>;

export const Default: ProviderStoryObj = {
  render: (args) => <Template {...args} />,
  name: 'default',
  args: {}
};

export const CustomTheme: ProviderStoryObj = {
  render: (args) => <Template {...args} />,
  name: 'custom theme',
  args: {theme: THEME}
};

export const NestedColorScheme: ProviderStoryObj = {
  render: (args) => <NestedColorSchemeTemplate {...args} />,
  name: 'nested color schemes',
  args: {}
};

export const NestedProp: ProviderStoryObj = {
  render: (args) => <NestedPropTemplate {...args} />,
  name: 'nested props',
  args: {}
};

export const Quiet: ProviderStoryObj = {
  render: (args) => <Template {...args} />,
  name: 'isQuiet',
  args: {isQuiet: true}
};

export const Emphasized: ProviderStoryObj = {
  render: (args) => <Template {...args} />,
  name: 'isEmphasized',
  args: {isEmphasized: true}
};

export const Disabled: ProviderStoryObj = {
  render: (args) => <Template {...args} />,
  name: 'isDisabled',
  args: {isDisabled: true}
};

export const ReadOnly: ProviderStoryObj = {
  render: (args) => <Template {...args} />,
  name: 'isReadOnly',
  args: {isReadOnly: true}
};

export const Required: ProviderStoryObj = {
  render: (args) => <Template {...args} />,
  name: 'isRequired',
  args: {isRequired: true}
};

export const ResponsiveStyle: ProviderStoryObj = {
  render: (args) => <ResponsiveStyleTemplate {...args} />,

  parameters: {
    chromatic: {viewports: [320, 700, 1000, 1200, 1300]},
    chromaticProvider: {
      colorSchemes: ['light'],
      locales: ['en-US'],
      scales: ['large'],
      disableAnimations: true
    }
  }
};

export const CustomResponsivStyleProps: ProviderStoryObj = {
  render: (args) => <CustomResponsivStylePropsTemplate {...args} />,
  name: 'custom responsive styleProps',

  parameters: {
    chromatic: {viewports: [320, 600, 1000, 1200, 1300, 1600]},
    chromaticProvider: {
      colorSchemes: ['light'],
      locales: ['en-US'],
      scales: ['large'],
      disableAnimations: true
    }
  }
};

export const BreakpointOmitted: ProviderStoryObj = {
  render: (args) => <BreakpointOmittedTemplate {...args} />,

  parameters: {
    chromatic: {viewports: [320, 1000, 1200]},
    chromaticProvider: {
      colorSchemes: ['light'],
      locales: ['en-US'],
      scales: ['large'],
      disableAnimations: true
    }
  }
};
