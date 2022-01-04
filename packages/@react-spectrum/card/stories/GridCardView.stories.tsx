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
import {ActionButton, Button} from '@react-spectrum/button';
import {ActionMenu, Item} from '@react-spectrum/menu';
import {Card, CardView, GridLayout} from '../';
import {Content, Footer} from '@react-spectrum/view';
import {Flex} from '@react-spectrum/layout';
import {getImageFullData} from './utils';
import {GridLayoutOptions} from '../src/GridLayout';
import {Heading, Text} from '@react-spectrum/text';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import {Image} from '@react-spectrum/image';
import React, {Key, useMemo, useState} from 'react';
import {Size} from '@react-stately/virtualizer';
import {SpectrumCardViewProps} from '@react-types/card';
import {Story} from '@storybook/react';
import {TextField} from '@react-spectrum/textfield';
import {useAsyncList} from '@react-stately/data';
import {useCollator} from '@react-aria/i18n';
import {useProvider} from '@react-spectrum/provider';

let items = [
  {width: 1001, height: 381, src: 'https://i.imgur.com/Z7AzH2c.jpg', title: 'Bob 1'},
  {width: 640, height: 640, src: 'https://i.imgur.com/DhygPot.jpg', title: 'Joe 1'},
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

function renderEmptyState() {
  return (
    <IllustratedMessage>
      <svg width="150" height="103" viewBox="0 0 150 103">
        <path d="M133.7,8.5h-118c-1.9,0-3.5,1.6-3.5,3.5v27c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V23.5h119V92c0,0.3-0.2,0.5-0.5,0.5h-118c-0.3,0-0.5-0.2-0.5-0.5V69c0-0.8-0.7-1.5-1.5-1.5s-1.5,0.7-1.5,1.5v23c0,1.9,1.6,3.5,3.5,3.5h118c1.9,0,3.5-1.6,3.5-3.5V12C137.2,10.1,135.6,8.5,133.7,8.5z M15.2,21.5V12c0-0.3,0.2-0.5,0.5-0.5h118c0.3,0,0.5,0.2,0.5,0.5v9.5H15.2z M32.6,16.5c0,0.6-0.4,1-1,1h-10c-0.6,0-1-0.4-1-1s0.4-1,1-1h10C32.2,15.5,32.6,15.9,32.6,16.5z M13.6,56.1l-8.6,8.5C4.8,65,4.4,65.1,4,65.1c-0.4,0-0.8-0.1-1.1-0.4c-0.6-0.6-0.6-1.5,0-2.1l8.6-8.5l-8.6-8.5c-0.6-0.6-0.6-1.5,0-2.1c0.6-0.6,1.5-0.6,2.1,0l8.6,8.5l8.6-8.5c0.6-0.6,1.5-0.6,2.1,0c0.6,0.6,0.6,1.5,0,2.1L15.8,54l8.6,8.5c0.6,0.6,0.6,1.5,0,2.1c-0.3,0.3-0.7,0.4-1.1,0.4c-0.4,0-0.8-0.1-1.1-0.4L13.6,56.1z" />
      </svg>
      <Heading>No results</Heading>
      <Content>No results found</Content>
    </IllustratedMessage>
  );
}

const StoryFn = ({storyFn}) => storyFn();

export default {
  title: 'CardView/Grid layout',
  excludeStories: ['NoCards', 'CustomLayout'],
  decorators: [storyFn => <StoryFn storyFn={storyFn} />]
};

let onSelectionChange = action('onSelectionChange');
let actions = {
  onSelectionChange: s => onSelectionChange([...s])
};

// TODO add stories for Layouts with non-default options passed in
const DynamicTemplate = (): Story<SpectrumCardViewProps<object>> => (args) => <DynamicCardView {...args} />;
export const DynamicCards = DynamicTemplate().bind({});
DynamicCards.args = {
  items: items,
  'aria-label': 'Test CardView',
  selectionMode: 'multiple'
};
DynamicCards.storyName = 'default Grid layout with initialized layout';

const StaticTemplate = (): Story<SpectrumCardViewProps<object>> => (args) => <StaticCardView {...args} />;
export const StaticCards = StaticTemplate().bind({});
StaticCards.args = {
  'aria-label': 'Test CardView',
  selectionMode: 'multiple'
};
StaticCards.storyName = 'static card';

export const DefaultGridConstructor = DynamicTemplate().bind({});
DefaultGridConstructor.args = {...DynamicCards.args, layout: GridLayout};
DefaultGridConstructor.storyName = 'default Grid layout w/ layout constructor';

export const HorizontalGrid = DynamicTemplate().bind({});
HorizontalGrid.args = {...DynamicCards.args, cardOrientation: 'horizontal'};
HorizontalGrid.storyName = ' Grid layout with horizontal cards, initialized layout';

export const HorizontalGridConstructor = DynamicTemplate().bind({});
HorizontalGridConstructor.args = {...DynamicCards.args, cardOrientation: 'horizontal', layout: GridLayout};
HorizontalGridConstructor.storyName = ' Grid layout with horizontal cards, layout constructor';

export const DisabledKeys = DynamicTemplate().bind({});
DisabledKeys.args = {...DynamicCards.args, disabledKeys: ['Joe 2', 'Bob 4']};
DisabledKeys.storyName = 'disabled keys, Joe2, Bob 4';

export const NoSelection = DynamicTemplate().bind({});
NoSelection.args = {...DynamicCards.args, selectionMode: 'none'};
NoSelection.storyName = 'no selection allowed';

export const SingleSelection = DynamicTemplate().bind({});
SingleSelection.args = {...DynamicCards.args, selectionMode: 'single'};
SingleSelection.storyName = 'single selection only';

const ControlledTemplate = (): Story<SpectrumCardViewProps<object>> => (args) => <ControlledCardView {...args} />;
export const ControlledCards = ControlledTemplate().bind({});
ControlledCards.args = {
  'aria-label': 'Test CardView',
  selectionMode: 'multiple',
  items: items
};
ControlledCards.storyName = 'selected keys, controlled';

const NoCardsTemplate = (): Story<SpectrumCardViewProps<object>> => (args) => <NoItemCardView {...args} />;
export const NoCards = NoCardsTemplate().bind({});
NoCards.args = {
  'aria-label': 'Test CardView'
};

export const IsLoadingNoHeightGrid = NoCardsTemplate().bind({});
IsLoadingNoHeightGrid.args = {...NoCards.args, width: '800px', loadingState: 'loading'};
IsLoadingNoHeightGrid.storyName = 'loadingState = loading, no height';

export const IsLoadingHeightGrid =  NoCardsTemplate().bind({});
IsLoadingHeightGrid.args = {...NoCards.args, width: '800px', height: '800px', loadingState: 'loading'};
IsLoadingHeightGrid.storyName = 'loadingState = loading, set height';

export const LoadingMoreGrid = DynamicTemplate().bind({});
LoadingMoreGrid.args = {...DynamicCards.args, loadingState: 'loadingMore'};
LoadingMoreGrid.storyName = 'loadingState = loadingMore';

export const FilteringGrid = DynamicTemplate().bind({});
FilteringGrid.args = {...DynamicCards.args, loadingState: 'filtering'};
FilteringGrid.storyName = 'loadingState = filtering';

export const EmptyWithHeightGrid = NoCardsTemplate().bind({});
EmptyWithHeightGrid.args = {...NoCards.args, width: '800px', height: '800px', renderEmptyState};
EmptyWithHeightGrid.storyName = 'empty, set height';

const AsyncCardsTemplate = (): Story<SpectrumCardViewProps<object>> => (args) => <AsyncLoadingCardView {...args} />;
export const AsyncLoading = AsyncCardsTemplate().bind({});
AsyncLoading.args = {
  'aria-label': 'Test CardView',
  selectionMode: 'multiple',
  items: items
};
AsyncLoading.storyName = 'Async loading';

const CustomLayoutTemplate = (): Story<SpectrumCardViewProps<object>> => (args) => <CustomLayout {...args} />;
export const CustomLayoutOptions = CustomLayoutTemplate().bind({});
CustomLayoutOptions.args = {
  'aria-label': 'Test CardView',
  selectionMode: 'multiple',
  items: items,
  layoutOptions: {maxColumns: 2, margin: 150, minSpace: new Size(10, 10), itemPadding: 400}
};
CustomLayoutOptions.storyName = 'Custom layout options';

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
              <ActionMenu>
                <Item>Action 1</Item>
                <Item>Action 2</Item>
              </ActionMenu>
              <Footer>
                <Button variant="primary">Something</Button>
              </Footer>
            </Card>
          )}
        </CardView>
      </Flex>
    </div>
  );
}

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
              <ActionMenu>
                <Item>Action 1</Item>
                <Item>Action 2</Item>
              </ActionMenu>
              <Footer>
                <Button variant="primary">Something</Button>
              </Footer>
            </Card>
          )}
        </CardView>
      </Flex>
    </div>
  );
}

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
            <ActionMenu>
              <Item>Action 1</Item>
              <Item>Action 2</Item>
            </ActionMenu>
            <Footer>
              <Button variant="primary">Something</Button>
            </Footer>
          </Card>
        )}
      </CardView>
    </>
  );
}

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
          <ActionMenu>
            <Item>Action 1</Item>
            <Item>Action 2</Item>
          </ActionMenu>
          <Footer>
            <Button variant="primary">Something</Button>
          </Footer>
        </Card>
        <Card key="Joe 1" width={640} height={640} textValue="Joe 1">
          <Image src="https://i.imgur.com/DhygPot.jpg" />
          <Heading>Joe 1</Heading>
          <Text slot="detail">PNG</Text>
          <ActionMenu>
            <Item>Action 1</Item>
            <Item>Action 2</Item>
          </ActionMenu>
        </Card>
        <Card key="Jane 1" width={182} height={1009} textValue="Jane 1">
          <Image src="https://i.imgur.com/L7RTlvI.png" />
          <Heading>Jane 1</Heading>
          <Text slot="detail">PNG</Text>
          <Content>Description</Content>
          <Footer>
            <Button variant="primary">Something</Button>
          </Footer>
        </Card>
        <Card key="Bob 2" width={1516} height={1009} textValue="Bob 2">
          <Image src="https://i.imgur.com/1nScMIH.jpg" />
          <Heading>Bob 2</Heading>
          <Text slot="detail">PNG</Text>
          <Content>Very very very very very very very very very very very very very long description</Content>
          <ActionMenu>
            <Item>Action 1</Item>
            <Item>Action 2</Item>
          </ActionMenu>
        </Card>
        <Card key="Joe 2" width={640} height={640} textValue="Joe 2">
          <Image src="https://i.imgur.com/DhygPot.jpg" />
          <Heading>Joe 2</Heading>
          <Text slot="detail">PNG</Text>
          <Content>Description</Content>
          <ActionMenu>
            <Item>Action 1</Item>
            <Item>Action 2</Item>
          </ActionMenu>
          <Footer>
            <Button variant="primary">Something</Button>
          </Footer>
        </Card>
      </CardView>
    </div>
  );
}

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
            <ActionMenu>
              <Item>Action 1</Item>
              <Item>Action 2</Item>
            </ActionMenu>
            <Footer>
              <Button variant="primary">Something</Button>
            </Footer>
          </Card>
        )}
      </CardView>
    </div>
  );
}

interface LayoutOptions {
  layoutOptions?: GridLayoutOptions
}

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
              <ActionMenu>
                <Item>Action 1</Item>
                <Item>Action 2</Item>
              </ActionMenu>
              <Footer>
                <Button variant="primary">Something</Button>
              </Footer>
            </Card>
          )}
        </CardView>
      </Flex>
    </div>
  );
}
