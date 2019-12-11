import {action} from '@storybook/addon-actions';
import {ActionButton} from '@react-spectrum/button';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Tooltip, TooltipTrigger} from '../src';

// README: Most of these stories are temporary and just proof of concept to make it easier on reviewers

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
    'RTL example: start',
    () => renderWithTrigger('This is a tooltip.', {placement: 'start', type: 'click'})
  ).add(
    'RTL exmaple: end',
    () => renderWithTrigger('This is a tooltip.', {placement: 'end', type: 'click'})
  ).add(
    'triggered by hover and focus, placement: right',
    () => renderWithTrigger('This is a tooltip.', {placement: 'right', type: ['hover', 'focus']})
  ).add(
    'triggered by hover and focus, placement: left',
    () => renderWithTrigger('This is a tooltip.', {placement: 'left', type: ['hover', 'focus']})
  ).add(
    'supports disable prop : hover and focus',
    () => renderWithTrigger('This is a tooltip.', {placement: 'left', type: ['hover', 'focus'], isDisabled: true})
  ).add(
    'supports disable prop : click',
    () => renderWithTrigger('This is a tooltip.', {placement: 'left', type: 'click', isDisabled: true})
  ).add(
    'supports immediate appearance',
    () => renderWithTrigger('This is a tooltip.', {placement: 'left', type: ['hover', 'focus'], immediateAppearance: true}) // increased appearance delay by a ton to make it obvious this works
  ).add(
    'single tooltip proof of concept : hover and focus',
    () => renderWithThreeTriggers('This is a tooltip.', {placement: 'right', type: ['hover', 'focus']})
  ).add(
    'single tooltip proof of concept : click',
    () => renderWithThreeTriggers('This is a tooltip.', {placement: 'left', type: 'click'})
  ).add(
    'single tooltip proof of concept : hover/focus & click',
    () => renderWithDifferentTriggerTypes('This is a tooltip.')
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

function renderWithThreeTriggers(content, props = {}) {
  return (
    <div>
      <div>
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
      </div>
      <div style={{height: 10}}> </div>
      <div>
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
      </div>
      <div style={{height: 10}}> </div>
      <div>
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
      </div>
    </div>
  );
}

function renderWithDifferentTriggerTypes(content) {

  const hoverProps = {placement: 'right', type: ['hover', 'focus']}
  const clickProps = {placement: 'right', type: 'click'}

  return (
    <div>
      <div>
        <TooltipTrigger {...hoverProps}>
          <ActionButton
            onPress={action('press')}
            onPressStart={action('pressstart')}
            onPressEnd={action('pressend')}
            onHover={action('hover')}
            onHoverStart={action('hoverstart')}
            onHoverEnd={action('hoverend')}>
              Hover Trigger
          </ActionButton>
          <Tooltip>
            {content}
          </Tooltip>
        </TooltipTrigger>
      </div>
      <div style={{height: 10}}> </div>
      <div>
        <TooltipTrigger {...clickProps}>
          <ActionButton
            onPress={action('press')}
            onPressStart={action('pressstart')}
            onPressEnd={action('pressend')}
            onHover={action('hover')}
            onHoverStart={action('hoverstart')}
            onHoverEnd={action('hoverend')}>
              Click Trigger
          </ActionButton>
          <Tooltip>
            {content}
          </Tooltip>
        </TooltipTrigger>
      </div>
      <div style={{height: 10}}> </div>
      <div>
        <TooltipTrigger {...hoverProps}>
          <ActionButton
            onPress={action('press')}
            onPressStart={action('pressstart')}
            onPressEnd={action('pressend')}
            onHover={action('hover')}
            onHoverStart={action('hoverstart')}
            onHoverEnd={action('hoverend')}>
              Hover Trigger
          </ActionButton>
          <Tooltip>
            {content}
          </Tooltip>
        </TooltipTrigger>
      </div>
      <div style={{height: 10}}> </div>
      <div>
        <TooltipTrigger {...clickProps}>
          <ActionButton
            onPress={action('press')}
            onPressStart={action('pressstart')}
            onPressEnd={action('pressend')}
            onHover={action('hover')}
            onHoverStart={action('hoverstart')}
            onHoverEnd={action('hoverend')}>
              Click Trigger
          </ActionButton>
          <Tooltip>
            {content}
          </Tooltip>
        </TooltipTrigger>
      </div>
      <div style={{height: 10}}> </div>
      <div>
        <TooltipTrigger {...clickProps}>
          <ActionButton
            onPress={action('press')}
            onPressStart={action('pressstart')}
            onPressEnd={action('pressend')}
            onHover={action('hover')}
            onHoverStart={action('hoverstart')}
            onHoverEnd={action('hoverend')}>
              Click Trigger
          </ActionButton>
          <Tooltip>
            {content}
          </Tooltip>
        </TooltipTrigger>
      </div>
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
