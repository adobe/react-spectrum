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

import {categorizeArgTypes, StaticColorDecorator} from './utils';
import {Link} from '../src';
import type {Meta} from '@storybook/react';
import {style} from '../style' with {type: 'macro'};

const meta: Meta<typeof Link> = {
  component: Link,
  parameters: {
    layout: 'centered'
  },
  args: {
    href: 'https://www.imdb.com/title/tt6348138/',
    target: '_blank'
  },
  decorators: [StaticColorDecorator],
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', ['onPress', 'onPressChange', 'onPressEnd', 'onPressStart', 'onPressUp'])
  },
  title: 'Link'
};

export default meta;

export const Inline = (args: any) => (
  <p
    className={style({
      font: 'body',
      color: {
        default: 'body',
        staticColor: {white: 'white', black: 'black', auto: 'auto'}
      }
    })({staticColor: args.staticColor})}>
    Checkbox groups should use <Link {...args}>help text</Link> for error messaging and descriptions. Descriptions are valuable for giving context.
  </p>
);

export const Standalone = (args: any) => (
  <Link {...args} isStandalone>
    The missing link
  </Link>
);
