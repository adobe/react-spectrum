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

import type {Meta, StoryObj} from '@storybook/react';
import {prose} from '../src/style/prose' with {type: 'macro'};
import ProseExample from '../stories/prose.mdx';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const meta: Meta = {
  parameters: {
    chromaticProvider: {
      disableAnimations: true,
      colorSchemes: ['light'],
      locales: ['en-US']
    }
  },
  title: 'S2 Chromatic/Prose'
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <article className={`${prose()} ${style({maxWidth: 800, marginX: 'auto'})}`}>
      <ProseExample components={{CodeBlock: 'pre'}} />
    </article>
  ),
  name: 'prose'
};
