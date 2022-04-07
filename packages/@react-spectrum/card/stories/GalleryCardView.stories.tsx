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
  ControlledCards,
  CustomLayout,
  DisabledKeys,
  DynamicCards,
  EmptyWithHeightGrid,
  FalsyIds,
  FilteringGrid,
  IsLoadingHeightGrid,
  IsLoadingNoHeightGrid,
  LoadingMoreGrid,
  NoSelection,
  SingleSelection,
  StaticCards
} from './GridCardView.stories';
import {GalleryLayout} from '../';
import {GalleryLayoutOptions} from '../src/GalleryLayout';
import React from 'react';
import {Size} from '@react-stately/virtualizer';
import {SpectrumCardViewProps} from '@react-types/card';
import {Story} from '@storybook/react';
import {useCollator} from '@react-aria/i18n';
import {useMemo} from 'react';

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

const StoryFn = ({storyFn}) => storyFn();

export default {
  title: 'CardView/Gallery layout',
  decorators: [storyFn => <StoryFn storyFn={storyFn} />]
};

export const DefaultGalleryStatic = () => <StaticCards {...StaticCards.args} layout={GalleryLayout} />;
DefaultGalleryStatic.storyName = StaticCards.storyName;

export const FalsyIdGallery = () => <FalsyIds {...FalsyIds.args} layout={GalleryLayout} />;
FalsyIdGallery.storyName = FalsyIds.storyName;

export const DefaultGalleryNoThinImages = () => <DynamicCards {...DynamicCards.args} layout={GalleryLayout} items={itemsNoThinImages} />;
DefaultGalleryNoThinImages.storyName = 'dynamic cards, no thin images';

export const DefaultGalleryLowVariance = () => <DynamicCards {...DynamicCards.args} layout={GalleryLayout} items={itemsLowVariance} />;
DefaultGalleryLowVariance.storyName = 'dynamic cards, low variance in aspect ratios';

export const DefaultGallery = () => <DynamicCards {...DynamicCards.args} layout={GalleryLayout} />;
DefaultGallery.storyName = 'dynamic cards, high variance in aspect ratios';

export const DisabledKeysGallery = () => <DisabledKeys {...DisabledKeys.args} layout={GalleryLayout} items={itemsLowVariance} />;
DisabledKeysGallery.storyName = DisabledKeys.storyName;

export const NoSelectionGallery = () => <NoSelection {...NoSelection.args} layout={GalleryLayout} items={itemsLowVariance} />;
NoSelectionGallery.storyName = NoSelection.storyName;

export const SingleSelectionGallery = () => <SingleSelection {...SingleSelection.args} layout={GalleryLayout} items={itemsLowVariance} />;
SingleSelectionGallery.storyName = SingleSelection.storyName;

export const SelectedKeys = () => <ControlledCards {...ControlledCards.args} layout={GalleryLayout} items={itemsLowVariance} />;
SelectedKeys.storyName = ControlledCards.storyName;

export const IsLoadingNoHeightGallery = () => <IsLoadingNoHeightGrid {...IsLoadingNoHeightGrid.args} layout={GalleryLayout} />;
IsLoadingNoHeightGallery.storyName = IsLoadingNoHeightGrid.storyName;

export const IsLoadingHeightGallery = () => <IsLoadingHeightGrid {...IsLoadingHeightGrid.args} layout={GalleryLayout} />;
IsLoadingHeightGallery.storyName = IsLoadingHeightGrid.storyName;

export const LoadingMoreGallery = () => <LoadingMoreGrid {...LoadingMoreGrid.args} layout={GalleryLayout} />;
LoadingMoreGallery.storyName = LoadingMoreGrid.storyName;

export const FilteringGallery = () => <FilteringGrid {...FilteringGrid.args} layout={GalleryLayout} />;
FilteringGallery.storyName = FilteringGrid.storyName;

export const EmptyWithHeightGallery = () => <EmptyWithHeightGrid {...EmptyWithHeightGrid.args} layout={GalleryLayout} />;
EmptyWithHeightGallery.storyName = EmptyWithHeightGrid.storyName;

export const AsyncLoadingGallery = () => <AsyncLoading {...AsyncLoading.args} layout={GalleryLayout} />;
AsyncLoadingGallery.storyName = AsyncLoading.storyName;

const CustomLayoutTemplate = (): Story<SpectrumCardViewProps<object>> => (args) => <CustomGalleryLayout {...args} />;
export const CustomLayoutOptions = CustomLayoutTemplate().bind({});
CustomLayoutOptions.args = {
  'aria-label': 'Test CardView',
  selectionMode: 'multiple',
  items: itemsLowVariance,
  layoutOptions: {idealRowHeight: 400, itemSpacing: new Size(10, 10), itemPadding: 78, minItemSize: new Size(150, 400)}
};
CustomLayoutOptions.storyName = 'Custom layout options';

interface LayoutOptions {
  layoutOptions?: GalleryLayoutOptions
}

function CustomGalleryLayout(props: SpectrumCardViewProps<object> & LayoutOptions) {
  let {
    layoutOptions,
    ...otherProps
  } = props;
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let galleryLayout = useMemo(() => new GalleryLayout<object>({collator, ...layoutOptions}), [collator, layoutOptions]);

  return CustomLayout({...otherProps, layout: galleryLayout});
}
