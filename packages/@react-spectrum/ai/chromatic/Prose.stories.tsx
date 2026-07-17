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

import {Button} from '@react-spectrum/s2/Button';
import {prose} from '@react-spectrum/ai/style' with {type: 'macro'};
import type {Meta, StoryObj} from '@storybook/react';
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
  parameters: {
    chromatic: {delay: 2000}
  },
  name: 'prose'
};

export const ProseOverrides: Story = {
  render: () => (
    <article className={`${prose()} ${style({maxWidth: 800, marginX: 'auto'})}`}>
      <h1>The H1</h1>
      <h2>The H2</h2>
      <h3 className={style({fontSize: 'heading-xl'})}>The H3</h3>
      <p>The h3 should look the same as the h1 above because the font size was overridden.</p>
      <p className={style({fontSize: 'body-xl'})}>
        This is a paragraph where the text size has been overridden to be bigger using the style
        macro on the paragraph.
      </p>
      <Button variant="primary">A button</Button>
      <p>Our RSP button should be unaffected.</p>
      <h2>Overriding prose styles</h2>
      <p>
        Each highlighted element below is matched by a prose selector with higher specificity than
        the single-class override applied to it. The override still wins because prose lives in a
        lower cascade layer than the style macro.
      </p>

      <h3>Element after a heading</h3>
      <p className={style({marginTop: 40})}>
        This paragraph immediately follows a heading, so prose zeroes its margin-top via{' '}
        <code>.prose :is(h1…h6, hr) + *</code> (specificity 0,1,1). The override restores a 40px top
        margin. It also contains{' '}
        <code
          className={style({
            backgroundColor: 'blue-200',
            color: 'blue-900',
            borderColor: 'blue-400'
          })}>
          inline code
        </code>{' '}
        recolored past <code>.prose code:not(pre code)</code> (specificity 0,1,3).
      </p>

      <h3>Last paragraph in a list item</h3>
      <ul>
        <li>
          <p>First paragraph — no special margin.</p>
          <p className={style({marginBottom: 48})}>
            Last paragraph. Prose sets its margin-bottom through{' '}
            <code>.prose li &gt; p:last-child:not(:first-child)</code> (specificity 0,3,2); the
            override widens it to 48px.
          </p>
        </li>
      </ul>

      <h3>Links across every state</h3>
      <p>
        A{' '}
        <a href="https://react-spectrum.adobe.com" className={style({color: 'green-900'})}>
          recolored link
        </a>{' '}
        overrides <code>.prose a</code> for every state: because a higher layer beats a lower one
        regardless of specificity, the override even wins over prose’s <code>:hover</code> and{' '}
        <code>:active</code> colors.
      </p>
    </article>
  ),
  parameters: {
    chromatic: {delay: 2000}
  }
};
