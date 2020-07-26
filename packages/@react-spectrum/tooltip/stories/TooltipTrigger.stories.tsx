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
import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Tooltip, TooltipTrigger} from '../src';

storiesOf('TooltipTrigger', module)
  .add(
    'default',
    () => render({})
  )
  .add(
    'placement: left',
    () => render({placement: 'start'})
  )
  .add(
    'placement: top',
    () => render({placement: 'top'})
  )
  .add(
    'placement: bottom',
    () => render({placement: 'bottom'})
  )
  .add(
    'isDisabled',
    () => render({placement: 'left', isDisabled: true})
  )
  .add(
    'delay',
    () => render({delay: true})
  )
  .add(
    'multiple tooltips',
    () => renderMultipleTriggers({placement: 'left'})
  )
  .add(
    'delay multiple tooltips',
    () => renderMultipleTriggers({delay: true})
  )
  .add(
    'isOpen',
    () => renderMultipleTriggers({isOpen: true})
  )
  .add(
    'trigger disabled',
    () => renderDisabledTrigger()
  );

function render(props = {}) {
  return (
    <TooltipTrigger {...props}>
      <ActionButton>Trigger Tooltip</ActionButton>
      <Tooltip>
        Tooltip message.
      </Tooltip>
    </TooltipTrigger>
  );
}

function renderDisabledTrigger() {
  return (
    <TooltipTrigger>
      <ActionButton isDisabled>Trigger Tooltip</ActionButton>
      <Tooltip>
        Tooltip message.
      </Tooltip>
    </TooltipTrigger>
  );
}

function renderMultipleTriggers(props = {}) {
  return (
    <Flex gap="size-100" direction="column">
      <TooltipTrigger {...props}>
        <ActionButton>
          Neutral Tooltip
        </ActionButton>
        <Tooltip displayIcon>
          Neutral message.
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...props}>
        <ActionButton>
          Positive Tooltip
        </ActionButton>
        <Tooltip variant="positive" displayIcon>
          Positive message.
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...props}>
        <ActionButton>
          Negative Tooltip
        </ActionButton>
        <Tooltip variant="negative" displayIcon>
          Negative message.
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...props}>
        <ActionButton>
          Info Tooltip
        </ActionButton>
        <Tooltip variant="info" displayIcon>
          Informative message.
        </Tooltip>
      </TooltipTrigger>
    </Flex>
  );
}
