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

import {Breadcrumb, Breadcrumbs} from '../src';
import {generatePowerset} from '@react-spectrum/story-utils';
import {Many} from '../stories/Breadcrumbs.stories';
import type {Meta, StoryObj} from '@storybook/react';
import {shortName} from './utils';
import {style} from '../style' with { type: 'macro' };
import {userEvent, within} from '@storybook/testing-library';

const meta: Meta<typeof Breadcrumbs> = {
  component: Breadcrumbs,
  tags: ['autodocs'],
  title: 'S2 Chromatic/Breadcrumbs'
};

export default meta;

export const Dynamic = Many as StoryObj;

Dynamic.parameters = {
  // TODO: move these options back to meta above once we get strings for ar-AE. This is just to prevent the RTL story's config from actually applying
  chromaticProvider: {colorSchemes: ['light'], backgrounds: ['base'], locales: ['en-US'], disableAnimations: true}
};

Dynamic.play = async ({canvasElement}) => {
  // This uses click because using .tab twice didn't move focus to the menu
  let trigger = await within(canvasElement).findByRole('button');
  await userEvent.click(trigger);
  let body = canvasElement.ownerDocument.body;
  await within(body).findByRole('menu');
};

let states = [
  {isDisabled: true},
  {size: ['M', 'L']}
];

let combinations = generatePowerset(states);

const Template = () => {
  return (
    <div className={style({display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 250px))', gridAutoFlow: 'row', alignItems: 'center', justifyItems: 'start', gap: 24, width: '[100vw]'})}>
      {combinations.map(c => {
        let fullComboName = Object.keys(c).map(k => `${k}: ${c[k]}`).join(' ');
        let key = Object.keys(c).map(k => shortName(k, c[k])).join(' ');
        if (!key) {
          key = 'default';
        }

        return (
          <Breadcrumbs data-testid={fullComboName} key={key} {...c}>
            <Breadcrumb href="/">
              Home
            </Breadcrumb>
            <Breadcrumb href="/react-aria">
              React Aria
            </Breadcrumb>
            <Breadcrumb href="/breadcrumbs">
              Breadcrumbs
            </Breadcrumb>
          </Breadcrumbs>
        );
      })}
    </div>
  );
};

export const Powerset = {
  render: Template,
  parameters: {
    chromaticProvider: {locales: ['en-US'], disableAnimations: true}
  }
};
