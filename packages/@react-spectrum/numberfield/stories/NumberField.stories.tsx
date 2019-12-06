import {action} from '@storybook/addon-actions';
import {NumberField} from '../src';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('NumberField', module)
  .add(
    'default',
    () => render({onChange: action('onChange')})
  )
  .add(
    'isQuiet',
    () => render({isQuiet: true})
  )
  .add(
    'minValue = 0, maxValue = 20',
    () => render({minValue: 0, maxValue: 20})
  );

function render(props: any = {}) {
  return (
    <NumberField {...props} UNSAFE_className="custom_classname" />
  );
}
