/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

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
    'triggered, placement: left',
    () => renderWithTrigger('This is a tooltip.', {placement: 'start'})
  ).add(
    'triggered, placement: right',
    () => renderWithTrigger('This is a tooltip.', {placement: 'end'})
  ).add(
    'triggered, placement: top',
    () => renderWithTrigger('This is a tooltip.', {placement: 'top'})
  ).add(
    'triggered, placement: bottom',
    () => renderWithTrigger('This is a tooltip.', {placement: 'bottom'})
  ).add(
    'triggered, isDisabled',
    () => renderWithTrigger('This is a tooltip.', {placement: 'left', isDisabled: true})
  ).add(
     'multiple tooltips',
     () => renderMultipleTriggers('This is a tooltip.', {placement: 'left'})
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
      <ActionButton>Trigger Tooltip</ActionButton>
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

// These are sample functions for proof of concept in this PR. Can be removed at in the next tooltip related pull request.

function renderMultipleTriggers(content, props = {}) {
  return (
    <div>
      <div>
        <TooltipTrigger {...props}>
          <ActionButton>
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
          <ActionButton>
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
          <ActionButton>
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
