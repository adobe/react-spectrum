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

import {CardView, Content, Heading, IllustratedMessage} from '../src';
import EmptyIcon from '../spectrum-illustrations/gradient/generic1/Image';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof CardView> = {
  component: CardView,
  parameters: {
    layout: 'fullscreen',
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/CardView'
};

export default meta;

const cardViewStyles = style({
  width: 'screen',
  maxWidth: 'full',
  height: 600
});

export const Empty: StoryObj<typeof CardView> = {
  render: (args) => (
    <CardView
      aria-label="Assets"
      {...args}
      styles={cardViewStyles}
      renderEmptyState={() => (
        <IllustratedMessage size="L">
          <EmptyIcon />
          <Heading>Create your first asset.</Heading>
          <Content>Get started by uploading or importing some assets.</Content>
        </IllustratedMessage>
      )}>
      {[]}
    </CardView>
  )
};
