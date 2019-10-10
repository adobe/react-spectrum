import {action} from '@storybook/addon-actions';
import {DatePicker} from '../src';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('DatePicker', module)
  .addParameters({chromaticProvider: {locales: true}, chromatic: {viewports: [350]}})
  .add(
    'default',
    () => render()
  )
  .add(
    'isQuiet',
    () => render({isQuiet: true})
  )
  .add(
    'defaultValue',
    () => render({defaultValue: new Date(2020, 2, 3)})
  )
  .add(
    'controlled value',
    () => render({value: new Date(2020, 2, 3)})
  )
  .add(
    'custom date format',
    () => render({
      formatOptions: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }
    })
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true, value: new Date(2020, 2, 3)})
  )
  .add(
    'isQuiet, isDisabled',
    () => render({isQuiet: true, isDisabled: true, value: new Date(2020, 2, 3)})
  )
  .add(
    'isReadOnly',
    () => render({isReadOnly: true, value: new Date(2020, 2, 3)})
  )
  .add(
    'isRequired',
    () => render({isRequired: true})
  )
  .add(
    'autoFocus',
    () => render({autoFocus: true})
  )
  .add(
    'validationState: invalid',
    () => render({validationState: 'invalid', value: new Date(2020, 2, 3)})
  )
  .add(
    'validationState: valid',
    () => render({validationState: 'valid', value: new Date(2020, 2, 3)})
  )
  .add(
    'minDate: 2010/1/1, maxDate: 2020/1/1',
    () => render({minValue: new Date(2010, 0, 1), maxValue: new Date(2020, 0, 1)})
  )
  .add(
    'placeholderDate: 1980/1/1',
    () => render({placeholderDate: new Date(1980, 0, 1)})
  );

function render(props = {}) {
  return (
    <DatePicker 
      onChange={action('change')}
      {...props} />
  );
}
