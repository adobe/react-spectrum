import {action, storiesOf} from '@storybook/react';
import Button from '../src/Button';
import Dialog from '../src/Dialog';
import ModalTrigger from '../src/ModalTrigger';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('ModalTrigger', module)
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
    'with onConfirm',
    () => render({onConfirm: action('confirm')}),
    {inline: true}
  )
  .addWithInfo(
    'with onConfirm () => false',
    () => render({onConfirm: () => false}),
    {inline: true}
  );

const render = (props = {}) => (
  <ModalTrigger>
    <Button label="Click Me" variant="primary" modalTrigger />
    <Dialog
      modalContent
      title="The title"
      confirmLabel="Do it"
      size="S"
      cancelLabel="close"
      variant="help"
      {...props}>
      <span>the modal dialog content goes here</span>
    </Dialog>
  </ModalTrigger>
);
