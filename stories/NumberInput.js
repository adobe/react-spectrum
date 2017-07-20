import {action, storiesOf} from '@kadira/storybook';
import NumberInput from '../src/NumberInput';
import React from 'react';

storiesOf('NumberInput', module)
  .addWithInfo(
    'default',
    `
    NumberInput only accepts numeric values.  Values can be changed by using the step buttons
    or mouse scroll wheel while focused on the input.  The up/down arrow, page up/down, and
    home/end keys will also change values.  If min or max are defined and the value extends
    outside of the range the component marks itself as invalid.
    `,
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'min: -5, max: 10, step: 0.5',
    'Demonstrating a -5 - 10 range input with 0.5 step',
    () => render({min: -5, max: 10, step: 0.5, placeholder: 'Type something please'}),
    {inline: true}
  )
  .addWithInfo(
    'invalid',
    'Demonstrating invalid',
    () => render({invalid: true}),
    {inline: true}
  )
  .addWithInfo(
    'disabled',
    'Demonstrating disabled',
    () => render({disabled: true}),
    {inline: true}
  );

const render = (props = {}) => (
  <NumberInput {...props} onChange={action('change')} />
);
