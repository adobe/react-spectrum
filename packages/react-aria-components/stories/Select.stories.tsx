/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button, Collection, Label, ListBox, ListLayout, OverlayArrow, Popover, Select, SelectValue, Virtualizer} from 'react-aria-components';
import {ComponentMeta, ComponentStoryFn, ComponentStoryObj} from '@storybook/react';
import {LoadingSpinner, MyListBoxItem} from './utils';
import React, {JSX} from 'react';
import styles from '../example/index.css';
import {UNSTABLE_ListBoxLoadingSentinel} from '../src/ListBox';
import {useAsyncList} from 'react-stately';

export default {
  title: 'React Aria Components',
  component: Select
} as ComponentMeta<typeof Select>;

export type SelectStory = ComponentStoryFn<typeof Select>;

export const SelectExample: SelectStory = () => (
  <Select data-testid="select-example" id="select-example-id">
    <Label style={{display: 'block'}}>Test</Label>
    <Button>
      <SelectValue />
      <span aria-hidden="true" style={{paddingLeft: 5}}>▼</span>
    </Button>
    <Popover>
      <OverlayArrow>
        <svg width={12} height={12}><path d="M0 0,L6 6,L12 0" /></svg>
      </OverlayArrow>
      <ListBox className={styles.menu}>
        <MyListBoxItem>Foo</MyListBoxItem>
        <MyListBoxItem>Bar</MyListBoxItem>
        <MyListBoxItem>Baz</MyListBoxItem>
        <MyListBoxItem href="http://google.com">Google</MyListBoxItem>
      </ListBox>
    </Popover>
  </Select>
);

export const SelectRenderProps: SelectStory = () => (
  <Select data-testid="select-render-props">
    {({isOpen}) => (
      <>
        <Label style={{display: 'block'}}>Test</Label>
        <Button>
          <SelectValue />
          <span aria-hidden="true" style={{paddingLeft: 5}}>{isOpen ? '▲' : '▼'}</span>
        </Button>
        <Popover>
          <ListBox className={styles.menu}>
            <MyListBoxItem>Foo</MyListBoxItem>
            <MyListBoxItem>Bar</MyListBoxItem>
            <MyListBoxItem>Baz</MyListBoxItem>
            <MyListBoxItem href="http://google.com">Google</MyListBoxItem>
          </ListBox>
        </Popover>
      </>
    )}
  </Select>
);

let manyItems = [...Array(100)].map((_, i) => ({id: i, name: `Item ${i}`}));

export const SelectManyItems: SelectStory = () => (
  <Select>
    <Label style={{display: 'block'}}>Test</Label>
    <Button>
      <SelectValue />
      <span aria-hidden="true" style={{paddingLeft: 5}}>▼</span>
    </Button>
    <Popover>
      <OverlayArrow>
        <svg width={12} height={12}><path d="M0 0,L6 6,L12 0" /></svg>
      </OverlayArrow>
      <ListBox items={manyItems} className={styles.menu}>
        {item => <MyListBoxItem>{item.name}</MyListBoxItem>}
      </ListBox>
    </Popover>
  </Select>
);

export const VirtualizedSelect: SelectStory = () => (
  <Select>
    <Label style={{display: 'block'}}>Test</Label>
    <Button>
      <SelectValue />
      <span aria-hidden="true" style={{paddingLeft: 5}}>▼</span>
    </Button>
    <Popover>
      <OverlayArrow>
        <svg width={12} height={12}><path d="M0 0,L6 6,L12 0" /></svg>
      </OverlayArrow>
      <Virtualizer layout={new ListLayout({rowHeight: 25})}>
        <ListBox items={manyItems} className={styles.menu}>
          {item => <MyListBoxItem>{item.name}</MyListBoxItem>}
        </ListBox>
      </Virtualizer>
    </Popover>
  </Select>
);

interface Character {
  name: string,
  height: number,
  mass: number,
  birth_year: number
}

const MyListBoxLoaderIndicator = (props) => {
  return (
    <UNSTABLE_ListBoxLoadingSentinel style={{height: 30, width: '100%'}} {...props}>
      <LoadingSpinner style={{height: 20, width: 20, transform: 'translate(-50%, -50%)'}} />
    </UNSTABLE_ListBoxLoadingSentinel>
  );
};

function AsyncVirtualizedCollectionRenderSelectRender(args: {delay: number}): JSX.Element {
  let list = useAsyncList<Character>({
    async load({signal, cursor}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      // Slow down load so progress circle can appear
      await new Promise(resolve => setTimeout(resolve, args.delay));
      let res = await fetch(cursor || 'https://swapi.py4e.com/api/people/?search=', {signal});
      let json = await res.json();
      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <Select>
      <Label style={{display: 'block'}}>Async Virtualized Collection render Select</Label>
      <Button style={{position: 'relative'}}>
        <SelectValue />
        {list.isLoading && <LoadingSpinner style={{right: '20px', left: 'unset', top: '0px', height: '100%', width: 20}} />}
        <span aria-hidden="true" style={{paddingLeft: 25}}>▼</span>
      </Button>
      <Virtualizer
        layout={ListLayout}
        layoutOptions={{
          rowHeight: 25,
          loaderHeight: 30
        }}>
        <Popover>
          <OverlayArrow>
            <svg width={12} height={12}><path d="M0 0,L6 6,L12 0" /></svg>
          </OverlayArrow>
          <ListBox className={styles.menu}>
            <Collection items={list.items}>
              {item => (
                <MyListBoxItem id={item.name}>{item.name}</MyListBoxItem>
              )}
            </Collection>
            <MyListBoxLoaderIndicator isLoading={list.loadingState === 'loadingMore'} onLoadMore={list.loadMore} />
          </ListBox>
        </Popover>
      </Virtualizer>
    </Select>
  );
};

export const AsyncVirtualizedCollectionRenderSelect: ComponentStoryObj<typeof AsyncVirtualizedCollectionRenderSelectRender> = {
  render: (args) => <AsyncVirtualizedCollectionRenderSelectRender {...args} />,
  args: {
    delay: 50
  }
};
