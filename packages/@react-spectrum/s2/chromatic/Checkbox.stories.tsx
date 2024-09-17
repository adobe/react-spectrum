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

import {Checkbox} from '../src';
import {generatePowerset} from '@react-spectrum/story-utils';
import {LongLabel} from '../stories/Checkbox.stories';
import type {Meta} from '@storybook/react';
import {shortName} from './utils';
import {style} from '../style/spectrum-theme' with { type: 'macro' };

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/Checkbox'
};

export default meta;

let states = [
  {defaultSelected: true},
  {isDisabled: true},
  {isEmphasized: true},
  {isIndeterminate: true},
  {isInvalid: true},
  {isReadOnly: true},
  {isRequired: true},
  {size: ['S', 'M', 'L', 'XL']}
];

let combinations = generatePowerset(states);

const Template = (args) => {
  return (
    <div className={style({display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 250px))', gridAutoFlow: 'row', alignItems: 'center', justifyItems: 'start', gap: 24, width: '[100vw]'})}>
      {combinations.map(c => {
        let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
        if (!key) {
          key = 'default';
        }

        return <Checkbox key={key} {...args} {...c}>{key}</Checkbox>;
      })}
    </div>
  );
};

export const Default = {
  render: Template
};

export {LongLabel};
