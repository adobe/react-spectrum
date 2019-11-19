import {action} from '@storybook/addon-actions';
import {ActionButton} from '@react-spectrum/button';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Tooltip, TooltipTrigger} from '../src';

storiesOf('Tooltip', module)
  .add(
    'default',
    () => render('This is a tooltip.')
  )
  .add(
    'placement: left',
    () => render('This is a tooltip.', {placement: 'left'})
  )
  .add(
    'placement: top',
    () => render('This is a tooltip.', {placement: 'top'})
  )
  .add(
    'placement: bottom',
    () => render('This is a tooltip.', {placement: 'bottom'})
  )
  .add(
    'variant: neutral',
    () => render('This is a tooltip.', {variant: 'neutral'})
  )
  .add(
    'variant: positive',
    () => render('This is a tooltip.', {variant: 'positive'})
  )
  .add(
    'variant: negative',
    () => render('This is a tooltip.', {variant: 'negative'})
  )
  .add(
    'variant: info',
    () => render('This is a tooltip.', {variant: 'info'})
  )
  .add(
    'long content',
    () => render(longMarkup)
  )
  .add(
    'triggered by click, placement: top',
    () => renderWithTrigger('This is a tooltip.', {placement: 'top', type: 'click'})
  ).add(
    'triggered by click, placement: bottom',
    () => renderWithTrigger('This is a tooltip.', {placement: 'bottom', type: 'click'})
  ).add(
    'triggered by hover, placement: right',
    () => renderWithTrigger('This is a tooltip.', {placement: 'right', type: 'hover'})
  ).add(
    'triggered by hover, placement: left',
    () => renderWithTrigger('This is a tooltip.', {placement: 'left', type: 'hover'})
  );

function render(content, props = {}) {
  return (
    <div style={{display: 'inline-block'}}>
      <Tooltip
        {...props}
        isOpen>
        {content}
      </Tooltip>
    </div>
  );
}

function renderWithTrigger(content, props = {}) {
  return (
    <TooltipTrigger {...props}>
      <ActionButton
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        onHover={action('hover')}
        onHoverStart={action('hoverstart')}
        onHoverEnd={action('hoverend')}>
          Tooltip Trigger
      </ActionButton>
      <Tooltip>
        {content}
      </Tooltip>
    </TooltipTrigger>
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
