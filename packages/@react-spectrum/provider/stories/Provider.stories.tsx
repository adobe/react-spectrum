import {Button} from '@react-spectrum/button';
import {Checkbox} from '@react-spectrum/checkbox';
import customTheme from './custom-theme.css';
import {DatePicker} from '@react-spectrum/datepicker';
import {FieldLabel} from '@react-spectrum/form';
import {Provider} from '../';
import {Radio, RadioGroup} from '@react-spectrum/radio';
import React from 'react';
import scaleLarge from '@adobe/spectrum-css-temp/vars/spectrum-large-unique.css';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import {storiesOf} from '@storybook/react';
import {Switch} from '@react-spectrum/switch';
import {TextField} from '@react-spectrum/textfield';

const THEME = {
  light: customTheme,
  medium: scaleMedium,
  large: scaleLarge
};

storiesOf('Provider', module)
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
    'locale: cs-CZ',
    () => render({locale: 'cs-CZ'})
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
  );

function render(props = {}) {
  return (
    <Provider {...props} UNSAFE_style={{padding: 50}}>
      <Button variant="primary">I am a button</Button>
      <FieldLabel label="A text field" marginTop="size-100">
        <TextField placeholder="Something" />
      </FieldLabel>
      <FieldLabel label="A checkbox" marginTop="size-100">
        <Checkbox>Cats!</Checkbox>
      </FieldLabel>
      <FieldLabel label="A switch" marginTop="size-100">
        <Switch>Dogs!</Switch>
      </FieldLabel>
      <FieldLabel label="A radio group" marginTop="size-100">
        <RadioGroup>
          <Radio value="dogs">Dogs</Radio>
          <Radio value="cats">Cats</Radio>
          <Radio value="horses">Horses</Radio>
        </RadioGroup>
      </FieldLabel>
      <FieldLabel label="A date picker" marginTop="size-100">
        <DatePicker />
      </FieldLabel>
    </Provider>
  );
}
