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
import Copy from '@spectrum-icons/workflow/Copy';
import Delete from '@spectrum-icons/workflow/Delete';
import Paste from '@spectrum-icons/workflow/Paste';
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
     () => renderMultipleTriggers('This is a tooltip.', {placement: 'top'})
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
      <TooltipTrigger {...props}>
        <ActionButton aria-label="Copy">
          <Copy />
        </ActionButton>
        <Tooltip>
          Copy
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...props}>
        <ActionButton aria-label="Paste">
          <Paste />
        </ActionButton>
        <Tooltip>
          Paste
        </Tooltip>
      </TooltipTrigger>
      <div style={{'marginInlineStart': '50px', 'display': 'inline'}}>
        <TooltipTrigger {...props}>
          <ActionButton aria-label="Delete">
            <Delete />
          </ActionButton>
          <Tooltip>
            Delete
          </Tooltip>
        </TooltipTrigger>
      </div>
    </div>
  );
}
