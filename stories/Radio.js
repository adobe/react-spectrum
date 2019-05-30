import {action} from '@storybook/addon-actions';
import Radio from '../src/Radio';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Radio', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'defaultChecked: true',
    () => render({defaultChecked: true})
  )
  .add(
    'checked: true',
    () => render({checked: true})
  )
  .add(
    'checked: false',
    () => render({checked: false})
  )
  .add(
    'disabled: true',
    () => render({disabled: true})
  )
  .add(
    'invalid: true',
    () => render({invalid: true})
  )
  .add(
    'quiet: true',
    () => render({quiet: true, checked: true})
  )
  .add(
    'quiet: true, disabled: true',
    () => render({quiet: true, checked: true, disabled: true})
  )
  .add(
    'quiet: true, invalid: true',
    () => render({quiet: true, checked: true, invalid: true})
  )
  .add(
     'Label Not Set',
     () => render({label: null, 'aria-label': 'React'})
  )
  .add(
    'renderLabel: false',
    () => render({renderLabel: false, label: 'React radio'})
  )
  .add(
    'Label Below',
    () => render({labelBelow: true})
  );

function render(props = {}) {
  return (
    <Radio
      label="React"
      onChange={action('change')}
      {...props}>
      {
        props.renderLabel === false && 'with renderLabel: false'
      }
    </Radio>
  );
}
