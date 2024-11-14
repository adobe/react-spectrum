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

import {action} from '@storybook/addon-actions';
import {ActionButton} from '@react-spectrum/button';
import {Card, CardView, GridLayout} from '../';
import {ComponentStoryObj} from '@storybook/react';
import {Content, View} from '@react-spectrum/view';
import {Flex} from '@react-spectrum/layout';
import {getImageFullData} from './utils';
import {GridLayoutOptions} from '../src/GridLayout';
import {Heading, Text} from '@react-spectrum/text';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import {Image} from '@react-spectrum/image';
import {Key} from '@react-types/shared';
import {Link} from '@react-spectrum/link';
import React, {useMemo, useState} from 'react';
import {Size} from '@react-stately/virtualizer';
import {SpectrumCardViewProps} from '@react-types/card';
import {TextField} from '@react-spectrum/textfield';
import {useAsyncList} from '@react-stately/data';
import {useCollator} from '@react-aria/i18n';
import {useProvider} from '@react-spectrum/provider';

let items = [
  {width: 1001, height: 381, src: 'https://i.imgur.com/Z7AzH2c.jpg', title: 'Bob 1'},
  {width: 640, height: 640, src: 'https://i.imgur.com/DhygPot.jpg', title: 'Joe 1 really really really really really really really really really really really really long'},
  {width: 182, height: 1009, src: 'https://i.imgur.com/L7RTlvI.png', title: 'Jane 1'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', title: 'Bob 2'},
  {width: 640, height: 640, src: 'https://i.imgur.com/DhygPot.jpg', title: 'Joe 2'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', title: 'Jane 2'},
  {width: 1001, height: 381, src: 'https://i.imgur.com/Z7AzH2c.jpg', title: 'Bob 3'},
  {width: 182, height: 1009, src: 'https://i.imgur.com/L7RTlvI.png', title: 'Joe 3'},
  {width: 1215, height: 121, src: 'https://i.imgur.com/zzwWogn.jpg', title: 'Jane 3'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', title: 'Bob 4'},
  {width: 182, height: 1009, src: 'https://i.imgur.com/L7RTlvI.png', title: 'Joe 4'},
  {width: 1001, height: 381, src: 'https://i.imgur.com/Z7AzH2c.jpg', title: 'Jane 4'},
  {width: 182, height: 1009, src: 'https://i.imgur.com/L7RTlvI.png', title: 'Bob 5'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', title: 'Joe 5'},
  {width: 182, height: 1009, src: 'https://i.imgur.com/L7RTlvI.png', title: 'Jane 5'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', title: 'Bob 6'},
  {width: 1215, height: 121, src: 'https://i.imgur.com/zzwWogn.jpg', title: 'Joe 6'},
  {width: 640, height: 640, src: 'https://i.imgur.com/DhygPot.jpg', title: 'Jane 6'},
  {width: 182, height: 1009, src: 'https://i.imgur.com/L7RTlvI.png', title: 'Bob 7'},
  {width: 1001, height: 381, src: 'https://i.imgur.com/Z7AzH2c.jpg', title: 'Joe 7'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', title: 'Jane 7'},
  {width: 1215, height: 121, src: 'https://i.imgur.com/zzwWogn.jpg', title: 'Bob 8'}
];

export let falsyItems = [
  {id: 0, width: 1001, height: 381, src: 'https://i.imgur.com/Z7AzH2c.jpg', title: 'Bob 1'},
  {id: 1, width: 640, height: 640, src: 'https://i.imgur.com/DhygPot.jpg', title: 'Joe 1 really really really really really really really really really really really really long'},
  {id: 2, width: 182, height: 1009, src: 'https://i.imgur.com/L7RTlvI.png', title: 'Jane 1'}
];

function renderEmptyState() {
  return (
    <IllustratedMessage>
      <svg width="150" height="103" viewBox="0 0 150 103">
        <path d="M133.7,8.5h-118c-1.9,0-3.5,1.6-3.5,3.5v27c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V23.5h119V92c0,0.3-0.2,0.5-0.5,0.5h-118c-0.3,0-0.5-0.2-0.5-0.5V69c0-0.8-0.7-1.5-1.5-1.5s-1.5,0.7-1.5,1.5v23c0,1.9,1.6,3.5,3.5,3.5h118c1.9,0,3.5-1.6,3.5-3.5V12C137.2,10.1,135.6,8.5,133.7,8.5z M15.2,21.5V12c0-0.3,0.2-0.5,0.5-0.5h118c0.3,0,0.5,0.2,0.5,0.5v9.5H15.2z M32.6,16.5c0,0.6-0.4,1-1,1h-10c-0.6,0-1-0.4-1-1s0.4-1,1-1h10C32.2,15.5,32.6,15.9,32.6,16.5z M13.6,56.1l-8.6,8.5C4.8,65,4.4,65.1,4,65.1c-0.4,0-0.8-0.1-1.1-0.4c-0.6-0.6-0.6-1.5,0-2.1l8.6-8.5l-8.6-8.5c-0.6-0.6-0.6-1.5,0-2.1c0.6-0.6,1.5-0.6,2.1,0l8.6,8.5l8.6-8.5c0.6-0.6,1.5-0.6,2.1,0c0.6,0.6,0.6,1.5,0,2.1L15.8,54l8.6,8.5c0.6,0.6,0.6,1.5,0,2.1c-0.3,0.3-0.7,0.4-1.1,0.4c-0.4,0-0.8-0.1-1.1-0.4L13.6,56.1z" />
      </svg>
      <Heading>No results</Heading>
      <Content>No results found, press <Link onPress={action('linkPress')}>here</Link> for more info.</Content>
    </IllustratedMessage>
  );
}

// TODO: accessibility failures regarding article element with role="gridcell", will need to double check when we pick CardView back up
export default {
  title: 'CardView/Grid layout',
  component: CardView,
  excludeStories: ['NoCards', 'CustomLayout', 'falsyItems'],
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

let onSelectionChange = action('onSelectionChange');
let actions = {
  onSelectionChange: s => onSelectionChange([...s])
};

// TODO add stories for Layouts with non-default options passed in
export const DynamicCards: DynamicCardViewStory = {
  render: (args) => <DynamicCardView {...args} />,
  args: {
    items: items
  },
  name: 'default Grid layout with initialized layout'
};

export const StaticCards: StaticCardViewStory = {
  render: (args) => <StaticCardView {...args} />,
  name: 'static card'
};

export const DefaultGridConstructor: DynamicCardViewStory = {
  ...DynamicCards,
  args: {...DynamicCards.args, layout: GridLayout},
  name: 'default Grid layout w/ layout constructor'
};

export const HorizontalGrid: DynamicCardViewStory = {
  ...DynamicCards,
  args: {...DynamicCards.args, cardOrientation: 'horizontal'},
  name: 'Grid layout with horizontal cards, initialized layout'
};

export const HorizontalGridConstructor: DynamicCardViewStory = {
  ...DynamicCards,
  args: {...DynamicCards.args, cardOrientation: 'horizontal', layout: GridLayout},
  name: 'Grid layout with horizontal cards, layout constructor'
};

export const FalsyIds: CardViewIdKeysStory = {
  render: (args) => <CardViewIdKeys {...args} />,
  args: {
    items: falsyItems
  },
  name: 'falsy ids'
};

export const DisabledKeys: DynamicCardViewStory = {
  ...DynamicCards,
  args: {...DynamicCards.args, disabledKeys: ['Joe 2', 'Bob 4']},
  name: 'disabled keys, Joe2, Bob 4'
};

export const ControlledCards: ControlledCardViewStory = {
  render: (args) => <ControlledCardView {...args} />,
  args: {
    items: items
  },
  name: 'selected keys, controlled'
};

export const NoCards: NoItemCardViewStory = {
  render: (args) => <NoItemCardView {...args} />
};

export const IsLoadingHeightGrid: DynamicCardViewStory = {
  ...NoCards,
  args: {...NoCards.args, width: '800px', height: '800px', loadingState: 'loading'},
  name: 'loadingState = loading, set height'
};

export const LoadingMoreGrid: DynamicCardViewStory = {
  ...DynamicCards,
  args: {...DynamicCards.args, loadingState: 'loadingMore'},
  name: 'loadingState = loadingMore'
};

export const FilteringGrid: DynamicCardViewStory = {
  ...DynamicCards,
  args: {...DynamicCards.args, loadingState: 'filtering'},
  name: 'loadingState = filtering'
};

export const EmptyWithHeightGrid: DynamicCardViewStory = {
  ...NoCards,
  args: {...NoCards.args, width: '800px', height: '800px', renderEmptyState},
  name: 'empty, set height'
};

export const AsyncLoading: AsyncLoadingCardViewStory = {
  render: (args) => <AsyncLoadingCardView {...args} />,
  args: {
    items: items
  },
  name: 'Async loading'
};

export const CustomLayoutOptions: CustomLayoutStory = {
  render: (args) => <CustomLayout {...args} />,
  args: {
    items: items,
    layoutOptions: {maxColumns: 2, margin: 150, minSpace: new Size(10, 10), itemPadding: 400}
  },
  name: 'Custom layout options'
};

export type CardViewIdKeysStory = ComponentStoryObj<typeof CardViewIdKeys>;
function CardViewIdKeys(props: SpectrumCardViewProps<object>) {
  let {scale} = useProvider();
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let cardOrientation = props.cardOrientation || 'vertical';
  let gridLayout = useMemo(() =>
    new GridLayout({
      scale,
      collator,
      cardOrientation
    })
  , [collator, scale, cardOrientation]);
  let {
    layout = gridLayout,
    items,
    ...otherProps
  } = props;

  return (
    <div style={{width: '800px', resize: 'both', height: '90vh', overflow: 'auto'}}>
      <CardView {...actions} {...otherProps} items={items} layout={layout} width="100%" height="100%">
        {(item: any) => (
          <Card textValue={item.title} width={item.width} height={item.height}>
            <Image src={item.src} />
            <Heading>{item.title}</Heading>
            <Text slot="detail">PNG</Text>
            <Content>Very very very very very very very very very very very very very long description</Content>
          </Card>
        )}
      </CardView>
    </div>
  );
}

export type DynamicCardViewStory = ComponentStoryObj<typeof DynamicCardView>;
function DynamicCardView(props: SpectrumCardViewProps<object>) {
  let {scale} = useProvider();
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let cardOrientation = props.cardOrientation || 'vertical';
  let gridLayout = useMemo(() =>
    new GridLayout({
      scale,
      collator,
      cardOrientation
    })
  , [collator, scale, cardOrientation]);
  let {
    layout = gridLayout,
    ...otherProps
  } = props;

  let [value, setValue] = useState('');
  let [items, setItems] = useState(props.items as Array<object>);
  let removeItem = () => {
    let val = parseInt(value, 10);
    let newItems = items.slice(0, val).concat(items.slice(val + 1, items.length));
    setItems(newItems);
  };

  return (
    <div style={{width: '800px', resize: 'both', height: '90vh', overflow: 'auto'}}>
      <Flex direction="column" height="100%" width="100%" >
        <Flex direction="row" maxWidth="500px" alignItems="end">
          <TextField value={value} onChange={setValue} label="Nth item to remove" />
          <ActionButton onPress={removeItem}>Remove</ActionButton>
        </Flex>
        <CardView {...actions} {...otherProps} items={items} layout={layout} width="100%" height="100%">
          {(item: any) => (
            <Card key={item.title} textValue={item.title} width={item.width} height={item.height}>
              <Image src={item.src} />
              <Heading>{item.title}</Heading>
              <Text slot="detail">PNG</Text>
              <Content>Very very very very very very very very very very very very very long description</Content>
            </Card>
          )}
        </CardView>
      </Flex>
    </div>
  );
}

export type ControlledCardViewStory = ComponentStoryObj<typeof ControlledCardView>;
function ControlledCardView(props: SpectrumCardViewProps<object>) {
  let {scale} = useProvider();
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let cardOrientation = props.cardOrientation || 'vertical';
  let gridLayout = useMemo(() =>
    new GridLayout({
      scale,
      collator,
      cardOrientation
    })
  , [collator, scale, cardOrientation]);
  let {
    layout = gridLayout,
    ...otherProps
  } = props;

  let [value, setValue] = useState('');
  let [items, setItems] = useState(props.items as Array<object>);
  let [selectedKeys, setSelectedKeys] = useState('all' as 'all' | Iterable<Key>);

  let removeItem = () => {
    let val = parseInt(value, 10);
    let newItems = items.slice(0, val).concat(items.slice(val + 1, items.length));
    setItems(newItems);
  };

  return (
    <div style={{width: '800px', resize: 'both', height: '90vh', overflow: 'auto'}}>
      <Flex direction="column" width="100%" height="100%">
        <Flex direction="row" maxWidth="500px" alignItems="end">
          <TextField value={value} onChange={setValue} label="Nth item to remove" />
          <ActionButton onPress={removeItem}>Remove</ActionButton>
        </Flex>
        <CardView  {...actions} {...otherProps} selectedKeys={selectedKeys} onSelectionChange={setSelectedKeys} items={items} layout={layout} width="100%" height="100%">
          {(item: any) => (
            <Card key={item.title} textValue={item.title} width={item.width} height={item.height}>
              <Image src={item.src} />
              <Heading>{item.title}</Heading>
              <Text slot="detail">PNG</Text>
              <Content>Very very very very very very very very very very very very very long description</Content>
            </Card>
          )}
        </CardView>
      </Flex>
    </div>
  );
}

export type NoItemCardViewStory = ComponentStoryObj<typeof NoItemCardView>;
function NoItemCardView(props: SpectrumCardViewProps<object>) {
  let {scale} = useProvider();
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let cardOrientation = props.cardOrientation || 'vertical';
  let gridLayout = useMemo(() =>
    new GridLayout({
      scale,
      collator,
      cardOrientation
    })
  , [collator, scale, cardOrientation]);
  let {
    layout = gridLayout
  } = props;
  let [show, setShow] = useState(false);

  return (
    <>
      <ActionButton onPress={() => setShow(show => !show)}>Toggle items</ActionButton>
      <CardView {...props} items={show ? items : []} layout={layout} UNSAFE_style={{background: 'var(--spectrum-global-color-gray-300)'}}>
        {(item: any) => (
          <Card key={item.title} textValue={item.title} width={item.width} height={item.height}>
            <Image src={item.src} />
            <Heading>{item.title}</Heading>
            <Text slot="detail">PNG</Text>
            <Content>Very very very very very very very very very very very very very long description</Content>
          </Card>
        )}
      </CardView>
    </>
  );
}

export type StaticCardViewStory = ComponentStoryObj<typeof StaticCardView>;
function StaticCardView(props: SpectrumCardViewProps<object>) {
  let {scale} = useProvider();
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let cardOrientation = props.cardOrientation || 'vertical';
  let gridLayout = useMemo(() =>
    new GridLayout({
      scale,
      collator,
      cardOrientation
    })
  , [collator, scale, cardOrientation]);
  let {
    layout = gridLayout
  } = props;

  return (
    <div style={{width: '800px', resize: 'both', height: '90vh', overflow: 'auto'}}>
      {/* TODO fix typescript. it breaks if I remove the items here */}
      <CardView  {...actions} {...props} height="100%" width="100%" items={[{}]} layout={layout}>
        <Card key="Bob 1" width={1001} height={381} textValue="Bob 1">
          <Image src="https://i.imgur.com/Z7AzH2c.jpg" />
          <Heading>Bob 1</Heading>
          <Text slot="detail">PNG</Text>
          <Content>Very very very very very very very very very very very very very long description</Content>
        </Card>
        <Card key="Joe 1" width={640} height={640} textValue="Joe 1">
          <Image src="https://i.imgur.com/DhygPot.jpg" />
          <Heading>Joe 1</Heading>
          <Text slot="detail">PNG</Text>
        </Card>
        <Card key="Jane 1" width={182} height={1009} textValue="Jane 1">
          <Image src="https://i.imgur.com/L7RTlvI.png" />
          <Heading>Jane 1</Heading>
          <Text slot="detail">PNG</Text>
          <Content>Description</Content>
        </Card>
        <Card key="Bob 2" width={1516} height={1009} textValue="Bob 2">
          <Image src="https://i.imgur.com/1nScMIH.jpg" />
          <Heading>Bob 2</Heading>
          <Text slot="detail">PNG</Text>
          <Content>Very very very very very very very very very very very very very long description</Content>
        </Card>
        <Card key="Joe 2" width={640} height={640} textValue="Joe 2">
          <Image src="https://i.imgur.com/DhygPot.jpg" />
          <Heading>Joe 2</Heading>
          <Text slot="detail">PNG</Text>
          <Content>Description</Content>
        </Card>
      </CardView>
    </div>
  );
}

export type AsyncLoadingCardViewStory = ComponentStoryObj<typeof AsyncLoadingCardView>;
function AsyncLoadingCardView(props: SpectrumCardViewProps<object>) {
  interface StarWarsChar {
    name: string,
    url: string
  }

  let {scale} = useProvider();
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let cardOrientation = props.cardOrientation || 'vertical';
  let gridLayout = useMemo(() =>
    new GridLayout({
      scale,
      collator,
      cardOrientation
    })
  , [collator, scale, cardOrientation]);
  let {
    layout = gridLayout
  } = props;

  let list = useAsyncList<StarWarsChar>({
    async load({signal, cursor}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }
      let items = [];
      await new Promise(resolve => setTimeout(resolve, 1500));
      let res = await fetch(cursor || 'https://swapi.py4e.com/api/people/?search', {signal});
      let json = await res.json();
      items = json.results.map((element, index) => ({...getImageFullData(index), title: element.name}));

      return {
        items: items,
        cursor: json.next
      };
    }
  });

  return (
    <div style={{width: '800px', resize: 'both', height: '90vh', overflow: 'auto'}}>
      <CardView {...actions} {...props} height="100%" width="100%" items={list.items} onLoadMore={list.loadMore} loadingState={list.loadingState} layout={layout}>
        {(item: any) => (
          <Card key={item.title} textValue={item.title} width={item.width} height={item.height}>
            <Image src={item.src} />
            <Heading>{item.title}</Heading>
            <Text slot="detail">PNG</Text>
            <Content>Very very very very very very very very very very very very very long description</Content>
          </Card>
        )}
      </CardView>
    </div>
  );
}

interface LayoutOptions {
  layoutOptions?: GridLayoutOptions
}
export type CustomLayoutStory = ComponentStoryObj<typeof CustomLayout>;
export function CustomLayout(props: SpectrumCardViewProps<object> & LayoutOptions) {
  let {scale} = useProvider();
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let layoutOptions = props.layoutOptions;
  let cardOrientation = props.cardOrientation || 'vertical';
  let gridLayout = useMemo(() =>
    new GridLayout({
      scale,
      collator,
      cardOrientation,
      ...layoutOptions
    })
  , [collator, scale, layoutOptions, cardOrientation]);
  let {
    layout = gridLayout,
    ...otherProps
  } = props;

  let [value, setValue] = useState('');
  let [items, setItems] = useState(props.items as Array<object>);
  let removeItem = () => {
    let val = parseInt(value, 10);
    let newItems = items.slice(0, val).concat(items.slice(val + 1, items.length));
    setItems(newItems);
  };

  return (
    <div style={{width: '800px', resize: 'both', height: '90vh', overflow: 'auto'}}>
      <Flex direction="column" width="100%" height="100%">
        <Flex direction="row" maxWidth="500px" alignItems="end">
          <TextField value={value} onChange={setValue} label="Nth item to remove" />
          <ActionButton onPress={removeItem}>Remove</ActionButton>
        </Flex>
        <CardView {...actions} {...otherProps} items={items} layout={layout} width="100%" height="100%">
          {(item: any) => (
            <Card key={item.title} textValue={item.title} width={item.width} height={item.height}>
              <Image src={item.src} />
              <Heading>{item.title}</Heading>
              <Text slot="detail">PNG</Text>
              <Content>Very very very very very very very very very very very very very long description</Content>
            </Card>
          )}
        </CardView>
      </Flex>
    </div>
  );
}

export function ResizeObserverCrash() {
  const shots = [
    {id: 1, src: 'https://i.imgur.com/Z7AzH2c.jpg', alt: 'foo', label: 'foo'},
    {id: 2, src: 'https://i.imgur.com/Z7AzH2c.jpg', alt: 'bar', label: 'bar'},
    {id: 3, src: 'https://i.imgur.com/Z7AzH2c.jpg', alt: 'baz', label: 'baz'},
    {id: 4, src: 'https://i.imgur.com/Z7AzH2c.jpg', alt: 'qux', label: 'qux'},
    {id: 5, src: 'https://i.imgur.com/Z7AzH2c.jpg', alt: 'foobar', label: 'foobar'},
    {id: 6, src: 'https://i.imgur.com/Z7AzH2c.jpg', alt: 'foobaz', label: 'foobaz'}
  ];

  return (
    <View backgroundColor="gray-75" width="100vw" height="100vh">
      <div style={{position: 'relative', height: '100%', width: '100%'}}>
        <div
          style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
          <React.Fragment key="foo">
            <Flex alignItems="center" gap="size-200" margin="size-350">
              <Heading level={3} margin="size-0">
                My Demo Asset
              </Heading>
            </Flex>
            <CardView
              items={shots}
              width="100%"
              flex
              position="relative"
              layout={GridLayout}
              selectionMode="none">
              {(shot: any) => (
                <Card key={shot.id}>
                  <Flex
                    UNSAFE_style={{
                      position: 'absolute'
                    }}
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                    gap="size-150"
                    width="100%"
                    height="calc(100% - 78px)">
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      width="200px"
                      height="200px" />
                  </Flex>
                  <Flex
                    direction="column"
                    alignItems="start"
                    marginTop="size-100">
                    <Heading
                      level={4}
                      alignSelf="auto"
                      UNSAFE_style={{
                        fontWeight: 500
                      }}>
                      {shot.label}
                    </Heading>
                  </Flex>
                </Card>
              )}
            </CardView>
          </React.Fragment>
        </div>
      </div>
    </View>
  );
}
