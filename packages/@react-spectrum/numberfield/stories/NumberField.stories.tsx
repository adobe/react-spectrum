import {action} from '@storybook/addon-actions';
import {NumberField, NumberFieldProps} from '../src';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('NumberField', module)
  .add(
    'default',
    () => render({})
  )
  .add(
    'minValue = 0, maxValue = 20',
    () => render({minValue: 0, maxValue: 20})
  );

function render(props:NumberFieldProps = {}) {
  return (
    <NumberField {...props} />
  );
}
