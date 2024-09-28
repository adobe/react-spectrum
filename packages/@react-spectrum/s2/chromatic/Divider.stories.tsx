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

import {baseColor, style} from '../style/spectrum-theme' with {type: 'macro'};
import {Divider} from '../src';

import type {Meta} from '@storybook/react';
import {StaticColorDecorator} from '../stories/utils';

const meta: Meta<typeof Divider> = {
  component: Divider,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  decorators: [StaticColorDecorator],
  title: 'S2 Chromatic/Divider'
};

export default meta;

export const Example = {
  render: (args: any) => (
    <section
      className={style({
        display: 'flex',
        alignItems: 'center',
        rowGap: 12,
        columnGap: 12,
        flexDirection: {
          default: 'column',
          orientation: {
            'vertical': 'row'
          }
        },
        font: 'body',
        color: {
          staticColor: {
            default: 'gray-900',
            black: baseColor('transparent-black-800'),
            white: baseColor('transparent-white-800')
          }
        }
      })({staticColor: args.staticColor, orientation: args.orientation})}>
      <p>Some text</p>
      <Divider {...args} />
      <p>Some text</p>
    </section>
  )
};
