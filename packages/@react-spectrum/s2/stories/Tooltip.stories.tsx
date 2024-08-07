/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton, Button, Provider, Tooltip, TooltipTrigger} from '../src';
import {CombinedTooltip} from '../src/Tooltip';
import Crop from '../s2wf-icons/S2_Icon_Crop_20_N.svg';
import LassoSelect from '../s2wf-icons/S2_Icon_LassoSelect_20_N.svg';
import type {Meta} from '@storybook/react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {userEvent, within} from '@storybook/testing-library';

const meta: Meta<typeof CombinedTooltip> = {
  component: CombinedTooltip,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    onOpenChange: {table: {category: 'Events'}}
  },
  decorators: [(Story) => <div style={{height: '100px', width: '200px', display: 'flex', alignItems: 'end', justifyContent: 'center', paddingBottom: 10}}><Story /></div>]
};

export default meta;

export const Example = (args: any) => {
  let {
    trigger,
    isOpen,
    onOpenChange,
    defaultOpen,
    isDisabled,
    delay,
    containerPadding,
    crossOffset,
    offset,
    placement,
    shouldFlip,
    ...tooltipProps
  } = args;
  let triggerProps = {
    trigger,
    isOpen,
    onOpenChange,
    defaultOpen,
    isDisabled,
    delay,
    containerPadding,
    crossOffset,
    offset,
    placement,
    shouldFlip
  };

  return (
    <div
      className={style({
        display: 'flex',
        flexDirection: 'row',
        columnGap: 12
      })}>
      <TooltipTrigger {...triggerProps}>
        <Button aria-label="Crop"><Crop /></Button>
        <Tooltip {...tooltipProps}>Crop</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger {...triggerProps}>
        <ActionButton aria-label="Lasso"><LassoSelect /></ActionButton>
        <Tooltip {...tooltipProps}>Lasso</Tooltip>
      </TooltipTrigger>
    </div>
  );
};

Example.play = async ({canvasElement}) => {
  await userEvent.tab();
  let body = canvasElement.ownerDocument.body;
  await within(body).findByRole('tooltip');
};


Example.story = {
  argTypes: {
    isOpen: {
      control: 'select',
      options: [true, false, undefined]
    }
  }
};

export const LongLabel = (args: any) => {
  let {
    trigger,
    isOpen,
    onOpenChange,
    defaultOpen,
    isDisabled,
    delay,
    containerPadding,
    crossOffset,
    offset,
    placement,
    shouldFlip,
    ...tooltipProps
  } = args;
  let triggerProps = {
    trigger,
    isOpen,
    onOpenChange,
    defaultOpen,
    isDisabled,
    delay,
    containerPadding,
    crossOffset,
    offset,
    placement,
    shouldFlip
  };
  return (
    <TooltipTrigger {...triggerProps}>
      <ActionButton aria-label="Lasso"><LassoSelect /></ActionButton>
      <Tooltip {...tooltipProps}>Checkbox with very long label so we can see wrapping</Tooltip>
    </TooltipTrigger>
  );
};

LongLabel.story = {
  argTypes: {
    isOpen: {
      control: 'select',
      options: [true, false, undefined]
    }
  }
};

LongLabel.play = async ({canvasElement}) => {
  await userEvent.tab();
  let body = canvasElement.ownerDocument.body;
  await within(body).findByRole('tooltip');
};

export const ColorScheme = (args: any) => (
  <Provider colorScheme="dark" background="base" styles={style({padding: 48})}>
    <Example {...args} />
  </Provider>
);

ColorScheme.story = {
  argTypes: {
    isOpen: {
      control: 'select',
      options: [true, false, undefined]
    }
  }
};

ColorScheme.play = async ({canvasElement}) => {
  await userEvent.tab();
  let body = canvasElement.ownerDocument.body;
  await within(body).findByRole('tooltip');
};
