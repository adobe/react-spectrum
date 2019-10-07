import _123 from '@spectrum-icons/workflow/123';
import {Alert} from '../';
import CalendarCheckColor from '@spectrum-icons/color/CalendarCheckColor';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Alert', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'header',
    () => render({header: 'info'})
  )
  .add(
    'variant: info',
    () => render({header: 'info', variant: 'info'})
  )
  .add(
    'variant: help',
    () => render({header: 'help', variant: 'help'})
  )
  .add(
    'variant: success',
    () => render({header: 'success', variant: 'success'})
  )
  .add(
    'variant: error',
    () => render({header: 'error', variant: 'error'})
  )
  .add(
    'variant: warning',
    () => render({header: 'warning', variant: 'warning'})
  )
  .add(
    'aria-live: polite',
    () => render({header: 'error', variant: 'error', 'aria-live': 'polite'})
  )
  .add(
    'aria-live: off',
    () => render({header: 'error', variant: 'error', 'aria-live': 'off'})
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
