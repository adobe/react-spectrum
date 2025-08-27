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
import {CardView, WaterfallLayout} from '../';
import {ComponentStoryObj} from '@storybook/react';
import React, {useMemo} from 'react';
import {Size} from '@react-stately/virtualizer';
import {SpectrumCardViewProps} from '@react-types/card';
import {useCollator} from '@react-aria/i18n';
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

// TODO: accessibility failures regarding article element with role="gridcell", will need to double check when we pick CardView back up
export default {
  title: 'CardView/Waterfall layout',
  component: CardView,
  parameters: {
    chromatic: {
      delay: 300
    }
  },
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
} as ComponentStoryObj<typeof CardView>;

export const DefaultWaterfallStatic: StaticCardViewStory = {
  ...StaticCards,
  args: {
    ...StaticCards.args,
    layout: WaterfallLayout
  }
};

export const FalsyIdWaterfall: CardViewIdKeysStory = {
  ...FalsyIds,
  args: {
    ...FalsyIds.args,
    layout: WaterfallLayout
  }
};

export const DefaultWaterfall: DynamicCardViewStory = {
  ...DynamicCards,
  args: {
    ...DynamicCards.args,
    layout: WaterfallLayout
  },
  name: 'size provided with items'
};

export const DefaultWaterfallNoSize: DynamicCardViewStory = {
  ...DynamicCards,
  args: {
    ...DynamicCards.args,
    layout: WaterfallLayout,
    items: itemsNoSize
  },
  name: 'no size provided with items'
};

export const QuietWaterfall: DynamicCardViewStory = {
  ...DynamicCards,
  args: {
    ...DynamicCards.args,
    layout: WaterfallLayout,
    isQuiet: true
  },
  name: 'quiet cards'
};

export const QuietWaterfallNoSize: DynamicCardViewStory = {
  ...DynamicCards,
  args: {
    ...DynamicCards.args,
    layout: WaterfallLayout,
    isQuiet: true,
    items: itemsNoSize
  },
  name: 'quiet cards, no size provided with items'
};

export const DisabledKeysWaterfall: DynamicCardViewStory = {
  ...DisabledKeys,
  args: {
    ...DisabledKeys.args,
    layout: WaterfallLayout
  }
};

export const SelectedKeys: ControlledCardViewStory = {
  ...ControlledCards,
  args: {
    ...ControlledCards.args,
    layout: WaterfallLayout
  }
};

export const IsLoadingHeightWaterfall: DynamicCardViewStory = {
  ...IsLoadingHeightGrid,
  args: {
    ...IsLoadingHeightGrid.args,
    layout: WaterfallLayout
  }
};

export const LoadingMoreWaterfall: DynamicCardViewStory = {
  ...LoadingMoreGrid,
  args: {
    ...LoadingMoreGrid.args,
    layout: WaterfallLayout
  }
};

export const FilteringWaterfall: DynamicCardViewStory = {
  ...FilteringGrid,
  args: {
    ...FilteringGrid.args,
    layout: WaterfallLayout
  }
};

export const EmptyWithHeightWaterfall: DynamicCardViewStory = {
  ...EmptyWithHeightGrid,
  args: {
    ...EmptyWithHeightGrid.args,
    layout: WaterfallLayout
  }
};

export const AsyncLoadingWaterfall: AsyncLoadingCardViewStory = {
  ...AsyncLoading,
  args: {
    ...AsyncLoading.args,
    layout: WaterfallLayout
  }
};

export const CustomLayoutOptions: CustomWaterfallLayoutStory = {
  render: (args) => <CustomWaterfallLayout {...args} />,
  args: {
    selectionMode: 'multiple',
    items: itemsNoSize,
    layoutOptions: {minSpace: new Size(50, 50), maxColumns: 2, margin: 10}
  },
  name: 'Custom layout options'
};

interface LayoutOptions {
  layoutOptions?: WaterfallLayoutOptions
}

type CustomWaterfallLayoutStory = ComponentStoryObj<typeof CustomWaterfallLayout>;
function CustomWaterfallLayout(props: SpectrumCardViewProps<object> & LayoutOptions) {
  let {
    layoutOptions,
    ...otherProps
  } = props;
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let galleryLayout = useMemo(() => new WaterfallLayout<object>({collator, ...layoutOptions}), [collator, layoutOptions]);

  return CustomLayout({...otherProps, layout: galleryLayout});
}
