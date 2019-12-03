import {action} from '@storybook/addon-actions';
import Info from '@spectrum-icons/workflow/Info';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {TextArea} from '../';

storiesOf('TextArea', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'value: Test (controlled)',
    () => render({value: 'Test'})
  )
  .add(
    'defaultValue: Test (uncontrolled)',
    () => render({defaultValue: 'Test'})
  )
  .add(
    'isQuiet: true',
    () => render({isQuiet: true})
  )
  .add(
    'isDisabled: true',
    () => render({isDisabled: true})
  )
  .add(
    'isDisabled, isQuiet',
    () => render({isDisabled: true, isQuiet: true})
  )
  .add(
    'validationState: invalid',
    () => render({validationState: 'invalid'})
  )
  .add(
    'validationState: valid',
    () => render({validationState: 'valid'})
  )
  .add(
    'isReadOnly: true',
    () => render({isReadOnly: true})
  )
  .add(
    'isRequired: true',
    () => render({isRequired: true})
  )
  .add(
    'autoFocus: true',
    () => render({autoFocus: true})
  )
  .add(
    'icon: Info',
    () => render({icon: <Info />})
  )
  .add(
    'icon: Info, isQuiet',
    () => render({icon: <Info />, isQuiet: true})
  )
  .add(
    'icon: Info, isDisabled',
    () => render({icon: <Info />, isDisabled: true})
  )
  .add(
    'icon: Info, isQuiet, isDisabled',
    () => render({icon: <Info />, isQuiet: true, isDisabled: true})
  )
  .add(
    'icon: Info, validationState: invalid, isQuiet',
    () => render({icon: <Info />, validationState: 'invalid', isQuiet: true})
  );

function render(props = {}) {
  return (
    <TextArea
      placeholder="React"
      onChange={action('change')}
      onFocus={action('focus')}
      onBlur={action('blur')}
      UNSAFE_className="blah"
      {...props} />
  );
}
