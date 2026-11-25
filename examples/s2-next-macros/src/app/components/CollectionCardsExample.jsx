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
  Card,
  CardView,
  Collection,
  CollectionCardPreview,
  Content,
  Image,
  SkeletonCollection,
  Text
} from '@react-spectrum/s2';
import Folder from '@react-spectrum/s2/icons/Folder';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const cardViewStyles = style({
  width: 'full',
  maxWidth: '[800px]',
  height: '[800px]',
  margin: 32
});

const topicItems = [
  {
    id: 'topic-nature',
    title: 'Nature',
    total_photos: 1240,
    links: {html: 'https://unsplash.com/t/nature'},
    preview_photos: [
      {
        id: 'n1',
        urls: {
          small:
            'https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop'
        }
      },
      {
        id: 'n2',
        urls: {
          small:
            'https://images.unsplash.com/photo-1722233987129-61dc344db8b6?q=80&w=600&auto=format&fit=crop'
        }
      },
      {
        id: 'n3',
        urls: {
          small:
            'https://images.unsplash.com/photo-1722172118908-1a97c312ce8c?q=80&w=600&auto=format&fit=crop'
        }
      },
      {
        id: 'n4',
        urls: {
          small:
            'https://images.unsplash.com/photo-1718378037953-ab21bf2cf771?q=80&w=600&auto=format&fit=crop'
        }
      }
    ]
  },
  {
    id: 'topic-landscapes',
    title: 'Landscapes',
    total_photos: 865,
    links: {html: 'https://unsplash.com/t/wallpapers'},
    preview_photos: [
      {
        id: 'l1',
        urls: {
          small:
            'https://images.unsplash.com/photo-1721661657253-6621d52db753?q=80&w=600&auto=format&fit=crop'
        }
      },
      {
        id: 'l2',
        urls: {
          small:
            'https://images.unsplash.com/photo-1721598359121-363311b3b263?q=80&w=600&auto=format&fit=crop'
        }
      },
      {
        id: 'l3',
        urls: {
          small:
            'https://images.unsplash.com/photo-1720987517313-23d8c4092cfb?q=80&w=600&auto=format&fit=crop'
        }
      },
      {
        id: 'l4',
        urls: {
          small:
            'https://images.unsplash.com/photo-1671225137978-aa9a19071b9a?q=80&w=600&auto=format&fit=crop'
        }
      }
    ]
  },
  {
    id: 'topic-food',
    title: 'Food & Drink',
    total_photos: 420,
    links: {html: 'https://unsplash.com/t/food-drink'},
    preview_photos: [
      {
        id: 'f1',
        urls: {
          small:
            'https://images.unsplash.com/photo-1460306855393-0410f61241c7?q=80&w=600&auto=format&fit=crop'
        }
      },
      {
        id: 'f2',
        urls: {
          small:
            'https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop'
        }
      },
      {
        id: 'f3',
        urls: {
          small:
            'https://images.unsplash.com/photo-1721661657253-6621d52db753?q=80&w=600&auto=format&fit=crop'
        }
      },
      {
        id: 'f4',
        urls: {
          small:
            'https://images.unsplash.com/photo-1720987517313-23d8c4092cfb?q=80&w=600&auto=format&fit=crop'
        }
      }
    ]
  },
  {
    id: 'topic-travel',
    title: 'Travel',
    total_photos: 980,
    links: {html: 'https://unsplash.com/t/travel'},
    preview_photos: [
      {
        id: 't1',
        urls: {
          small:
            'https://images.unsplash.com/photo-1718378037953-ab21bf2cf771?q=80&w=600&auto=format&fit=crop'
        }
      },
      {
        id: 't2',
        urls: {
          small:
            'https://images.unsplash.com/photo-1671225137978-aa9a19071b9a?q=80&w=600&auto=format&fit=crop'
        }
      },
      {
        id: 't3',
        urls: {
          small:
            'https://images.unsplash.com/photo-1722233987129-61dc344db8b6?q=80&w=600&auto=format&fit=crop'
        }
      },
      {
        id: 't4',
        urls: {
          small:
            'https://images.unsplash.com/photo-1721598359121-363311b3b263?q=80&w=600&auto=format&fit=crop'
        }
      }
    ]
  }
];

function TopicCard({topic}) {
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

export const CollectionCardsExample = props => {
  let loadingState = props.loadingState || 'idle';
  let items = loadingState === 'loading' ? [] : topicItems;

  return (
    <CardView aria-label="Topics" {...props} loadingState={loadingState} styles={cardViewStyles}>
      <Collection items={items}>{topic => <TopicCard topic={topic} />}</Collection>
      {(loadingState === 'loading' || loadingState === 'loadingMore') && (
        <SkeletonCollection>
          {() => (
            <TopicCard
              topic={{
                id: 'skeleton',
                title: 'Topic title',
                total_photos: 80,
                links: {html: ''},
                preview_photos: [
                  {id: 'a', urls: {small: ''}},
                  {id: 'b', urls: {small: ''}},
                  {id: 'c', urls: {small: ''}},
                  {id: 'd', urls: {small: ''}}
                ]
              }}
            />
          )}
        </SkeletonCollection>
      )}
    </CardView>
  );
};
