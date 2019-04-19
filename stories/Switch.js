import {action} from '@storybook/addon-actions';
import React from 'react';
import {storiesOf} from '@storybook/react';
import Switch from '../src/Switch';

storiesOf('Switch', module)
  .add(
    'Default',
    () => (render({'aria-label': 'React'}))
  )
  .add(
    'defaultChecked: true',
    () => (render({defaultChecked: true, 'aria-label': 'React'}))
  )
  .add(
    'checked: true',
    () => (render({checked: true, 'aria-label': 'React'}))
  )
  .add(
    'checked: false',
    () => (render({checked: false, 'aria-label': 'React'}))
  )
  .add(
    'disabled: true',
    () => (render({disabled: true, 'aria-label': 'React'}))
  )
  .add(
    'with label',
    () => (render({label: 'Test'}))
  )
  .add(
    'with renderLabel: false',
    () => (render({label: 'React switch', renderLabel: false}))
  )
  .add(
    'variant: ab',
    () => (render({variant: 'ab', 'aria-label': 'React'}))
  )
  .add(
    'quiet: true',
    () => render({quiet: true, 'aria-label': 'React'})
  )
  .add(
    'quiet: true, disabled: true',
    () => render({quiet: true, disabled: true, 'aria-label': 'React'})
  );

function render(props = {}) {
  return (
    <Switch
      onChange={action('change')}
      {...props}>
      {
        props.renderLabel === false && 'with renderLabel: false'
      }
    </Switch>
  );
}
