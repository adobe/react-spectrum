import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {VerticalCenter} from '../.storybook/layout';
import OverlayTrigger from '../src/OverlayTrigger';

import Tooltip from '../src/Tooltip';
import Button from '../src/Button';

storiesOf('Tooltip', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render('This is a tooltip.'),
    {inline: true}
  )
  .addWithInfo(
    'placement: left',
    () => render('This is a tooltip.', {placement: 'left'}),
    {inline: true}
  )
  .addWithInfo(
    'placement: top',
    () => render('This is a tooltip.', {placement: 'top'}),
    {inline: true}
  )
  .addWithInfo(
    'placement: bottom',
    () => render('This is a tooltip.', {placement: 'bottom'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: error',
    () => render('This is a tooltip.', {variant: 'error'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: success',
    () => render('This is a tooltip.', {variant: 'success'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: info',
    () => render('This is a tooltip.', {variant: 'info'}),
    {inline: true}
  )
  .addWithInfo(
    'Long content',
    () => render(longMarkup),
    {inline: true}
  )
  .addWithInfo(
    'with OverlayTrigger: using click',
    () => render('This is a tooltip.', {trigger: 'click'}),
    {inline: true}
  );

function render(content, props = {}) {
  if (props.trigger) {
    return (
      <OverlayTrigger placement="right" {...props}>
        <Button label="Click me" variant="primary" />
        <Tooltip open>
            {content}
        </Tooltip>
      </OverlayTrigger>
    );
  }

  return (
    <div style={{display: 'inline-block'}}>
      <Tooltip
        {...props}
        open>
          {content}
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
