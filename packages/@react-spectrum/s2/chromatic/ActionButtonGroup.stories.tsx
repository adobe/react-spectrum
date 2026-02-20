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

import {ActionButton, ActionButtonGroup, Text} from '../src';
import {categorizeArgTypes, getActionArgs, StaticColorDecorator} from '../stories/utils';
import Copy from '../s2wf-icons/S2_Icon_Copy_20_N.svg';
import Cut from '../s2wf-icons/S2_Icon_Cut_20_N.svg';
import type {Meta, StoryObj} from '@storybook/react';
import Paste from '../s2wf-icons/S2_Icon_Paste_20_N.svg';
import {style} from '../style' with { type: 'macro' };

const events = ['onPress', 'onPressChange', 'onPressEnd', 'onPressStart', 'onPressUp', 'onChange'];

const meta: Meta<typeof ActionButtonGroup> = {
  component: ActionButtonGroup,
  parameters: {
    layout: 'centered'
  },
  decorators: [StaticColorDecorator],
  argTypes: {
    ...categorizeArgTypes('Events', events)
  },
  args: {...getActionArgs(events)},
  title: 'S2 Chromatic/ActionButtonGroup'
};

export default meta;

let justifiedStyle = style({
  width: {
    default: 500,
    orientation: {
      vertical: 'auto'
    }
  },
  height: {
    orientation: {
      vertical: 500
    }
  }
});

export const Example: StoryObj<typeof ActionButtonGroup> = {
  render: (args) => (
    <ActionButtonGroup {...args} styles={args.isJustified ? justifiedStyle(args) : undefined}>
      <ActionButton><Cut /><Text slot="label">Cut</Text></ActionButton>
      <ActionButton><Copy /><Text slot="label">Copy</Text></ActionButton>
      <ActionButton><Paste /><Text slot="label">Paste</Text></ActionButton>
    </ActionButtonGroup>
  )
};

export const IconOnly: StoryObj<typeof ActionButtonGroup> = {
  render: (args) => (
    <ActionButtonGroup {...args} styles={args.isJustified ? justifiedStyle(args) : undefined}>
      <ActionButton aria-label="Cut"><Cut /></ActionButton>
      <ActionButton aria-label="Copy"><Copy /></ActionButton>
      <ActionButton aria-label="Paste"><Paste /></ActionButton>
    </ActionButtonGroup>
  )
};

export const Justified: StoryObj<typeof ActionButtonGroup> = {
  render: (args) => (
    <ActionButtonGroup {...args} isJustified styles={justifiedStyle(args)}>
      <ActionButton><Cut /><Text slot="label">Cut</Text></ActionButton>
      <ActionButton><Copy /><Text slot="label">Copy</Text></ActionButton>
      <ActionButton><Paste /><Text slot="label">Paste</Text></ActionButton>
    </ActionButtonGroup>
  )
};
