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
import {ActionButton, Button} from '@react-spectrum/button';
import {ActionGroup, Item} from '@react-spectrum/actiongroup';
import {Flex} from '@react-spectrum/layout';
import {Link} from '@react-spectrum/link';
import React, {useState} from 'react';
import {Tooltip, TooltipTrigger} from '../src';

export default {
  title: 'TooltipTrigger'
};

export const Default = () => render({});

Default.story = {
  name: 'default'
};

export const PlacementLeft = () => render({placement: 'left'});

PlacementLeft.story = {
  name: 'placement: left'
};

export const PlacementRight = () => render({placement: 'right'});

PlacementRight.story = {
  name: 'placement: right'
};

export const PlacementStart = () => render({placement: 'start'});

PlacementStart.story = {
  name: 'placement: start'
};

export const PlacementTop = () => render({placement: 'top'});

PlacementTop.story = {
  name: 'placement: top'
};

export const PlacementBottom = () => render({placement: 'bottom'});

PlacementBottom.story = {
  name: 'placement: bottom'
};

export const PlacementTopWithOffset = () =>
  render({placement: 'top', offset: 50});

PlacementTopWithOffset.story = {
  name: 'placement: top with offset'
};

export const PlacementBottomWithCrossOffset = () =>
  render({placement: 'bottom', crossOffset: 50});

PlacementBottomWithCrossOffset.story = {
  name: 'placement: bottom with crossOffset'
};

export const IsDisabled = () =>
  render({placement: 'start', isDisabled: true});

IsDisabled.story = {
  name: 'isDisabled'
};

export const ZeroDelay = () => render({delay: 0});

ZeroDelay.story = {
  name: 'zero delay'
};

export const FocusOnly = () => render({trigger: 'focus'});

FocusOnly.story = {
  name: 'focus only'
};

export const MultipleTooltips = () =>
  renderMultipleTriggers({placement: 'start'});

MultipleTooltips.story = {
  name: 'multiple tooltips'
};

export const ZeroDelayMultipleTooltips = () =>
  renderMultipleTriggers({delay: 0});

ZeroDelayMultipleTooltips.story = {
  name: 'zero delay multiple tooltips'
};

export const Controlled = () => <ControlledButtons />;

Controlled.story = {
  name: 'controlled'
};

export const TriggerDisabled = () => renderDisabledTrigger();

TriggerDisabled.story = {
  name: 'trigger disabled'
};

export const ArrowPositioningAtEdge = () => (
  <div style={{width: '100%'}}>
    <TooltipTrigger onOpenChange={action('openChange')}>
      <ActionButton>Trigger Tooltip</ActionButton>
      <Tooltip>Long tooltip message that just goes on and on.</Tooltip>
    </TooltipTrigger>
  </div>
);

ArrowPositioningAtEdge.story = {
  name: 'arrow positioning at edge'
};

export const TooltipWithOtherHoverables = () => (
  <Flex gap="size-100">
    <TooltipTrigger onOpenChange={action('openChange')}>
      <ActionButton>Trigger Tooltip</ActionButton>
      <Tooltip>Long tooltip message that just goes on and on.</Tooltip>
    </TooltipTrigger>
    <Button variant="secondary">No Tooltip</Button>
  </Flex>
);

TooltipWithOtherHoverables.story = {
  name: 'tooltip with other hoverables'
};

export const TooltripTriggerInsideActionGroup = () => ActionGroupTrigger();

TooltripTriggerInsideActionGroup.story = {
  name: 'tooltrip trigger inside action group'
};

