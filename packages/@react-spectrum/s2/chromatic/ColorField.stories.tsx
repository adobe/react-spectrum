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
import {generatePowerset} from '@react-spectrum/story-utils';
import type {Meta} from '@storybook/react';
import {shortName} from './utils';
import {style} from '../style/spectrum-theme' with { type: 'macro' };

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
        let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
        if (!key) {
          key = 'default';
        }
        return (
          <ColorField defaultValue="#e21" label={key} description="test description" errorMessage="test error" {...c} {...args}  />
        );
      })}
    </div>
  );
};

let sideState = states;
let sideCombos = generatePowerset(sideState);

export const LabelPositionSide = {
  render: Template,
  args: {
    combos: sideCombos,
    labelPosition: 'side'
  }
};

let topState = [
  ...states,
  {labelAlign: ['start', 'end']}
];
let topCombos = generatePowerset(topState);

export const LabelPositionTop = {
  render: Template,
  args: {
    combos: topCombos,
    labelPosition: 'top'
  }
};

// Skipped the contextual help stories from here on out since its all shared
