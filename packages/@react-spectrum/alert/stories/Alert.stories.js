import _123 from '@spectrum-icons/workflow/123';
import {Alert} from '../';
import CalendarCheckColor from '@spectrum-icons/color/CalendarCheckColor';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Alert', module)
  .add(
    'header',
    () => render({title: 'info', variant: 'info'})
  )
  .add(
    'variant: info',
    () => render({title: 'info', variant: 'info'})
  )
  .add(
    'variant: help',
    () => render({title: 'help', variant: 'help'})
  )
  .add(
    'variant: success',
    () => render({title: 'success', variant: 'success'})
  )
  .add(
    'variant: error',
    () => render({title: 'error', variant: 'error'})
  )
  .add(
    'variant: warning',
    () => render({title: 'warning', variant: 'warning'})
  )
  .add(
    'aria-live: polite',
    () => render({title: 'error', variant: 'error', 'aria-live': 'polite'})
  )
  .add(
    'aria-live: off',
    () => render({title: 'error', variant: 'error', 'aria-live': 'off'})
  );

function render(props = {}, children = 'This is a React Spectrum alert') {
  return (
    <Alert
      {...props}>
      {children}
      <_123 />
      <CalendarCheckColor />
    </Alert>
  );
}
