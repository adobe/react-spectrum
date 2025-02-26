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

import Bold from '../s2wf-icons/S2_Icon_TextBold_20_N.svg';
import {categorizeArgTypes, StaticColorDecorator} from '../stories/utils';
import Italic from '../s2wf-icons/S2_Icon_TextItalic_20_N.svg';
import type {Meta} from '@storybook/react';
import {style} from '../style' with { type: 'macro' };
import {Text, ToggleButton, ToggleButtonGroup} from '../src';
import Underline from '../s2wf-icons/S2_Icon_TextUnderline_20_N.svg';

const meta: Meta<typeof ToggleButtonGroup> = {
  component: ToggleButtonGroup,
  parameters: {
    layout: 'centered'
  },
  decorators: [StaticColorDecorator],
  argTypes: {
    ...categorizeArgTypes('Events', ['onPress', 'onPressChange', 'onPressEnd', 'onPressStart', 'onPressUp', 'onChange'])
  },
  title: 'S2 Chromatic/ToggleButtonGroup'
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

export const Example = {
  render: (args) => (
    <ToggleButtonGroup {...args}>
      <ToggleButton id={1}><Bold /><Text slot="label">Bold</Text></ToggleButton>
      <ToggleButton id={2}><Italic /><Text slot="label">Italic</Text></ToggleButton>
      <ToggleButton id={3}><Underline /><Text slot="label">Underline</Text></ToggleButton>
    </ToggleButtonGroup>
  )
};

export const IconOnly = {
  render: (args) => (
    <ToggleButtonGroup {...args}>
      <ToggleButton id={1} aria-label="Bold"><Bold /></ToggleButton>
      <ToggleButton id={2} aria-label="Italic"><Italic /></ToggleButton>
      <ToggleButton id={3} aria-label="Underline"><Underline /></ToggleButton>
    </ToggleButtonGroup>
)
};

export const Justified = {
  render: (args) => (
    <ToggleButtonGroup {...args} isJustified styles={justifiedStyle(args)}>
      <ToggleButton id={1}><Bold /><Text slot="label">Bold</Text></ToggleButton>
      <ToggleButton id={2}><Italic /><Text slot="label">Italic</Text></ToggleButton>
      <ToggleButton id={3}><Underline /><Text slot="label">Underline</Text></ToggleButton>
    </ToggleButtonGroup>
  )
};
