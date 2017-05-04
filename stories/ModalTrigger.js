import Button from '../src/Button';
import Dialog from '../src/Dialog';
import ModalTrigger from '../src/ModalTrigger';
import React from 'react';
import {storiesOf} from '@kadira/storybook';


storiesOf('ModalTrigger', module)
  .addWithInfo(
    'with OverlayTrigger: hover',
    () => render('This is a tooltip.', {trigger: 'click'}),
    {inline: true}
  )
  .addWithInfo(
    'with OverlayTrigger: hover',
    () => render('This is a tooltip.', {trigger: 'click'}),
    {inline: true}
  );

const render = (props = {}) => (
  <div style={{paddingLeft: '200px'}}> 
    <ModalTrigger>
      <Button label="Click Me" variant="primary" />
      <Dialog title="the title" confirmLabel="do it" size="S" cancelLabel="close" variant="help" onConfirm={() => false}>
        <span>the modal dialogsdiuhfsdjhgediu fvuygf diuv fuhv sdiugv j content</span>
      </Dialog>
    </ModalTrigger>
  </div>
);
