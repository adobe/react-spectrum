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

import {ColorField} from '../src';
import {generateComboChunks, shortName} from './utils';
import type {Meta} from '@storybook/react';
import {style} from '../style' with { type: 'macro' };

const meta: Meta<typeof ColorField> = {
  component: ColorField,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/ColorField'
};

export default meta;

let states = [
  {isInvalid: true},
  {isReadOnly: true},
  {isDisabled: true},
  {isRequired: true},
  {necessityIndicator: ['label', 'icon']},
  {size: ['S', 'M', 'L', 'XL']}
];

const Template = ({combos, ...args}) => {
  return (
    <div className={style({display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 450px))', gridAutoFlow: 'row', justifyItems: 'start', gap: 24, width: '[100vw]'})}>
      {combos.map(c => {
        let fullComboName = Object.keys(c).map(k => `${k}: ${c[k]}`).join(' ');
        let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
        if (!key) {
          key = 'default';
        }
        return (
          <ColorField data-testid={fullComboName} defaultValue="#e21" label={key} description="test description" errorMessage="test error" {...c} {...args}  />
        );
      })}
    </div>
  );
};

let sideChunks = generateComboChunks({states, numChunks: 3});

export const LabelPositionSide = {
  render: Template,
  args: {
    combos: sideChunks[0],
    labelPosition: 'side'
  }
};

export const LabelPositionSidePt2 = {
  render: Template,
  args: {
    ...LabelPositionSide.args,
    combos: sideChunks[1]
  }
};

export const LabelPositionSidePt3 = {
  render: Template,
  args: {
    ...LabelPositionSide.args,
    combos: sideChunks[2]
  }
};

let topState = [
  ...states,
  {labelAlign: ['start', 'end']}
];

let topChunks = generateComboChunks({states: topState, numChunks: 5});

export const LabelPositionTop = {
  render: Template,
  args: {
    combos: topChunks[0],
    labelPosition: 'top'
  }
};

export const LabelPositionTopPt2 = {
  render: Template,
  args: {
    ...LabelPositionTop.args,
    combos: topChunks[1]
  }
};

export const LabelPositionTopPt3 = {
  render: Template,
  args: {
    ...LabelPositionTop.args,
    combos: topChunks[2]
  }
};

export const LabelPositionTopPt4 = {
  render: Template,
  args: {
    ...LabelPositionTop.args,
    combos: topChunks[3]
  }
};

export const LabelPositionTopPt5 = {
  render: Template,
  args: {
    ...LabelPositionTop.args,
    combos: topChunks[4]
  }
};

// Skipped the contextual help stories from here on out since its all shared
