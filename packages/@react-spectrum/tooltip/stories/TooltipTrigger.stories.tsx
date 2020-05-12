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

storiesOf('TooltipTrigger', module)
  .add(
    'default',
    () => render('This is a tooltip.', {})
  ).add(
    'placement: left',
    () => render('This is a tooltip.', {placement: 'start'})
  ).add(
    'placement: top',
    () => render('This is a tooltip.', {placement: 'top'})
  ).add(
    'placement: bottom',
    () => render('This is a tooltip.', {placement: 'bottom'})
  ).add(
    'isDisabled',
    () => render('This is a tooltip.', {placement: 'left', isDisabled: true})
  ).add(
     'multiple tooltips',
     () => renderMultipleTriggers('This is a tooltip.', {placement: 'left'})
   );

function render(content, props = {}) {
  return (
    <TooltipTrigger {...props}>
      <ActionButton>Trigger Tooltip</ActionButton>
      <Tooltip>
        {content}
      </Tooltip>
    </TooltipTrigger>
  );
}

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
