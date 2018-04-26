import Autocomplete from '../src/Autocomplete';
import Button from '../src/Button';
import Calendar from '../src/Calendar';
import OverlayTrigger from '../src/OverlayTrigger';
import Popover from '../src/Popover';
import React from 'react';
import {storiesOf} from '@storybook/react';
import Textfield from '../src/Textfield';
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
  )
  .addWithInfo(
    'disabled',
    () => render('popover', {disabled: true, trigger: 'hover', placement: 'right'}),
    {inline: true}
  )
  .addWithInfo(
    'with: nested overlay (autocomplete)',
    () => render('nestedPopover', {trigger: 'click', placement: 'right', variant: 'error'}),
    {inline: true}
  );

function render(type, props = {}) {
  if (type === 'popover' || type === 'nestedPopover') {
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
          {type === 'nestedPopover' &&
            <OverlayTrigger {...props}>
              <Button label="Click Me" variant="primary" />
              <Popover>
                <Autocomplete getCompletions={() => ['a', 'b', 'c']}>
                  <Textfield placeholder="Autocomplete..." />
                </Autocomplete>
                <Autocomplete getCompletions={() => ['a', 'b', 'c']}>
                  <Textfield placeholder="Autocomplete..." />
                </Autocomplete>
                <br />
                <Calendar />
              </Popover>
            </OverlayTrigger>
            }
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
