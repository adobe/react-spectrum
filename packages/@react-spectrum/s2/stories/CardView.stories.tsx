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

import {ActionMenu, Avatar, Content, Heading, IllustratedMessage, Image, MenuItem, Text} from '../src';
import {Card, CardPreview} from '../src/Card';
import {CardView, CardViewProps} from '../src/CardView';
import EmptyIcon from '../spectrum-illustrations/gradient/S2_fill_image_generic1_160.svg';
import ErrorIcon from '../s2wf-icons/S2_Icon_AlertTriangle_20_N.svg';
import type {Meta} from '@storybook/react';
import {Skeleton} from '../src/Skeleton';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {useAsyncList} from 'react-stately';

const meta: Meta<typeof CardView> = {
  component: CardView,
  parameters: {
    // layout: 'centered'
    layout: 'fullscreen'
  }
};

export default meta;

type Item = {
  id: number,
  user: {
    name: string,
    profile_image: { small: string }
  },
  urls: { regular: string },
  description: string,
  alt_description: string,
  width: number,
  height: number
};

let mockItems: Item[] = [];
for (let i = 0; i < 50; i++) {
  mockItems.push({
    id: i,
    user: {name: 'Devon Govett', profile_image: {small: ''}},
    urls: {regular: ''},
    description: 'This is a fake description. Kinda long so it wraps to a new line.',
    alt_description: '',
    width: 400,
    height: 200 + Math.max(0, Math.round(Math.random() * 400) - 200)
  });
}

function PhotoCard({item, layout}: {item: Item, layout: string}) {
  return (
    <Card id={item.id} textValue={item.description || item.alt_description}>
      <CardPreview>
        <Image 
          src={item.urls.regular}
          styles={style({
            width: 'full',
            pointerEvents: 'none'
          })}
          UNSAFE_style={{
            aspectRatio: layout === 'waterfall' ? `${item.width} / ${item.height}` : '4/3',
            objectFit: layout === 'waterfall' ? 'contain' : 'cover'
          }}
          renderError={() => (
            <div className={style({display: 'flex', alignItems: 'center', justifyContent: 'center', size: 'full'})}>
              <ErrorIcon />
            </div>
          )} />
      </CardPreview>
      <Content>
        <Text slot="title">{item.description || item.alt_description}</Text>
        <ActionMenu>
          <MenuItem>Test</MenuItem>
        </ActionMenu>
        <div className={style({display: 'flex', alignItems: 'center', gap: 8})}>
          <Avatar src={item.user.profile_image.small} />
          <Text slot="description">{item.user.name}</Text>
        </div>
      </Content>
    </Card>
  );
}

export const Example = (args: CardViewProps<any>) => {
  let list = useAsyncList<Item, number>({
    async load({signal, cursor}) {
      let page = cursor || 1;
      let res = await fetch(
        `https://api.unsplash.com/topics/nature/photos?page=${page}&per_page=30&client_id=AJuU-FPh11hn7RuumUllp4ppT8kgiLS7LtOHp_sp4nc`,
        {signal}
      );
      let items = await res.json();
      return {items, cursor: page + 1};
    }
  });

  let isLoading = args.isLoading || list.loadingState === 'loading';
  return (
    <Skeleton isLoading={isLoading}>
      <CardView
        aria-label="Assets"
        {...args}
        items={isLoading ? mockItems : list.items}
        isLoading={args.isLoading || list.isLoading}
        onLoadMore={list.loadMore}
        style={{height: '100vh', width: '100vw'}}
        dependencies={[args.layout]}>
        {item => <PhotoCard item={item} layout={args.layout} />}
      </CardView>
    </Skeleton>
  );
};

Example.args = {
  isLoading: false,
  onAction: null,
  selectionMode: 'multiple'
};

export const Empty = (args: CardViewProps<any>) => {
  return (
    <CardView 
      aria-label="Assets"
      {...args}
      style={{height: '100vh', width: '100vw'}}
      renderEmptyState={() => (
        <IllustratedMessage size="L">
          <EmptyIcon />
          <Heading>Create your first asset.</Heading>
          <Content>Get started by uploading or importing some assets.</Content>
        </IllustratedMessage>
      )}>
      {[]}
    </CardView>
  );
};
