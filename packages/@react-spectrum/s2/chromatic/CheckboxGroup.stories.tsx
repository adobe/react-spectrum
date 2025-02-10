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

import {Checkbox, CheckboxGroup, Content, ContextualHelp, Heading} from '../src';
import {generateComboChunks, shortName} from './utils';
import type {Meta} from '@storybook/react';
import {style} from '../style' with { type: 'macro' };

const meta: Meta<typeof CheckboxGroup> = {
  component: CheckboxGroup,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/CheckboxGroup'
};

export default meta;

let states = [
  {isDisabled: true},
  {isEmphasized: true},
  {isInvalid: true},
  {isReadOnly: true},
  {isRequired: true},
  // {labelAlign: ['start', 'end']},
  // {labelPosition: ['top', 'side']},
  {necessityIndicator: ['label', 'icon']},
  {size: ['S', 'M', 'L', 'XL']}
];

const Template = ({combos, containerStyle, ...args}) => {
  return (
    <div className={containerStyle}>
      {combos.map(c => {
        let fullComboName = Object.keys(c).map(k => `${k}: ${c[k]}`).join(' ');
        let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
        if (!key) {
          key = 'default';
        }

        return (
          <CheckboxGroup data-testid={fullComboName} label={key} description="test description" errorMessage="test error" {...c} {...args} value="soccer">
            <Checkbox value="soccer">Soccer</Checkbox>
            <Checkbox value="baseball">Baseball</Checkbox>
            <Checkbox value="basketball">Basketball</Checkbox>
          </CheckboxGroup>
        );
      })}
    </div>
  );
};

let chunks = generateComboChunks({states, numChunks: 5});

export const Horizontal = {
  render: Template,
  args: {
    combos: chunks[0],
    containerStyle: style({display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 600px))', gridAutoFlow: 'row', alignItems: 'center', justifyItems: 'start', gap: 24, width: '[100vw]'}),
    orientation: 'horizontal'
  }
};

export const HorizontalPt2 = {
  render: Template,
  args: {
    ...Horizontal.args,
    combos: chunks[1]
  }
};

export const HorizontalPt3 = {
  render: Template,
  args: {
    ...Horizontal.args,
    combos: chunks[2]
  }
};

export const HorizontalPt4 = {
  render: Template,
  args: {
    ...Horizontal.args,
    combos: chunks[3]
  }
};

export const HorizontalPt5 = {
  render: Template,
  args: {
    ...Horizontal.args,
    combos: chunks[4]
  }
};

export const Vertical = {
  render: Template,
  args: {
    combos: chunks[0],
    containerStyle: style({display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 250px))', gridAutoFlow: 'row', alignItems: 'center', justifyItems: 'start', gap: 24, width: '[100vw]'}),
    orientation: 'vertical'
  }
};

export const VerticalPt2 = {
  render: Template,
  args: {
    ...Vertical.args,
    combos: chunks[1]
  }
};

export const VerticalPt3 = {
  render: Template,
  args: {
    ...Vertical.args,
    combos: chunks[2]
  }
};

export const VerticalPt4 = {
  render: Template,
  args: {
    ...Vertical.args,
    combos: chunks[3]
  }
};

export const VerticalPt5 = {
  render: Template,
  args: {
    ...Vertical.args,
    combos: chunks[4]
  }
};

let statesWithContextual = [
  {isDisabled: true},
  {isInvalid: true},
  {isRequired: true},
  {necessityIndicator: ['label', 'icon']},
  {size: ['S', 'M', 'L', 'XL']}
];

let contextualHelpChunks = generateComboChunks({states: statesWithContextual, numChunks: 3});

export const ContextualHelpStories = {
  render: Template,
  args: {
    combos: contextualHelpChunks[0],
    containerStyle: style({display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 250px))', gridAutoFlow: 'row', alignItems: 'center', justifyItems: 'start', gap: 24, width: '[100vw]'}),
    orientation: 'horizontal',
    contextualHelp: (
      <ContextualHelp>
        <Heading>What is a segment?</Heading>
        <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
      </ContextualHelp>
    )
  }
};

export const ContextualHelpPt2 = {
  render: Template,
  args: {
    ...ContextualHelpStories.args,
    combos: contextualHelpChunks[1]
  }
};

export const ContextualHelpPt3 = {
  render: Template,
  args: {
    ...ContextualHelpStories.args,
    combos: contextualHelpChunks[2]
  }
};

export const ContextualHelpVertical = {
  render: Template,
  args: {
    ...ContextualHelpStories.args,
    containerStyle: style({display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 250px))', gridAutoFlow: 'row', alignItems: 'center', justifyItems: 'start', gap: 24, width: '[100vw]'}),
    orientation: 'vertical'
  }
};

export const ContextualHelpVerticalPt2 = {
  render: Template,
  args: {
    ...ContextualHelpVertical.args,
    combos: contextualHelpChunks[1]
  }
};

export const ContextualHelpVerticalPt3 = {
  render: Template,
  args: {
    ...ContextualHelpVertical.args,
    combos: contextualHelpChunks[2]
  }
};
