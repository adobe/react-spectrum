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

import {Button, ButtonGroup, Text} from '../src';
import {generatePowerset} from '@react-spectrum/story-utils';
import type {Meta} from '@storybook/react';
import NewIcon from '../s2wf-icons/S2_Icon_New_20_N.svg';
import {shortName} from './utils';
import {style} from '../style' with { type: 'macro' };

const meta: Meta<typeof ButtonGroup> = {
  component: ButtonGroup,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/ButtonGroup'
};

export default meta;

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
          <ButtonGroup data-testid={fullComboName} {...c} {...args}>
            <Button>Press me</Button>
            <Button variant="accent"><NewIcon /><Text>Test</Text></Button>
            <Button><NewIcon /></Button>
            <Button variant="negative" styles={style({maxWidth: 128})}>{key}</Button>
            <Button variant="secondary" styles={style({maxWidth: 128})}>
              <NewIcon />
              <Text>Very long button with wrapping text to see what happens</Text>
            </Button>
          </ButtonGroup>
        );
      })}
    </div>
  );
};

let horizontalStates = [
  {isDisabled: true},
  {size: ['S', 'M', 'L', 'XL']},
  {orientation: ['horizontal']}
];

let horizontalCombos = generatePowerset(horizontalStates);
export const Horizontal = {
  render: Template,
  args: {
    combos: horizontalCombos,
    containerStyle: style({display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 600px))', gridAutoFlow: 'row', alignItems: 'center', justifyItems: 'start', gap: 24, width: '[100vw]'})
  }
};

let verticalStates = [
  {isDisabled: true},
  {size: ['S', 'M', 'L', 'XL']},
  {align: ['start', 'end', 'center']},
  {orientation: ['vertical']}
];

let verticalCombos = generatePowerset(verticalStates);
export const Vertical = {
  render: Template,
  args: {
    combos: verticalCombos,
    containerStyle: style({display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 250px))', gridAutoFlow: 'row', alignItems: 'center', justifyItems: 'start', gap: 24, width: '[100vw]'})
  }
};
