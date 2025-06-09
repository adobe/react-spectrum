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

import {ActionMenu, Avatar, Card, CardPreview, CardView, CardViewProps, Collection, CollectionCardPreview, Content, Heading, IllustratedMessage, Image, MenuItem, SkeletonCollection, Text} from '../src';
import EmptyIcon from '../spectrum-illustrations/gradient/generic1/Image';
import ErrorIcon from '../spectrum-illustrations/linear/AlertNotice';
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import type {Meta} from '@storybook/react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {useAsyncList} from 'react-stately';

const meta: Meta<typeof CardView> = {
  component: CardView,
  parameters: {
    layout: 'fullscreen'
  },
  tags: ['autodocs']
};

export default meta;

const cardViewStyles = style({
  width: {
    default: 'screen',
    viewMode: {
      docs: 'full'
    }
  },
  height: {
    default: 'screen',
    viewMode: {
      docs: 600
    }
  }
});

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

const avatarSize = {
  XS: 16,
  S: 20,
  M: 24,
  L: 28,
  XL: 32
} as const;

function PhotoCard({item, layout}: {item: Item, layout: string}) {
  return (
    <Card id={item.id} textValue={item.description || item.alt_description}>
      {({size}) => (<>
        <CardPreview>
          <Image
            src={item.urls.regular}
            styles={style({
              width: 'full',
              pointerEvents: 'none'
            })}
            // TODO - should we have a safe `dynamicStyles` or something for this?
            UNSAFE_style={{
              aspectRatio: layout === 'waterfall' ? `${item.width} / ${item.height}` : '4/3',
              objectFit: layout === 'waterfall' ? 'contain' : 'cover'
            }}
            renderError={() => (
              <div className={style({display: 'flex', alignItems: 'center', justifyContent: 'center', size: 'full'})}>
                <ErrorIcon size="S" />
              </div>
            )} />
        </CardPreview>
        <Content>
          <Text slot="title">{item.description || item.alt_description}</Text>
          {size !== 'XS' && <ActionMenu>
            <MenuItem>Test</MenuItem>
          </ActionMenu>}
          <div className={style({display: 'flex', alignItems: 'center', gap: 8, gridArea: 'description'})}>
            <Avatar src={item.user.profile_image.small} size={avatarSize[size]} />
            <Text slot="description">{item.user.name}</Text>
          </div>
        </Content>
      </>)}
    </Card>
  );
}

export const Example = (args: CardViewProps<any>, {viewMode}) => {
  let list = useAsyncList<Item, number | null>({
    async load({signal, cursor, items}) {
      let page = cursor || 1;
      let res = await fetch(
        `https://api.unsplash.com/topics/nature/photos?page=${page}&per_page=30&client_id=AJuU-FPh11hn7RuumUllp4ppT8kgiLS7LtOHp_sp4nc`,
        {signal}
      );
      let nextItems = await res.json();
      // Filter duplicates which might be returned by the API.
      let existingKeys = new Set(items.map(i => i.id));
      nextItems = nextItems.filter(i => !existingKeys.has(i.id) && (i.description || i.alt_description));
      return {items: nextItems, cursor: nextItems.length ? page + 1 : null};
    }
  });

  let loadingState = args.loadingState === 'idle' ? list.loadingState : args.loadingState;
  let items = loadingState === 'loading' ? [] : list.items;

  return (
    <CardView
      aria-label="Nature photos"
      {...args}
      loadingState={loadingState}
      onLoadMore={args.loadingState === 'idle' ? list.loadMore : undefined}
      styles={cardViewStyles({viewMode})}>
      <Collection items={items} dependencies={[args.layout]}>
        {item => <PhotoCard item={item} layout={args.layout || 'grid'} />}
      </Collection>
      {(loadingState === 'loading' || loadingState === 'loadingMore') && (
        <SkeletonCollection>
          {() => (
            <PhotoCard
              item={{
                id: Math.random(),
                user: {name: 'Devon Govett', profile_image: {small: ''}},
                urls: {regular: ''},
                description: 'This is a fake description. Kinda long so it wraps to a new line.',
                alt_description: '',
                width: 400,
                height: 200 + Math.max(0, Math.round(Math.random() * 400))
              }}
              layout={args.layout || 'grid'} />
          )}
        </SkeletonCollection>
      )}
    </CardView>
  );
};

Example.args = {
  loadingState: 'idle',
  onAction: null,
  selectionMode: 'multiple'
};

export const Empty = (args: CardViewProps<any>, {viewMode}) => {
  return (
    <CardView
      aria-label="Assets"
      {...args}
      styles={cardViewStyles({viewMode})}
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

interface Topic {
  id: string,
  title: string,
  total_photos: number,
  links: {html: string},
  preview_photos: {id: string, urls: {small: string}}[]
}

function TopicCard({topic}: {topic: Topic}) {
  return (
    <Card href={topic.links.html} target="_blank" textValue={topic.title}>
      <CollectionCardPreview>
        {topic.preview_photos.slice(0, 4).map(photo => (
          <Image key={photo.id} alt="" src={photo.urls.small} />
        ))}
      </CollectionCardPreview>
      <Content>
        <Text slot="title">{topic.title}</Text>
        <div className={style({display: 'flex', alignItems: 'center', gap: 8})}>
          <Folder />
          <Text slot="description">{topic.total_photos.toLocaleString()} photos</Text>
        </div>
      </Content>
    </Card>
  );
}

export const CollectionCards = (args: CardViewProps<any>, {viewMode}) => {
  let list = useAsyncList<Topic, number | null>({
    async load({signal, cursor}) {
      let page = cursor || 1;
      let res = await fetch(
        `https://api.unsplash.com/topics?page=${page}&per_page=30&client_id=AJuU-FPh11hn7RuumUllp4ppT8kgiLS7LtOHp_sp4nc`,
        {signal}
      );
      let items = (await res.json()).filter((topic: Topic) => !!topic.preview_photos);
      return {items, cursor: items.length ? page + 1 : null};
    }
  });

  let loadingState = args.loadingState === 'idle' ? list.loadingState : args.loadingState;
  let items = loadingState === 'loading' ? [] : list.items;

  return (
    <CardView
      aria-label="Topics"
      {...args}
      loadingState={loadingState}
      onLoadMore={args.loadingState === 'idle' ? list.loadMore : undefined}
      styles={cardViewStyles({viewMode})}>
      <Collection items={items}>
        {topic => <TopicCard topic={topic} />}
      </Collection>
      {(loadingState === 'loading' || loadingState === 'loadingMore') && (
        <SkeletonCollection>
          {() => (
            <TopicCard
              topic={{
                id: Math.random().toString(36),
                title: 'Topic title',
                total_photos: 80,
                links: {html: ''},
                preview_photos: [
                  {id: 'a', urls: {small: ''}},
                  {id: 'b', urls: {small: ''}},
                  {id: 'c', urls: {small: ''}},
                  {id: 'd', urls: {small: ''}}
                ]
              }} />
          )}
        </SkeletonCollection>
      )}
    </CardView>
  );
};

CollectionCards.args = {
  loadingState: 'idle',
  onAction: null
};
