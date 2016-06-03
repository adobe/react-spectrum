import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import Tooltip from '../Tooltip';
import Button from '../Button';

storiesOf('Tooltip', module)
  .add('Default', () => render('This is a tooltip.'))
  .add('Long content', () => render(longMarkup))
  .add('placement: left', () => render('This is a tooltip.', { placement: 'left' }))
  .add('placement: top', () => render('This is a tooltip.', { placement: 'top' }))
  .add('placement: bottom', () => render('This is a tooltip.', { placement: 'bottom' }))
  .add('variant: error', () => render('This is a tooltip.', { variant: 'error' }))
  .add('variant: success', () => render('This is a tooltip.', { variant: 'success' }))
  .add('variant: info', () => render('This is a tooltip.', { variant: 'info' }))
  .add('openOn: hover', () => render('This is a tooltip.', { openOn: 'hover' }))
  .add('openOn: click', () => render('This is a tooltip.', { openOn: 'click' }));

function render(children, props = {}) {
  let buttonLbl = 'Target';
  if (props.openOn === 'hover') {
    buttonLbl = 'Hover Over Me';
  }
  if (props.openOn === 'click') {
    buttonLbl = 'Click Me';
  }
  return (
    <div style={{ display: 'inline-block' }}>
      <Tooltip
        title="Title"
        openOn="always"
        open
        closable
        content={children}
        onClose={action('close')}
        { ...props }
      >
        <Button label={buttonLbl} />
      </Tooltip>
    </div>
  );
}

const longMarkup = (
  <div>
  Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor
  quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean
  ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.
  Vestibulum erat wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt
  condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui.
  </div>
);
