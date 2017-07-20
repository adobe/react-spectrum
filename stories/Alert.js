import {action, storiesOf} from '@kadira/storybook';
import Alert from '../src/Alert';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';
import './Alert.styl';

storiesOf('Alert', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
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
    'large: true',
    () => render({header: 'Info', large: true}),
    {inline: true}
  )
  .addWithInfo(
    'closable: true',
    () => render({header: 'Info', closable: true}),
    {inline: true}
  )
  .addWithInfo(
    'large: true, closable: true',
    () => render({header: 'Info', large: true, closable: true}),
    {inline: true}
  );

function render(props = {}, children = 'This is a React Coral alert') {
  return (
    <Alert
      onClose={action('close')}
      {...props}
    >
      {children}
    </Alert>
  );
}
