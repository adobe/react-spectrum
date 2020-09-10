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

import {action} from '@storybook/addon-actions';
import {ActionButton} from '@react-spectrum/button';
import {Flex} from '@react-spectrum/layout';
import React, {useState} from 'react';
import {storiesOf} from '@storybook/react';
import {Tooltip, TooltipTrigger} from '../src';

storiesOf('TooltipTrigger', module)
  .add(
    'default',
    () => render({})
  )
  .add(
    'placement: left',
    () => render({placement: 'left'})
  )
  .add(
    'placement: start',
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
    () => render({placement: 'start', isDisabled: true})
  )
  .add(
    'zero delay',
    () => render({delay: 0})
  )
  .add(
    'multiple tooltips',
    () => renderMultipleTriggers({placement: 'start'})
  )
  .add(
    'zero delay multiple tooltips',
    () => renderMultipleTriggers({delay: 0})
  )
  .add(
    'controlled',
    () => <ControlledButtons />
  )
  .add(
    'trigger disabled',
    () => renderDisabledTrigger()
  );

function render(props = {}) {
  return (
    <TooltipTrigger {...props} onOpenChange={action('openChange')}>
      <ActionButton>Trigger Tooltip</ActionButton>
      <Tooltip>
        Tooltip message.
      </Tooltip>
    </TooltipTrigger>
  );
}

function renderDisabledTrigger() {
  return (
    <TooltipTrigger onOpenChange={action('openChange')}>
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
      <TooltipTrigger {...props} onOpenChange={action('openChange')}>
        <ActionButton>
          Neutral Tooltip
        </ActionButton>
        <Tooltip showIcon>
          Neutral message.
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...props} onOpenChange={action('openChange')}>
        <ActionButton>
          Positive Tooltip
        </ActionButton>
        <Tooltip variant="positive" showIcon>
          Positive message.
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...props} onOpenChange={action('openChange')}>
        <ActionButton>
          Negative Tooltip
        </ActionButton>
        <Tooltip variant="negative" showIcon>
          Negative message.
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...props} onOpenChange={action('openChange')}>
        <ActionButton>
          Info Tooltip
        </ActionButton>
        <Tooltip variant="info" showIcon>
          Informative message.
        </Tooltip>
      </TooltipTrigger>
    </Flex>
  );
}

function ControlledButtons(props = {}) {
  let [one, setOne] = useState(false);
  let [two, setTwo] = useState(false);
  let [three, setThree] = useState(false);
  let [four, setFour] = useState(false);
  return (
    <Flex gap="size-100" direction="column">
      <TooltipTrigger {...props} isOpen={one} onOpenChange={setOne}>
        <ActionButton>
          Neutral Tooltip
        </ActionButton>
        <Tooltip showIcon>
          Neutral message.
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...props} isOpen={two} onOpenChange={setTwo}>
        <ActionButton>
          Positive Tooltip
        </ActionButton>
        <Tooltip variant="positive" showIcon>
          Positive message.
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...props} isOpen={three} onOpenChange={setThree}>
        <ActionButton>
          Negative Tooltip
        </ActionButton>
        <Tooltip variant="negative" showIcon>
          Negative message.
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...props} isOpen={four} onOpenChange={setFour}>
        <ActionButton>
          Info Tooltip
        </ActionButton>
        <Tooltip variant="info" showIcon>
          Informative message.
        </Tooltip>
      </TooltipTrigger>
    </Flex>
  );
}
