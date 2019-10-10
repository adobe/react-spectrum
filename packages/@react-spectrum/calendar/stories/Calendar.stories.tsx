import {action} from '@storybook/addon-actions';
import {addWeeks} from 'date-fns';
import {Calendar} from '../src';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Calendar', module)
  .addParameters({chromaticProvider: {locales: true}, chromatic: {viewports: [350]}})
  .add(
    'Default',
    () => render(),
    {chromatic: {disable: true}} // disable visual tests since this depends on the current month
  )
  .add(
    'defaultValue',
    () => render({defaultValue: new Date(2019, 5, 5)})
  )
  .add(
    'controlled value',
    () => render({value: new Date(2019, 5, 5)})
  )
  .add(
    'minValue: today, maxValue: 1 week from now',
    () => render({minValue: new Date(), maxValue: addWeeks(new Date(), 1)}),
    {chromatic: {disable: true}} // disable visual tests since this depends on the current month
  )
  .add(
    'defaultValue + minValue + maxValue',
    () => render({defaultValue: new Date(2019, 5, 10), minValue: new Date(2019, 5, 5), maxValue: new Date(2019, 5, 20)})
  )
  .add(
    'isDisabled',
    () => render({defaultValue: new Date(2019, 5, 5), isDisabled: true})
  )
  .add(
    'isReadOnly',
    () => render({defaultValue: new Date(2019, 5, 5), isReadOnly: true})
  )
  .add(
    'autoFocus',
    () => render({defaultValue: new Date(2019, 5, 5), autoFocus: true})
  );

function render(props = {}) {
  return <Calendar onChange={action('change')} {...props} />;
}
