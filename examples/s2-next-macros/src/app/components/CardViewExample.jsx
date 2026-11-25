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

import {
  ActionMenu,
  Avatar,
  Card,
  CardPreview,
  CardView,
  Collection,
  Content,
  Image,
  MenuItem,
  SkeletonCollection,
  Text
} from '@react-spectrum/s2';
import ErrorIcon from '@react-spectrum/s2/illustrations/linear/AlertNotice';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const cardViewStyles = style({
  width: 'full',
  maxWidth: '[800px]',
  height: '[800px]',
  margin: 32
});

const avatarSize = {
  XS: 16,
  S: 20,
  M: 24,
  L: 28,
  XL: 32
};

const AVATAR_URL = 'https://i.imgur.com/xIe7Wlb.png';

const photoItems = [
  {
    id: 'photo-1',
    description: 'Desert sand dunes at sunset',
    width: 600,
    height: 450,
    urls: {
      regular:
        'https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop'
    },
    user: {name: 'Devon Govett', profile_image: {small: AVATAR_URL}}
  },
  {
    id: 'photo-2',
    description: 'Misty mountain ridge',
    width: 600,
    height: 800,
    urls: {
      regular:
        'https://images.unsplash.com/photo-1722233987129-61dc344db8b6?q=80&w=600&auto=format&fit=crop'
    },
    user: {name: 'Rob Snow', profile_image: {small: AVATAR_URL}}
  },
  {
    id: 'photo-3',
    description: 'Sunlit forest canopy',
    width: 600,
    height: 400,
    urls: {
      regular:
        'https://images.unsplash.com/photo-1722172118908-1a97c312ce8c?q=80&w=600&auto=format&fit=crop'
    },
    user: {name: 'Daniel Lu', profile_image: {small: AVATAR_URL}}
  },
  {
    id: 'photo-4',
    description: 'Coastal cliffs overlooking ocean',
    width: 600,
    height: 750,
    urls: {
      regular:
        'https://images.unsplash.com/photo-1718378037953-ab21bf2cf771?q=80&w=600&auto=format&fit=crop'
    },
    user: {name: 'Reid Barber', profile_image: {small: AVATAR_URL}}
  },
  {
    id: 'photo-5',
    description: 'Alpine lake reflections',
    width: 600,
    height: 450,
    urls: {
      regular:
        'https://images.unsplash.com/photo-1721661657253-6621d52db753?q=80&w=600&auto=format&fit=crop'
    },
    user: {name: 'Kyle Tabor', profile_image: {small: AVATAR_URL}}
  },
  {
    id: 'photo-6',
    description: 'Golden hour valley vista',
    width: 600,
    height: 600,
    urls: {
      regular:
        'https://images.unsplash.com/photo-1721598359121-363311b3b263?q=80&w=600&auto=format&fit=crop'
    },
    user: {name: 'Danni Hickox', profile_image: {small: AVATAR_URL}}
  },
  {
    id: 'photo-7',
    description: 'Wildflowers in meadow',
    width: 600,
    height: 450,
    urls: {
      regular:
        'https://images.unsplash.com/photo-1720987517313-23d8c4092cfb?q=80&w=600&auto=format&fit=crop'
    },
    user: {name: 'Devon Govett', profile_image: {small: AVATAR_URL}}
  },
  {
    id: 'photo-8',
    description: 'Starry night sky over peaks',
    width: 600,
    height: 800,
    urls: {
      regular:
        'https://images.unsplash.com/photo-1671225137978-aa9a19071b9a?q=80&w=600&auto=format&fit=crop'
    },
    user: {name: 'Rob Snow', profile_image: {small: AVATAR_URL}}
  },
  {
    id: 'photo-9',
    description: 'Artisan cafe breakfast table',
    width: 600,
    height: 450,
    urls: {
      regular:
        'https://images.unsplash.com/photo-1460306855393-0410f61241c7?q=80&w=600&auto=format&fit=crop'
    },
    user: {name: 'Daniel Lu', profile_image: {small: AVATAR_URL}}
  }
];

function PhotoCard({item, layout}) {
  return (
    <Card id={item.id} textValue={item.description || item.alt_description}>
      {({size}) => (
        <>
          <CardPreview>
            <Image
              alt={item.description || item.alt_description}
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
                <div
                  className={style({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    size: 'full'
                  })}>
                  <ErrorIcon size="S" />
                </div>
              )}
            />
          </CardPreview>
          <Content>
            <Text slot="title">{item.description || item.alt_description}</Text>
            {size !== 'XS' && (
              <ActionMenu>
                <MenuItem>Test</MenuItem>
              </ActionMenu>
            )}
            <div
              className={style({
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                gridArea: 'description'
              })}>
              <Avatar src={item.user.profile_image.small} size={avatarSize[size]} />
              <Text slot="description">{item.user.name}</Text>
            </div>
          </Content>
        </>
      )}
    </Card>
  );
}

export const CardViewExample = props => {
  let loadingState = props.loadingState || 'idle';
  let items = loadingState === 'loading' ? [] : photoItems;

  return (
    <CardView
      aria-label="Nature photos"
      {...props}
      loadingState={loadingState}
      styles={cardViewStyles}>
      <Collection items={items} dependencies={[props.layout]}>
        {item => <PhotoCard item={item} layout={props.layout || 'grid'} />}
      </Collection>
      {(loadingState === 'loading' || loadingState === 'loadingMore') && (
        <SkeletonCollection>
          {() => (
            <PhotoCard
              item={{
                id: 'skeleton',
                user: {name: 'Devon Govett', profile_image: {small: ''}},
                urls: {regular: ''},
                description: 'This is a fake description. Kinda long so it wraps to a new line.',
                alt_description: '',
                width: 400,
                height: 300
              }}
              layout={props.layout || 'grid'}
            />
          )}
        </SkeletonCollection>
      )}
    </CardView>
  );
};
