import {action} from '@storybook/addon-actions';
import React from 'react';
import Refresh from '../src/Icon/Refresh';
import Search from '../src/Search';
import {storiesOf} from '@storybook/react';

storiesOf('Search', module)
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
    () => render({value: 'React', disabled: true})
  )
  .add(
    'icon: refresh',
    () => render({value: 'React', icon: <Refresh />})
  )
  .add(
    'quiet',
    () => render({quiet: true})
  )
  .add(
    'quiet disabled',
    () => render({quiet: true, disabled: true})
  )
  .add(
    'quiet icon: refresh',
    () => render({quiet: true, icon: <Refresh />})
  );

function render(props = {}) {
  return (
    <Search
      placeholder="Enter text"
      {...props}
      onChange={action('change')}
      onSubmit={action('submit')} />
  );
}
