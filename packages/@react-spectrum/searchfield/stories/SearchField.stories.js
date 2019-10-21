import {action} from '@storybook/addon-actions';
import React from 'react';
import Refresh from '@spectrum-icons/workflow/Refresh';
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
    'isQuiet: true',
    () => render({isQuiet: true})
  )
  .add(
    'isDisabled: true',
    () => render({defaultValue: 'React', isDisabled: true})
  )
  .add(
    'isQuiet, isDisabled',
    () => render({defaultValue: 'React', isQuiet: true, isDisabled: true})
  )
  .add(
    'icon: refresh',
    () => render({defaultValue: 'React', icon: <Refresh />})
  )
  .add(
    'isQuiet, icon: refresh',
    () => render({defaultValue: 'React', icon: <Refresh />, isQuiet: true})
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
