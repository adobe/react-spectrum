import Button from '../src/Button';
import OverlayTrigger from '../src/OverlayTrigger';
// import Popover from '../src/Popover';
import React from 'react';
import {storiesOf} from '@kadira/storybook';
import Tooltip from '../src/Tooltip';


storiesOf('OverlayTrigger', module)
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
    <OverlayTrigger trigger="click" placement="bottom">
      <Button label="Click Me" variant="primary" />
      <Tooltip open>Notes from a tooltip</Tooltip>
    </OverlayTrigger>
  </div>
);
