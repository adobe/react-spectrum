import {Alert} from '../src/Alert';
import React from 'react';
import {storiesOf} from '@storybook/react';


storiesOf('Alert', module)
  .addWithInfo(
    'Default',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'header',
    () => render({header: 'info'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: info',
    () => render({header: 'info', variant: 'info'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: help',
    () => render({header: 'help', variant: 'help'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: success',
    () => render({header: 'success', variant: 'success'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: error',
    () => render({header: 'error', variant: 'error'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: warning',
    () => render({header: 'warning', variant: 'warning'}),
    {inline: true}
  )
  .addWithInfo(
    'aria-live: polite',
    () => render({header: 'error', variant: 'error', 'aria-live': 'polite'}),
    {inline: true}
  )
  .addWithInfo(
    'aria-live: off',
    () => render({header: 'error', variant: 'error', 'aria-live': 'off'}),
    {inline: true}
  );

function render(props = {}, children = 'This is a React Spectrum alert') {
  return (
    <Alert
      {...props}>
      {children}
    </Alert>
  );
}
