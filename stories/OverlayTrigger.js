/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import Autocomplete from '../src/Autocomplete';
import Button from '../src/Button';
import Calendar from '../src/Calendar';
import OverlayTrigger from '../src/OverlayTrigger';
import Popover from '../src/Popover';
import React from 'react';
import {storiesOf} from '@storybook/react';
import Textfield from '../src/Textfield';
import Tooltip from '../src/Tooltip';


storiesOf('OverlayTrigger', module)
  .add(
    'with trigger: hover',
    () => render('popover', {trigger: 'hover', placement: 'right'})
  )
  .add(
    'with trigger: click',
    () => render('popover', {trigger: 'click', placement: 'right'})
  )
  .add(
    'with trigger: [\'hover\', \'focus\']',
    () => render('popover')
  )
  .add(
    'with tooltip',
    () => render('tooltip', {placement: 'right'})
  )
  .add(
    'with tooltip:bottom',
    () => render('tooltip', {placement: 'bottom'})
  )
  .add(
    'placement: top',
    () => render('popover', {trigger: 'click', placement: 'top', variant: 'error'})
  )
  .add(
    'placement: bottom',
    () => render('popover', {trigger: 'click', placement: 'bottom', variant: 'error'})
  )
  .add(
    'placement: left (flip: false)',
    () => render('popover', {trigger: 'click', placement: 'left', variant: 'error', flip: false})
  )
  .add(
    'placement: left (flip: true)',
    () => render('popover', {trigger: 'click', placement: 'left', variant: 'error'})
  )
  .add(
    'placement: right',
    () => render('popover', {trigger: 'click', placement: 'right', variant: 'error'})
  )
  .add(
    'with: offset',
    () => render('popover', {trigger: 'click', placement: 'right', variant: 'error', offset: 100})
  )
  .add(
    'with: crossOffset',
    () => render('popover', {trigger: 'click', placement: 'right', variant: 'error', crossOffset: 100})
  )
  .add(
    'disabled',
    () => render('popover', {disabled: true, trigger: 'hover', placement: 'right'})
  )
  .add(
    'with: nested overlay (autocomplete)',
    () => render('nestedPopover', {trigger: 'click', placement: 'right', variant: 'error'})
  )
  .add(
    'with: margin on target',
    () => render('popover', {trigger: 'click', placement: 'bottom'}, {style: {margin: 40}})
  )
  .add(
    'controlled open',
    () => render('popover', {show: true, placement: 'bottom'}, {style: {margin: 40}})
  )
  .add(
    'with: "block" element and placement "bottom left"',
    () => render('popover', {trigger: 'click', placement: 'bottom left'}, {style: {width: '100%', minWidth: '100%'}})
  );

function render(type, props = {}, targetProps = {}) {
  if (type === 'popover' || type === 'nestedPopover') {
    return (
      <OverlayTrigger {...props}>
        <Button label="Click Me" variant="primary" {...targetProps} />
        <Popover
          open
          title="Popover title"
          role="dialog"
          trapFocus={props.trigger !== 'hover'}>
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
              <Button label="Click Me" variant="primary" autoFocus />
              <Popover role="dialog">
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
