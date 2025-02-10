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

import {Badge} from '../src';
import {Example} from '../stories/Badge.stories';
import {generatePowerset} from '@react-spectrum/story-utils';
import type {Meta} from '@storybook/react';
import {shortName} from './utils';
import {style} from '../style' with { type: 'macro' };

const meta: Meta<typeof Badge> = {
  component: Badge,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/Badge'
};

export default meta;

let states = [
  {size: ['S', 'M', 'L', 'XL']},
  {fillStyle: ['bold', 'subtle', 'outline']},
  {variant: ['accent', 'informative', 'neutral', 'positive', 'notice', 'negative', 'gray', 'red', 'orange', 'yellow', 'chartreuse', 'celery', 'green', 'seafoam', 'cyan', 'blue', 'indigo', 'purple', 'fuchsia', 'magenta', 'pink', 'turquoise', 'brown', 'cinnamon', 'silver']}
];

let combinations = generatePowerset(states);
let chunkSize = Math.ceil(combinations.length / 3);

const Template = ({combos, ...args}) => {
  return (
    <div className={style({display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 250px))', gridAutoFlow: 'row', alignItems: 'center', justifyItems: 'start', gap: 24, width: '[100vw]'})}>
      {combos.map(c => {
        let fullComboName = Object.keys(c).map(k => `${k}: ${c[k]}`).join(' ');
        let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
        if (!key) {
          key = 'default';
        }

        return <Badge key={key} data-testid={fullComboName} {...args} {...c}>{key}</Badge>;
      })}
    </div>
  );
};

export const Default = {
  render: Template,
  name: 'all visual option combos 1 of 3',
  args: {combos: combinations.slice(0, chunkSize)}
};

export const ComboPt2 = {
  render: Template,
  args: {combos: combinations.slice(chunkSize, chunkSize * 2)},
  name: 'all visual option combos 2 of 3'
};

export const ComboPt3 = {
  render: Template,
  args: {combos: combinations.slice(chunkSize * 2, chunkSize * 3)},
  name: 'all visual option combos 3 of 3'
};

export {Example};
