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

import {CardView} from '../src/CardView';

import {Content, Heading} from '../src/Content';
import EmptyIcon from '../spectrum-illustrations/gradient/generic1/Image';
import {IllustratedMessage} from '../src/IllustratedMessage';
import type {Meta, StoryObj} from '@storybook/react';
import {PhotoCard} from '../stories/CardView.stories';
import {SkeletonCollection} from '../src/SkeletonCollection';
import {StaticMatrix, StaticMatrixCell} from './utils';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof CardView> = {
  component: CardView,
  parameters: {
    layout: 'fullscreen',
    chromaticProvider: {disableAnimations: true},
    chromatic: {prefersReducedMotion: 'reduce'}
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
  render: args => (
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

export const Loading: StoryObj<typeof CardView> = {
  render: args => (
    <CardView
      aria-label="Assets"
      loadingState="loading"
      styles={cardViewStyles}
      renderEmptyState={() => (
        <IllustratedMessage size="L">
          <EmptyIcon />
          <Heading>Create your first asset.</Heading>
          <Content>Get started by uploading or importing some assets.</Content>
        </IllustratedMessage>
      )}
      {...args}>
      <SkeletonCollection>
        {() => (
          <PhotoCard
            layout="grid"
            item={{
              id: Math.random(),
              user: {name: 'Devon Govett', profile_image: {small: ''}},
              urls: {regular: ''},
              description: 'This is a fake description. Kinda long so it wraps to a new line.',
              alt_description: '',
              width: 400,
              height: 200 + Math.max(0, Math.round(Math.random() * 400))
            }}
          />
        )}
      </SkeletonCollection>
    </CardView>
  )
};

const preview = new URL('assets/preview.png', import.meta.url).toString();
const cardItems = Array.from({length: 6}, (_, index) => ({
  id: index + 1,
  user: {name: `Owner ${index + 1}`, profile_image: {small: preview}},
  urls: {regular: preview},
  description: `Asset ${index + 1}`,
  alt_description: '',
  width: 400,
  height: index % 2 ? 520 : 300
}));
const cardViewConfigs = [
  {size: 'XS', density: 'compact', variant: 'primary', layout: 'grid', selectionStyle: 'checkbox'},
  {
    size: 'S',
    density: 'regular',
    variant: 'secondary',
    layout: 'waterfall',
    selectionStyle: 'highlight'
  },
  {size: 'M', density: 'spacious', variant: 'tertiary', layout: 'grid', selectionStyle: 'checkbox'},
  {
    size: 'L',
    density: 'compact',
    variant: 'quiet',
    layout: 'waterfall',
    selectionStyle: 'highlight'
  },
  {size: 'XL', density: 'regular', variant: 'primary', layout: 'grid', selectionStyle: 'highlight'}
] as const;

export const PopulatedStaticOptions: StoryObj<typeof CardView> = {
  render: () => (
    <StaticMatrix minColumnWidth={720}>
      {cardViewConfigs.map(config => (
        <StaticMatrixCell
          key={Object.values(config).join('-')}
          label={Object.values(config).join(' ')}>
          <CardView
            aria-label="Assets"
            {...config}
            selectionMode="multiple"
            defaultSelectedKeys={[1, 3]}
            styles={style({width: 680, height: 520})}>
            {cardItems.map(item => (
              <PhotoCard key={item.id} item={item} layout={config.layout} />
            ))}
          </CardView>
        </StaticMatrixCell>
      ))}
    </StaticMatrix>
  )
};
