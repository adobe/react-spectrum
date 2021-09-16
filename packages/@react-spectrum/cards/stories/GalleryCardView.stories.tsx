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

import {AsyncLoadingCardView, ControlledCardView, CustomLayout, DynamicCardView, items, NoItemCardView, renderEmptyState, StaticCardView} from './GridCardView.stories';
import {GalleryLayout} from '../';
import React from 'react';
import {Size} from '@react-stately/virtualizer';
import {useCollator} from '@react-aria/i18n';
import {useMemo} from 'react';

let itemsLowVariance = [
  {width: 1001, height: 381, src: 'https://i.imgur.com/Z7AzH2c.jpg', id: 1, title: 'Bob 1'},
  {width: 640, height: 640, src: 'https://i.imgur.com/DhygPot.jpg', id: 2, title: 'Joe 1'},
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
  {width: 640, height: 640, src: 'https://i.imgur.com/DhygPot.jpg', id: 2, title: 'Joe 1'},
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

const StoryFn = ({storyFn}) => storyFn();

export default {
  title: 'CardView/Gallery layout',
  decorators: [storyFn => <StoryFn storyFn={storyFn} />]
};

export const DefaultGalleryStatic = () => StaticCardView({layout: GalleryLayout, items});
DefaultGalleryStatic.storyName = 'static card';

export const DefaultGalleryNoThinImages = () => DynamicCardView({layout: GalleryLayout, items: itemsNoThinImages});
DefaultGalleryNoThinImages.storyName = 'dynamic cards, no thin images';

export const DefaultGalleryLowVariance = () => DynamicCardView({layout: GalleryLayout, items: itemsLowVariance});
DefaultGalleryLowVariance.storyName = 'dynamic cards, low variance in aspect ratios';

export const DefaultGallery = () => DynamicCardView({layout: GalleryLayout, items});
DefaultGallery.storyName = 'dynamic cards, high variance in aspect ratios';

export const DisabledKeys = () => DynamicCardView({layout: GalleryLayout, items: itemsLowVariance, disabledKeys: ['Joe 2', 'Bob 4']});
DisabledKeys.storyName = 'disabled keys, Joe2, Bob 4';

export const NoSelection = () => DynamicCardView({layout: GalleryLayout, items: itemsLowVariance, selectionMode: 'none'});
NoSelection.storyName = 'no selection allowed';

export const SingleSelection = () => DynamicCardView({layout: GalleryLayout, items: itemsLowVariance, selectionMode: 'single'});
SingleSelection.storyName = 'single selection only';

export const SelectedKeys = () => ControlledCardView({layout: GalleryLayout, items: itemsLowVariance});
SelectedKeys.storyName = 'selected keys, controlled';

export const isLoadingNoHeightGallery = () => NoItemCardView({layout: GalleryLayout, width: '800px', loadingState: 'loading'});
isLoadingNoHeightGallery.storyName = 'loadingState = loading, no height';

export const isLoadingHeightGallery = () => NoItemCardView({layout: GalleryLayout, width: '800px', height: '800px', loadingState: 'loading'});
isLoadingHeightGallery.storyName = 'loadingState = loading, set height';

export const loadingMoreGallery = () => DynamicCardView({layout: GalleryLayout, loadingState: 'loadingMore', items});
loadingMoreGallery.storyName = 'loadingState = loadingMore';

export const filteringGallery = () => DynamicCardView({layout: GalleryLayout, loadingState: 'filtering', items});
filteringGallery.storyName = 'loadingState = filtering';

export const emptyWithHeightGallery = () => NoItemCardView({layout: GalleryLayout, width: '800px', height: '800px', renderEmptyState});
emptyWithHeightGallery.storyName = 'empty, set height';

export const AsyncLoading = () => AsyncLoadingCardView({layout: GalleryLayout});
AsyncLoading.storyName = 'Async loading';

export const CustomLayoutOptions = () => CustomGalleryLayout({items: itemsLowVariance}, {idealRowHeight: 400, itemSpacing: new Size(10, 10), itemPadding: 114, minItemSize: new Size(150, 400)});
CustomGalleryLayout.storyName = 'Custom layout options';

function CustomGalleryLayout(props, layoutOptions) {
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let galleryLayout = useMemo(() => new GalleryLayout({collator, ...layoutOptions}), [collator, layoutOptions]);

  return CustomLayout({...props, layout: galleryLayout}, {});
}
