import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import Alert from '../Alert';
import './Alert.styl';

storiesOf('Alert', module)
  .addDecorator(story => <VerticalCenter>{ story() }</VerticalCenter>)
  .add('Default', () => render())
  .add('header', () => render({ header: 'info' }))
  .add('variant: help', () => render({ header: 'help', variant: 'help' }))
  .add('variant: success', () => render({ header: 'success', variant: 'success' }))
  .add('variant: error', () => render({ header: 'error', variant: 'error' }))
  .add('variant: warning', () => render({ header: 'warning', variant: 'warning' }))
  .add('large: true', () => render({ header: 'Info', large: true }))
  .add('closable: true', () => render({ header: 'Info', closable: true }))
  .add('large: true, closable: true', () => render({ header: 'Info', large: true, closable: true }));

function render(props = {}, children = 'This is a React Coral alert') {
  return (
    <Alert
      onClose={ action('close') }
      { ...props }
    >
      { children }
    </Alert>
  );
}