export const CrossoffsetExamples = () => (
  <Flex gap="size-200">
    <Flex gap="size-200" direction="column" alignItems="start">
      <span>Left Top</span>
      <TooltipTrigger delay={0} placement="left top" crossOffset={10}>
        <ActionButton>Tooltip Trigger 10</ActionButton>
        <Tooltip>Tooltip message.</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0} placement="left top">
        <ActionButton>Tooltip Trigger 0</ActionButton>
        <Tooltip>Tooltip message.</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0} placement="left top" crossOffset={-10}>
        <ActionButton>Tooltip Trigger -10</ActionButton>
        <Tooltip>Tooltip message.</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0} placement="left top" crossOffset={10}>
        <ActionButton>Tooltip 10</ActionButton>
        <Tooltip>Tooltip message.</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0} placement="left top">
        <ActionButton>Tooltip 0</ActionButton>
        <Tooltip>Tooltip message.</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0} placement="left top" crossOffset={-10}>
        <ActionButton>Tooltip -10</ActionButton>
        <Tooltip>Tooltip message.</Tooltip>
      </TooltipTrigger>
    </Flex>
    <Flex gap="size-200" direction="column" alignItems="start">
      <span>Left</span>
      <TooltipTrigger delay={0} placement="left" crossOffset={10}>
        <ActionButton>Tooltip Trigger 10</ActionButton>
        <Tooltip>Tooltip message.</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0} placement="left">
        <ActionButton>Tooltip Trigger 0 </ActionButton>
        <Tooltip>Tooltip message.</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0} placement="left" crossOffset={-10}>
        <ActionButton>Tooltip Trigger -10</ActionButton>
        <Tooltip>Tooltip message.</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0} placement="left" crossOffset={10}>
        <ActionButton>Tooltip 10</ActionButton>
        <Tooltip>Tooltip message.</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0} placement="left">
        <ActionButton>Tooltip 0</ActionButton>
        <Tooltip>Tooltip message.</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0} placement="left" crossOffset={-10}>
        <ActionButton>Tooltip -10</ActionButton>
        <Tooltip>Tooltip message.</Tooltip>
      </TooltipTrigger>
    </Flex>
    <Flex gap="size-200" direction="column" alignItems="start">
      <span>Left Bottom</span>
      <TooltipTrigger delay={0} placement="left bottom" crossOffset={10}>
        <ActionButton>Tooltip Trigger 10</ActionButton>
        <Tooltip>Tooltip message.</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0} placement="left bottom">
        <ActionButton>Tooltip Trigger 0</ActionButton>
        <Tooltip>Tooltip message.</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0} placement="left bottom" crossOffset={-10}>
        <ActionButton>Tooltip Trigger -10</ActionButton>
        <Tooltip>Tooltip message.</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0} placement="left bottom" crossOffset={10}>
        <ActionButton>Tooltip 10</ActionButton>
        <Tooltip>Tooltip message.</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0} placement="left bottom">
        <ActionButton>Tooltip 0</ActionButton>
        <Tooltip>Tooltip message.</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0} placement="left bottom" crossOffset={-10}>
        <ActionButton>Tooltip -10</ActionButton>
        <Tooltip>Tooltip message.</Tooltip>
      </TooltipTrigger>
    </Flex>
  </Flex>
);

CrossoffsetExamples.story = {
  name: 'crossoffset examples'
};

export const TooltipOnLink = () => <LinkWithTooltip />;

TooltipOnLink.story = {
  name: 'tooltip on link'
};

function render(props = {}) {
  return (
    <TooltipTrigger {...props} onOpenChange={action('openChange')}>
      <ActionButton>Trigger Tooltip</ActionButton>
      <Tooltip>Tooltip message.</Tooltip>
    </TooltipTrigger>
  );
}

function renderDisabledTrigger() {
  return (
    <TooltipTrigger onOpenChange={action('openChange')}>
      <ActionButton isDisabled>Trigger Tooltip</ActionButton>
      <Tooltip>Tooltip message.</Tooltip>
    </TooltipTrigger>
  );
}

function renderMultipleTriggers(props = {}) {
  return (
    <Flex gap="size-100" direction="column">
      <TooltipTrigger {...props} onOpenChange={action('openChange')}>
        <ActionButton>Neutral Tooltip</ActionButton>
        <Tooltip showIcon>Neutral message.</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...props} onOpenChange={action('openChange')}>
        <ActionButton>Positive Tooltip</ActionButton>
        <Tooltip variant="positive" showIcon>
          Positive message.
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...props} onOpenChange={action('openChange')}>
        <ActionButton>Negative Tooltip</ActionButton>
        <Tooltip variant="negative" showIcon>
          Negative message.
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...props} onOpenChange={action('openChange')}>
        <ActionButton>Info Tooltip</ActionButton>
        <Tooltip variant="info" showIcon>
          Informative message.
        </Tooltip>
      </TooltipTrigger>
    </Flex>
  );
}

function ActionGroupTrigger() {
  let onSelectionChange = action('onSelectionChange');

  return (
    <ActionGroup
      selectionMode="single"
      disallowEmptySelection
      onSelectionChange={(s) => onSelectionChange([...s])}>
      <TooltipTrigger delay={0}>
        <Item key="item1">Trigger Tooltip</Item>
        <Tooltip>Tooltip is inside an ActionGroup</Tooltip>
      </TooltipTrigger>
    </ActionGroup>
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
        <ActionButton>Neutral Tooltip</ActionButton>
        <Tooltip showIcon>Neutral message.</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...props} isOpen={two} onOpenChange={setTwo}>
        <ActionButton>Positive Tooltip</ActionButton>
        <Tooltip variant="positive" showIcon>
          Positive message.
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...props} isOpen={three} onOpenChange={setThree}>
        <ActionButton>Negative Tooltip</ActionButton>
        <Tooltip variant="negative" showIcon>
          Negative message.
        </Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...props} isOpen={four} onOpenChange={setFour}>
        <ActionButton>Info Tooltip</ActionButton>
        <Tooltip variant="info" showIcon>
          Informative message.
        </Tooltip>
      </TooltipTrigger>
    </Flex>
  );
}

function LinkWithTooltip(props = {}) {
  return (
    <TooltipTrigger {...props}>
      <Link>
        <a
          href="https://react-spectrum.adobe.com/"
          target="_blank"
          rel="noreferrer">
          Link with tooltip
        </a>
      </Link>
      <Tooltip>This is a link</Tooltip>
    </TooltipTrigger>
  );
}
