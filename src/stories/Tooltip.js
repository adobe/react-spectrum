import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import Tooltip from '../Tooltip';
import Button from '../Button';

storiesOf('Tooltip', module)
  .addDecorator(story => (
    <VerticalCenter style={ { textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none' } }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render('This is a tooltip.'),
    { inline: true }
  )
  .addWithInfo(
    'Long content',
    () => render(longMarkup),
    { inline: true }
  )
  .addWithInfo(
    'placement: left',
    () => render('This is a tooltip.', { placement: 'left' }),
    { inline: true }
  )
  .addWithInfo(
    'placement: top',
    () => render('This is a tooltip.', { placement: 'top' }),
    { inline: true }
  )
  .addWithInfo(
    'placement: bottom',
    () => render('This is a tooltip.', { placement: 'bottom' }),
    { inline: true }
  )
  .addWithInfo(
    'variant: error',
    () => render('This is a tooltip.', { variant: 'error' }),
    { inline: true }
  )
  .addWithInfo(
    'variant: success',
    () => render('This is a tooltip.', { variant: 'success' }),
    { inline: true }
  )
  .addWithInfo(
    'variant: info',
    () => render('This is a tooltip.', { variant: 'info' }),
    { inline: true }
  )
  .addWithInfo(
    'openOn: hover',
    () => render('This is a tooltip.', { openOn: 'hover' }),
    { inline: true }
  )
  .addWithInfo(
    'openOn: click',
    () => render('This is a tooltip.', { openOn: 'click' }),
    { inline: true }
  );

function render(children, props = {}) {
  let buttonLbl = 'Target';
  if (props.openOn === 'hover') {
    buttonLbl = 'Hover Over Me';
  }
  if (props.openOn === 'click') {
    buttonLbl = 'Click Me';
  }
  return (
    <div style={ { display: 'inline-block' } }>
      <Tooltip
        title="Title"
        openOn="always"
        open
        closable
        content={ children }
        onClose={ action('close') }
        { ...props }
      >
        <Button label={ buttonLbl } />
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
