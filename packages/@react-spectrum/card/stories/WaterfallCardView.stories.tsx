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
import React from 'react';
import {Size} from '@react-stately/virtualizer';
import {SpectrumCardViewProps} from '@react-types/card';
import {Story} from '@storybook/react';
import {useCollator} from '@react-aria/i18n';
import {useMemo} from 'react';
import {WaterfallLayout} from '../';
import {WaterfallLayoutOptions} from '../src/WaterfallLayout';

let itemsNoSize = [
  {src: 'https://i.imgur.com/Z7AzH2c.jpg', title: 'Bob 1'},
  {src: 'https://i.imgur.com/DhygPot.jpg', title: 'Joe 1 really really really really really really really really really really really really long'},
  {src: 'https://i.imgur.com/L7RTlvI.png', title: 'Jane 1'},
  {src: 'https://i.imgur.com/1nScMIH.jpg', title: 'Bob 2'},
  {src: 'https://i.imgur.com/DhygPot.jpg', title: 'Joe 2'},
  {src: 'https://i.imgur.com/1nScMIH.jpg', title: 'Jane 2'},
  {src: 'https://i.imgur.com/Z7AzH2c.jpg', title: 'Bob 3'},
  {src: 'https://i.imgur.com/L7RTlvI.png', title: 'Joe 3'},
  {src: 'https://i.imgur.com/zzwWogn.jpg', title: 'Jane 3'},
  {src: 'https://i.imgur.com/1nScMIH.jpg', title: 'Bob 4'},
  {src: 'https://i.imgur.com/L7RTlvI.png', title: 'Joe 4'},
  {src: 'https://i.imgur.com/Z7AzH2c.jpg', title: 'Jane 4'},
  {src: 'https://i.imgur.com/L7RTlvI.png', title: 'Bob 5'},
  {src: 'https://i.imgur.com/1nScMIH.jpg', title: 'Joe 5'},
  {src: 'https://i.imgur.com/L7RTlvI.png', title: 'Jane 5'},
  {src: 'https://i.imgur.com/1nScMIH.jpg', title: 'Bob 6'},
  {src: 'https://i.imgur.com/zzwWogn.jpg', title: 'Joe 6'},
  {src: 'https://i.imgur.com/DhygPot.jpg', title: 'Jane 6'},
  {src: 'https://i.imgur.com/L7RTlvI.png', title: 'Bob 7'},
  {src: 'https://i.imgur.com/Z7AzH2c.jpg', title: 'Joe 7'},
  {src: 'https://i.imgur.com/1nScMIH.jpg', title: 'Jane 7'},
  {src: 'https://i.imgur.com/zzwWogn.jpg', title: 'Bob 8'}
];

const StoryFn = ({storyFn}) => storyFn();

export default {
  title: 'CardView/Waterfall layout',
  decorators: [storyFn => <StoryFn storyFn={storyFn} />]
};

export const DefaultWaterfallStatic = () => <StaticCards {...StaticCards.args} layout={WaterfallLayout} />;
DefaultWaterfallStatic.storyName = StaticCards.storyName;

export const FalsyIdWaterfall = () => <FalsyIds {...FalsyIds.args} layout={WaterfallLayout} />;
FalsyIdWaterfall.storyName = FalsyIds.storyName;

export const DefaultWaterfall = () => <DynamicCards {...DynamicCards.args} layout={WaterfallLayout} />;
DefaultWaterfall.storyName = 'size provided with items';

export const DefaultWaterfallNoSize = () => <DynamicCards {...DynamicCards.args} layout={WaterfallLayout} items={itemsNoSize} />;
DefaultWaterfallNoSize.storyName = 'no size provided with items';

export const QuietWaterfall = () => <DynamicCards {...DynamicCards.args} layout={WaterfallLayout} isQuiet />;
QuietWaterfall.storyName = 'quiet cards';

export const QuietWaterfallNoSize = () => <DynamicCards {...DynamicCards.args} layout={WaterfallLayout} items={itemsNoSize} isQuiet />;
QuietWaterfallNoSize.storyName = 'quiet cards, no size provided with items';

export const DisabledKeysWaterfall = () => <DisabledKeys {...DisabledKeys.args} layout={WaterfallLayout} />;
DisabledKeysWaterfall.storyName = DisabledKeys.storyName;

export const NoSelectionWaterfall = () => <NoSelection {...NoSelection.args} />;
NoSelectionWaterfall.storyName = NoSelection.storyName;

export const SingleSelectionWaterfall = () => <SingleSelection {...SingleSelection.args} layout={WaterfallLayout} />;
SingleSelectionWaterfall.storyName = SingleSelection.storyName;

export const SelectedKeys = () => <ControlledCards {...ControlledCards.args} layout={WaterfallLayout} />;
SelectedKeys.storyName = ControlledCards.storyName;

export const IsLoadingNoHeightWaterfall = () => <IsLoadingNoHeightGrid {...IsLoadingNoHeightGrid.args} layout={WaterfallLayout} />;
IsLoadingNoHeightWaterfall.storyName = IsLoadingNoHeightGrid.storyName;

export const IsLoadingHeightWaterfall = () => <IsLoadingHeightGrid {...IsLoadingHeightGrid.args} layout={WaterfallLayout} />;
IsLoadingHeightWaterfall.storyName = IsLoadingHeightGrid.storyName;

export const LoadingMoreWaterfall = () => <LoadingMoreGrid {...LoadingMoreGrid.args} layout={WaterfallLayout} />;
LoadingMoreWaterfall.storyName = LoadingMoreGrid.storyName;

export const FilteringWaterfall = () => <FilteringGrid {...FilteringGrid.args} layout={WaterfallLayout} />;
FilteringWaterfall.storyName = FilteringGrid.storyName;

export const EmptyWithHeightWaterfall = () => <EmptyWithHeightGrid {...EmptyWithHeightGrid.args} layout={WaterfallLayout} />;
EmptyWithHeightWaterfall.storyName = EmptyWithHeightGrid.storyName;

export const AsyncLoadingWaterfall = () => <AsyncLoading {...AsyncLoading.args} layout={WaterfallLayout} />;
AsyncLoadingWaterfall.storyName = AsyncLoading.storyName;

const CustomLayoutTemplate = (): Story<SpectrumCardViewProps<object>> => (args) => <CustomGalleryLayout {...args} />;
export const CustomLayoutOptions = CustomLayoutTemplate().bind({});
CustomLayoutOptions.args = {
  'aria-label': 'Test CardView',
  selectionMode: 'multiple',
  items: itemsNoSize,
  layoutOptions: {minSpace: new Size(50, 50), maxColumns: 2, margin: 10}
};
CustomLayoutOptions.storyName = 'Custom layout options';

interface LayoutOptions {
  layoutOptions?: WaterfallLayoutOptions
}

function CustomGalleryLayout(props: SpectrumCardViewProps<object> & LayoutOptions) {
  let {
    layoutOptions,
    ...otherProps
  } = props;
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let galleryLayout = useMemo(() => new WaterfallLayout<object>({collator, ...layoutOptions}), [collator, layoutOptions]);

  return CustomLayout({...otherProps, layout: galleryLayout});
}
