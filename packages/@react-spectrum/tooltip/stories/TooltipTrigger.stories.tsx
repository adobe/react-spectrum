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
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import Delete from '@spectrum-icons/workflow/Delete';
import Edit from '@spectrum-icons/workflow/Edit';
import {Flex} from '@react-spectrum/layout';
import {Link} from '@react-spectrum/link';
import React, {useState} from 'react';
import SaveTo from '@spectrum-icons/workflow/SaveTo';
import {SpectrumTooltipTriggerProps} from '@react-types/tooltip';
import {Tooltip, TooltipTrigger} from '../src';

interface TooltipTooltipTriggerProps {
  variant?: 'neutral' | 'positive' | 'negative' | 'info',
  isOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void
}

interface MultipleTriggersProps extends SpectrumTooltipTriggerProps {
   isControlled?: boolean
 }

type TooltipTriggerStory = ComponentStoryObj<typeof TooltipTrigger>;

const argTypes = {
  placement: {
    control: 'select',
    options: ['bottom', 'bottom left', 'bottom right', 'bottom start', 'bottom end', 'top', 'top left', 'top right', 'top start', 'top end', 'left', 'left top', 'left bottom', 'start', 'start top', 'start bottom', 'right', 'right top', 'right bottom', 'end', 'end top', 'end bottom']
  },
  delay: {
    control: 'number',
    min: 0,
    max: 50000,
    step: 500
  },
  offset: {
    control: 'number',
    min: -500,
    max: 500
  },
  crossOffset: {
    control: 'number',
    min: -500,
    max: 500
  },
  containerPadding: {
    control: 'number',
    min: -500,
    max: 500
  },
  isDisabled: {
    control: 'boolean'
  },
  shouldFlip: {
    control: 'boolean'
  },
  trigger: {
    control: 'radio',
    options: [undefined, 'focus']
  },
  children: {
    control: {disable: true}
  }
};

const disabledArgTypes = {
  placement: {
    control: {disable: true}
  },
  delay: {
    control: {disable: true}
  },
  offset: {
    control: {disable: true}
  },
  crossOffset: {
    control: {disable: true}
  },
  containerPadding: {
    control: {disable: true}
  },
  isDisabled: {
    control: {disable: true}
  },
  shouldFlip: {
    control: {disable: true}
  },
  trigger: {
    control: {disable: true}
  },
  children: {
    control: {disable: true}
  }
};

export default {
  title: 'TooltipTrigger',
  component: TooltipTrigger,
  args: {
    children: [
      <ActionButton aria-label="Edit Name"><Edit /></ActionButton>,
      <Tooltip>Change Name</Tooltip>
    ],
    onOpenChange: action('openChange')
  },
  argTypes: argTypes
} as ComponentMeta<typeof TooltipTrigger>;

export const Default: TooltipTriggerStory = {};

export const DefaultOpen: TooltipTriggerStory = {
  args: {defaultOpen: true},
  name: 'defaultOpen: true'
};

export const IsOpen: TooltipTriggerStory = {
  args: {isOpen: true},
  name: 'isOpen: true'
};

export const TriggerDisabled: TooltipTriggerStory = {
  args: {
    children: [
      <ActionButton aria-label="Edit Name" isDisabled><Edit /></ActionButton>,
      <Tooltip>Change Name</Tooltip>
    ]
  },
  argTypes: disabledArgTypes
};

export const TooltipOnLink: TooltipTriggerStory  = {
  args: {
    children: [
      <Link>
        <a href="https://react-spectrum.adobe.com/" target="_blank" rel="noreferrer">
          Why did dinosaurs have feathers?
        </a>
      </Link>,
      <Tooltip>Dinosaurs had feathers, find out more.</Tooltip>
    ]
  }
};

export const TooltripTriggerInsideActionGroup: TooltipTriggerStory = {
  args: {delay: 0},
  render: (args) => (
    <ActionGroup
      selectionMode="single"
      disallowEmptySelection
      onSelectionChange={action('onSelectionChange')} >
      <TooltipTrigger {...args}>
        <Item key="editKey" aria-label="Edit"><Edit /></Item>
        <Tooltip>Edit</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...args}>
        <Item key="saveKey" aria-label="Save"><SaveTo /></Item>
        <Tooltip>Save</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...args}>
        <Item key="deleteKey" aria-label="Delete"><Delete /></Item>
        <Tooltip>Delete</Tooltip>
      </TooltipTrigger>
    </ActionGroup>
  )
};

export const ArrowPositioningAtEdge: TooltipTriggerStory = {
  args: {
    children: [
      <ActionButton>Trigger Tooltip</ActionButton>,
      <Tooltip>Long tooltip message that just goes on and on.</Tooltip>
    ]
  },
  decorators: [(Story) => (
    <div style={{width: '100%'}}>
      <Story />
    </div>
  )]
};

export const TooltipWithOtherHoverables: TooltipTriggerStory = {
  args: {
    children: [
      <ActionButton>Trigger Tooltip</ActionButton>,
      <Tooltip>Long tooltip message that just goes on and on.</Tooltip>
    ]
  },
  decorators: [(Story) => (
    <Flex gap="size-100">
      <Story />
      <Button variant="secondary">No Tooltip</Button>
    </Flex>
  )]
};

export const MultipleTooltips: TooltipTriggerStory = {
  args: {placement: 'start'},
  render: (props) => <MultipleTriggers {...props} />
};

export const ControlledMultipleTooltips: TooltipTriggerStory = {
  args: {placement: 'start'},
  render: (props) => <MultipleTriggers {...props} isControlled />
};

let MultipleTriggers = (props: MultipleTriggersProps) => {
  let [one, setOne] = useState(false);
  let [two, setTwo] = useState(false);
  let [three, setThree] = useState(false);
  let [four, setFour] = useState(false);

  let items: Array<TooltipTooltipTriggerProps> = [
    {variant: 'neutral', isOpen: one, onOpenChange: setOne},
    {variant: 'positive', isOpen: two, onOpenChange: setTwo},
    {variant: 'negative', isOpen: three, onOpenChange: setThree},
    {variant: 'info', isOpen: four, onOpenChange: setFour}
  ];

  return (
    <Flex gap="size-100" direction="column">
      {items.map((item) => (
        <TooltipTrigger
          {...props}
          key={item.variant}
          isOpen={props.isControlled ? item.isOpen : undefined}
          onOpenChange={props.isControlled ? item.onOpenChange : action('onOpenChange')}>
          <ActionButton>{item.variant} Tooltip</ActionButton>
          <Tooltip variant={item.variant} showIcon>
            {item.variant} message.
          </Tooltip>
        </TooltipTrigger>
      ))}
    </Flex>
  );
};

export const CrossoffsetExamples: TooltipTriggerStory = {
  render: () => (
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
      </Flex>
    </Flex>
  )
};
