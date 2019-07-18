import {action} from '@storybook/addon-actions';
import React from 'react';
import Refresh from '@react/react-spectrum/Icon/Refresh';
import {SearchField} from '../';
import {storiesOf} from '@storybook/react';

storiesOf('SearchField', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'defaultValue (uncontrolled)',
    () => render({defaultValue: 'React'})
  )
  .add(
    'value (controlled)',
    () => render({value: 'React'})
  )
  .add(
    'disabled: true',
    () => render({value: 'React', isDisabled: true})
  )
  .add(
    'icon: refresh',
    () => render({value: 'React', icon: <Refresh />})
  )
  .add(
    'quiet',
    () => render({isQuiet: true})
  )
  .add(
    'quiet disabled',
    () => render({isQuiet: true, isDisabled: true})
  )
  .add(
    'quiet icon: refresh',
    () => render({isQuiet: true, icon: <Refresh />})
  )
  .add(
    'onClear',
    () => render({onClear: action('clear')})
  );

function render(props = {}) {
  return (
    <SearchField
      placeholder="Enter text"
      {...props}
      onChange={action('change')}
      onSubmit={action('submit')} />
  );
}
