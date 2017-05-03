import Button from '../src/Button';
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
    <ModalTrigger placement="bottom">
      <Button label="Click Me" variant="primary" />
      <div className='coral-Dialog' modalContent>This is my modal</div>
    </ModalTrigger>
  </div>
);
