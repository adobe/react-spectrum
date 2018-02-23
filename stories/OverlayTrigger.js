import Button from '../src/Button';
import OverlayTrigger from '../src/OverlayTrigger';
import Popover from '../src/Popover';
import React from 'react';
import {storiesOf} from '@storybook/react';
import Tooltip from '../src/Tooltip';
import {VerticalCenter} from '../.storybook/layout';


storiesOf('OverlayTrigger', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'with trigger: hover',
    () => render('popover', {trigger: 'hover', placement: 'right'}),
    {inline: true}
  )
  .addWithInfo(
    'with trigger: click',
    () => render('popover', {trigger: 'click', placement: 'right'}),
    {inline: true}
  )
  .addWithInfo(
    'with tooltip',
    () => render('tooltip', {trigger: 'click', placement: 'right'}),
    {inline: true}
  )
  .addWithInfo(
    'placement: top',
    () => render('popover', {trigger: 'click', placement: 'top', variant: 'error'}),
    {inline: true}
  )
  .addWithInfo(
    'placement: bottom',
    () => render('popover', {trigger: 'click', placement: 'bottom', variant: 'error'}),
    {inline: true}
  )
  .addWithInfo(
    'placement: left (flip: false)',
    () => render('popover', {trigger: 'click', placement: 'left', variant: 'error', flip: false}),
    {inline: true}
  )
  .addWithInfo(
    'placement: left (flip: true)',
    () => render('popover', {trigger: 'click', placement: 'left', variant: 'error'}),
    {inline: true}
  )
  .addWithInfo(
    'placement: right',
    () => render('popover', {trigger: 'click', placement: 'right', variant: 'error'}),
    {inline: true}
  )
  .addWithInfo(
    'with: offset',
    () => render('popover', {trigger: 'click', placement: 'right', variant: 'error', offset: 100}),
    {inline: true}
  )
  .addWithInfo(
    'with: crossOffset',
    () => render('popover', {trigger: 'click', placement: 'right', variant: 'error', crossOffset: 100}),
    {inline: true}
  );

function render(type, props = {}) {
  if (type === 'popover') {
    return (
      <OverlayTrigger {...props}>
        <Button label="Click Me" variant="primary" />
        <Popover
          open
          title="Popover title">
            Popover content goes here...<br />
            Popover content goes here...<br />
            Popover content goes here...<br />
            Popover content goes here...<br />
            Popover content goes here...<br />
            Popover content goes here...<br />
            Popover content goes here...<br />
            Popover content goes here...<br />
            Popover content goes here...<br />
            Popover content goes here...<br />
            Popover content goes here...<br />
            Popover content goes here...<br />
            Popover content goes here...<br />
            Popover content goes here...<br />
            Popover content goes here...<br />
            Popover content goes here...<br />
            Popover content goes here...<br />
        </Popover>
      </OverlayTrigger>
    );
  }
  return (
    <OverlayTrigger {...props}>
      <Button label="Click Me" variant="primary" />
      <Tooltip open>Notes from a tooltip</Tooltip>
    </OverlayTrigger>
  );
}
