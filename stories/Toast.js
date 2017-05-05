import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {VerticalCenter} from '../.storybook/layout';

import {Toast, success} from '../src/Toast';
import Button from '../src/Button';

storiesOf('Toast', module)
  .addDecorator(story => (
    <VerticalCenter style={ {textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'} }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => <Toast>Toast is done.</Toast>,
    {inline: true}
  )
  .addWithInfo(
    'closable',
    () => <Toast closable onClose={action('onClose')}>Toast is done.</Toast>,
    {inline: true}
  )
  .addWithInfo(
    'variant = error',
    () => <Toast closable variant="error">Toast is burnt.</Toast>,
    {inline: true}
  )
  .addWithInfo(
    'variant = warning',
    () => <Toast closable variant="warning">Toast is burning.</Toast>,
    {inline: true}
  )
  .addWithInfo(
    'variant = info',
    () => <Toast closable variant="info">Toast is high carb.</Toast>,
    {inline: true}
  )
  .addWithInfo(
    'variant = help',
    () => <Toast closable variant="help">Toast is high carb.</Toast>,
    {inline: true}
  )
  .addWithInfo(
    'variant = success',
    () => <Toast closable variant="success">Toast is golden brown.</Toast>,
    {inline: true}
  )
  .addWithInfo(
    'trigger',
    () => <Button onClick={() => success('Great success!')} variant="primary">Show Toast</Button>,
    {inline: true}
  );
