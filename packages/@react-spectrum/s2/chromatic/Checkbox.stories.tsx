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
import {generateComboChunks, shortName} from './utils';
import {LongLabel} from '../stories/Checkbox.stories';
import type {Meta} from '@storybook/react';
import {style} from '../style' with { type: 'macro' };

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

const Template = ({combos, ...args}) => {
  return (
    <div className={style({display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 250px))', gridAutoFlow: 'row', alignItems: 'center', justifyItems: 'start', gap: 24, width: '[100vw]'})}>
      {combos.map(c => {
        let fullComboName = Object.keys(c).map(k => `${k}: ${c[k]}`).join(' ');
        let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
        if (!key) {
          key = 'default';
        }

        return <Checkbox data-testid={fullComboName} key={key} {...args} {...c}>{key}</Checkbox>;
      })}
    </div>
  );
};

let chunks = generateComboChunks({states, numChunks: 3});
export const Default = {
  render: Template,
  args: {
    combos: chunks[0]
  }
};

export const DefaultPt2 = {
  render: Template,
  args: {
    combos: chunks[1]
  }
};

export const DefaultPt3 = {
  render: Template,
  args: {
    combos: chunks[2]
  }
};

export {LongLabel};
