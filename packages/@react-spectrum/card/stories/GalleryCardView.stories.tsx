// @ts-nocheck
/*
 * Copyright 2021 Adobe. All rights reserved.
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
  AsyncLoading,
  AsyncLoadingCardViewStory,
  CardViewIdKeysStory,
  ControlledCards,
  ControlledCardViewStory,
  CustomLayout,
  DisabledKeys,
  DynamicCards,
  DynamicCardViewStory,
  EmptyWithHeightGrid,
  FalsyIds,
  FilteringGrid,
  IsLoadingHeightGrid,
  LoadingMoreGrid,
  StaticCards,
  StaticCardViewStory
} from './GridCardView.stories';
import {CardView, GalleryLayout} from '../';
import {ComponentStoryObj} from '@storybook/react';
import {GalleryLayoutOptions} from '../src/GalleryLayout';
import React, {useMemo} from 'react';
import {Size} from '@react-stately/virtualizer';
import {SpectrumCardViewProps} from '@react-types/card';
import {useCollator} from '@react-aria/i18n';

let itemsLowVariance = [
  {width: 1001, height: 381, src: 'https://i.imgur.com/Z7AzH2c.jpg', id: 1, title: 'Bob 1'},
  {width: 640, height: 640, src: 'https://i.imgur.com/DhygPot.jpg', id: 2, title: 'Joe 1 really really really really long'},
  {width: 314, height: 1009, src: 'https://i.imgur.com/3lzeoK7.jpg', id: 3, title: 'Jane 1'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', id: 4, title: 'Bob 2'},
  {width: 640, height: 640, src: 'https://i.imgur.com/DhygPot.jpg', id: 5, title: 'Joe 2'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', id: 6, title: 'Jane 2'},
  {width: 1001, height: 381, src: 'https://i.imgur.com/Z7AzH2c.jpg', id: 7, title: 'Bob 3'},
  {width: 314, height: 1009, src: 'https://i.imgur.com/3lzeoK7.jpg', id: 8, title: 'Joe 3'},
  {width: 314, height: 1009, src: 'https://i.imgur.com/3lzeoK7.jpg', id: 9, title: 'Jane 3'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', id: 10, title: 'Bob 4'},
  {width: 314, height: 1009, src: 'https://i.imgur.com/3lzeoK7.jpg', id: 11, title: 'Joe 4'},
  {width: 1001, height: 381, src: 'https://i.imgur.com/Z7AzH2c.jpg', id: 12, title: 'Jane 4'},
  {width: 314, height: 1009, src: 'https://i.imgur.com/3lzeoK7.jpg', id: 13, title: 'Bob 5'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', id: 14, title: 'Joe 5'},
  {width: 314, height: 1009, src: 'https://i.imgur.com/3lzeoK7.jpg', id: 15, title: 'Jane 5'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', id: 16, title: 'Bob 6'},
  {width: 314, height: 1009, src: 'https://i.imgur.com/3lzeoK7.jpg', id: 17, title: 'Joe 6'},
  {width: 640, height: 640, src: 'https://i.imgur.com/DhygPot.jpg', id: 18, title: 'Jane 6'},
  {width: 314, height: 1009, src: 'https://i.imgur.com/3lzeoK7.jpg', id: 19, title: 'Bob 7'},
  {width: 1001, height: 381, src: 'https://i.imgur.com/Z7AzH2c.jpg', id: 20, title: 'Joe 7'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', id: 21, title: 'Jane 7'},
  {width: 314, height: 1009, src: 'https://i.imgur.com/3lzeoK7.jpg', id: 22, title: 'Bob 8'}
];

let itemsNoThinImages = [
  {width: 1001, height: 381, src: 'https://i.imgur.com/Z7AzH2c.jpg', id: 1, title: 'Bob 1'},
  {width: 640, height: 640, src: 'https://i.imgur.com/DhygPot.jpg', id: 2, title: 'Joe 1 really really really really long'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', id: 4, title: 'Jane 1'},
  {width: 640, height: 640, src: 'https://i.imgur.com/DhygPot.jpg', id: 5, title: 'Bob 2'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', id: 6, title: 'Joe 2'},
  {width: 1001, height: 381, src: 'https://i.imgur.com/Z7AzH2c.jpg', id: 7, title: 'Jane 2'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', id: 10, title: 'Bob 3'},
  {width: 1001, height: 381, src: 'https://i.imgur.com/Z7AzH2c.jpg', id: 12, title: 'Joe 3'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', id: 14, title: 'Jane 3'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', id: 16, title: 'Bob 4'},
  {width: 640, height: 640, src: 'https://i.imgur.com/DhygPot.jpg', id: 18, title: 'Joe 4'},
  {width: 1001, height: 381, src: 'https://i.imgur.com/Z7AzH2c.jpg', id: 20, title: 'Jane 4'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', id: 21, title: 'Bob 5'}
];

// TODO: accessibility failures regarding article element with role="gridcell", will need to double check when we pick CardView back up
export default {
  title: 'CardView/Gallery layout',
  component: CardView,
  args: {
    'aria-label': 'Test CardView'
  },
  argTypes: {
    layout: {
      table: {
        disable: true
      }
    },
    selectionMode: {
      control: 'radio',
      defaultValue: 'multiple',
      options: ['none', 'single', 'multiple']
    }
  }
};

export const DefaultGalleryStatic: StaticCardViewStory = {
  ...StaticCards,
  args: {
    ...StaticCards.args,
    layout: GalleryLayout
  }
};

export const FalsyIdGallery: CardViewIdKeysStory = {
  ...FalsyIds,
  args: {
    ...FalsyIds.args,
    layout: GalleryLayout
  }
};

export const DefaultGalleryNoThinImages: DynamicCardViewStory = {
  ...DynamicCards,
  args: {
    ...DynamicCards.args,
    layout: GalleryLayout,
    items: itemsNoThinImages
  },
  name: 'dynamic cards, no thin images'
};

export const DefaultGalleryLowVariance: DynamicCardViewStory = {
  ...DynamicCards,
  args: {
    ...DynamicCards.args,
    layout: GalleryLayout,
    items: itemsLowVariance
  },
  name: 'dynamic cards, low variance in aspect ratios'
};

export const DefaultGallery: DynamicCardViewStory = {
  ...DynamicCards,
  args: {
    ...DynamicCards.args,
    layout: GalleryLayout
  },
  name: 'dynamic cards, high variance in aspect ratios'
};

export const DisabledKeysGallery: DynamicCardViewStory = {
  ...DisabledKeys,
  args: {
    ...DisabledKeys.args,
    layout: GalleryLayout,
    items: itemsLowVariance
  }
};

export const SelectedKeys: ControlledCardViewStory = {
  ...ControlledCards,
  args: {
    ...ControlledCards.args,
    layout: GalleryLayout,
    items: itemsLowVariance
  }
};

export const IsLoadingHeightGallery: DynamicCardViewStory = {
  ...IsLoadingHeightGrid,
  args: {
    ...IsLoadingHeightGrid.args,
    layout: GalleryLayout
  }
};

export const LoadingMoreGallery: DynamicCardViewStory = {
  ...LoadingMoreGrid,
  args: {
    ...LoadingMoreGrid.args,
    layout: GalleryLayout
  }
};

export const FilteringGallery: DynamicCardViewStory = {
  ...FilteringGrid,
  args: {
    ...FilteringGrid.args,
    layout: GalleryLayout
  }
};

export const EmptyWithHeightGallery: DynamicCardViewStory = {
  ...EmptyWithHeightGrid,
  args: {
    ...EmptyWithHeightGrid.args,
    layout: GalleryLayout
  }
};

export const AsyncLoadingGallery: AsyncLoadingCardViewStory = {
  ...AsyncLoading,
  args: {
    ...AsyncLoading.args,
    layout: GalleryLayout
  }
};

export const CustomLayoutOptions: CustomGalleryLayoutStory = {
  render: (args) => <CustomGalleryLayout {...args} />,
  args: {
    selectionMode: 'multiple',
    items: itemsLowVariance,
    layoutOptions: {idealRowHeight: 400, itemSpacing: new Size(10, 10), itemPadding: 78, minItemSize: new Size(150, 400)}
  },
  name: 'Custom layout options'
};

interface LayoutOptions {
  layoutOptions?: GalleryLayoutOptions
}
type CustomGalleryLayoutStory = ComponentStoryObj<typeof CustomGalleryLayout>;
function CustomGalleryLayout(props: SpectrumCardViewProps<object> & LayoutOptions) {
  let {
    layoutOptions,
    ...otherProps
  } = props;
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let galleryLayout = useMemo(() => new GalleryLayout<object>({collator, ...layoutOptions}), [collator, layoutOptions]);

  return CustomLayout({...otherProps, layout: galleryLayout});
}
