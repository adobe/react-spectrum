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

import {ActionBar, ActionBarProps} from '../src/ActionBar';
import {ActionButton} from '../src/ActionButton';
import {generatePowerset} from '@react-spectrum/story-utils';
import type {Meta, StoryObj} from '@storybook/react';
import {ReactNode} from 'react';
import {shortName} from './utils';
import {style} from '../style' with {type: 'macro'};

const meta: Meta<typeof ActionBar> = {
  component: ActionBar,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/ActionBar'
};

export default meta;

type Story = StoryObj<typeof ActionBar>;

let states = [{isEmphasized: [false, true]}];
let combinations = generatePowerset(states);

const Template = (args: ActionBarProps): ReactNode => {
  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 24, width: 960})}>
      {combinations.map(c => {
        let key =
          Object.keys(c)
            .map(k => shortName(k, c[k]))
            .join(' ') || 'default';

        return (
          <div key={key} className={style({position: 'relative', height: 96})}>
            <ActionBar {...args} {...c} selectedItemCount={3}>
              <ActionButton>Edit</ActionButton>
              <ActionButton>Copy</ActionButton>
              <ActionButton>Delete</ActionButton>
            </ActionBar>
          </div>
        );
      })}
    </div>
  );
};

export const Default: Story = {
  render: args => <Template {...args} />
};
