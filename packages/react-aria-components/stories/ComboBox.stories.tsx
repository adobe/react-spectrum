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

import {Button, Collection, ComboBox, ComboBoxProps, Input, Label, ListBox, ListLayout, Popover, useFilter, Virtualizer} from 'react-aria-components';
import {ListBoxLoadMoreItem} from '../src/ListBox';
import {LoadingSpinner, MyListBoxItem} from './utils';
import {Meta, StoryFn, StoryObj} from '@storybook/react';
import React, {JSX, useMemo, useState} from 'react';
import styles from '../example/index.css';
import {useAsyncList} from 'react-stately';
import './styles.css';

export default {
  title: 'React Aria Components/ComboBox',
  component: ComboBox
} as Meta<typeof ComboBox>;

export type ComboBoxStory = StoryFn<typeof ComboBox>;
export type ComboBoxStoryObj = StoryObj<typeof ComboBox>;

export const ComboBoxExample: ComboBoxStory = () => (
  <ComboBox name="combo-box-example" data-testid="combo-box-example" allowsEmptyCollection>
    <Label style={{display: 'block'}}>Test</Label>
    <div style={{display: 'flex'}}>
      <Input />
      <Button>
        <span aria-hidden="true" style={{padding: '0 2px'}}>▼</span>
      </Button>
    </div>
    <Popover placement="bottom end">
      <ListBox
        renderEmptyState={renderEmptyState}
        data-testid="combo-box-list-box"
        className={styles.menu}>
        <MyListBoxItem>Foo</MyListBoxItem>
        <MyListBoxItem>Bar</MyListBoxItem>
        <MyListBoxItem>Baz</MyListBoxItem>
        <MyListBoxItem href="http://google.com">Google</MyListBoxItem>
        <MyListBoxLoaderIndicator />
      </ListBox>
    </Popover>
  </ComboBox>
);

interface ComboBoxItem {
  id: string,
  name: string
}

let items: ComboBoxItem[] = [{id: '1', name: 'Foo'}, {id: '2', name: 'Bar'}, {id: '3', name: 'Baz'}];
export const ComboBoxRenderPropsStatic: ComboBoxStory = () => (
  <ComboBox data-testid="combo-box-render-props-static">
    {({isOpen}) => (
      <>
        <Label style={{display: 'block'}}>Test</Label>
        <div style={{display: 'flex'}}>
          <Input />
          <Button>
            <span aria-hidden="true" style={{padding: '0 2px'}}>{isOpen ? '▲' : '▼'}</span>
          </Button>
        </div>
        <Popover placement="bottom end">
          <ListBox className={styles.menu}>
            <MyListBoxItem>Foo</MyListBoxItem>
            <MyListBoxItem>Bar</MyListBoxItem>
            <MyListBoxItem>Baz</MyListBoxItem>
          </ListBox>
        </Popover>
      </>
    )}
  </ComboBox>
);

export const ComboBoxRenderPropsDefaultItems: ComboBoxStory = () => (
  <ComboBox defaultItems={items}>
    {({isOpen}) => (
      <>
        <Label style={{display: 'block'}}>Test</Label>
        <div style={{display: 'flex'}}>
          <Input />
          <Button>
            <span aria-hidden="true" style={{padding: '0 2px'}}>{isOpen ? '▲' : '▼'}</span>
          </Button>
        </div>
        <Popover placement="bottom end">
          <ListBox className={styles.menu}>
            {(item: ComboBoxItem) => <MyListBoxItem id={item.id}>{item.name}</MyListBoxItem>}
          </ListBox>
        </Popover>
      </>
    )}
  </ComboBox>
);

export const ComboBoxRenderPropsItems: ComboBoxStoryObj = {
  render: () => (
    <ComboBox items={items}>
      {({isOpen}) => (
        <>
          <Label style={{display: 'block'}}>Test</Label>
          <div style={{display: 'flex'}}>
            <Input />
            <Button>
              <span aria-hidden="true" style={{padding: '0 2px'}}>{isOpen ? '▲' : '▼'}</span>
            </Button>
          </div>
          <Popover placement="bottom end">
            <ListBox className={styles.menu}>
              {(item: ComboBoxItem) => <MyListBoxItem id={item.id}>{item.name}</MyListBoxItem>}
            </ListBox>
          </Popover>
        </>
      )}
    </ComboBox>
  ),
  parameters: {
    description: {
      data: 'Note this won\'t filter the items in the listbox because it is fully controlled'
    }
  }
};

export const ComboBoxRenderPropsListBoxDynamic: ComboBoxStory = () => (
  <ComboBox>
    {({isOpen}) => (
      <>
        <Label style={{display: 'block'}}>Test</Label>
        <div style={{display: 'flex'}}>
          <Input />
          <Button>
            <span aria-hidden="true" style={{padding: '0 2px'}}>{isOpen ? '▲' : '▼'}</span>
          </Button>
        </div>
        <Popover placement="bottom end">
          <ListBox className={styles.menu} items={items}>
            {item => <MyListBoxItem id={item.id}>{item.name}</MyListBoxItem>}
          </ListBox>
        </Popover>
      </>
    )}
  </ComboBox>
);

export const ComboBoxAsyncLoadingExample: ComboBoxStory = () => {
  let list = useAsyncList<ComboBoxItem>({
    async load({filterText}) {
      let json = await new Promise(resolve => {
        setTimeout(() => {
          resolve(filterText ? items.filter(item => {
            let name = item.name.toLowerCase();
            for (let filterChar of filterText.toLowerCase()) {
              if (!name.includes(filterChar)) {
                return false;
              }
              name = name.replace(filterChar, '');
            }
            return true;
          }) : items);
        }, 300);
      }) as ComboBoxItem[];

      return {
        items: json
      };
    }
  });

  return (
    <ComboBox items={list.items} inputValue={list.filterText} onInputChange={list.setFilterText}>
      <Label style={{display: 'block'}}>Test</Label>
      <div style={{display: 'flex'}}>
        <Input />
        <Button>
          <span aria-hidden="true" style={{padding: '0 2px'}}>▼</span>
        </Button>
      </div>
      <Popover placement="bottom end">
        <ListBox<ComboBoxItem>
          className={styles.menu}>
          {item => <MyListBoxItem>{item.name}</MyListBoxItem>}
        </ListBox>
      </Popover>
    </ComboBox>
  );
};

export const ComboBoxImeExample: ComboBoxStory = () => (
  <ComboBox>
    <Label style={{display: 'block'}}>IME Test</Label>
    <div style={{display: 'flex'}}>
      <Input />
      <Button>
        <span aria-hidden="true" style={{padding: '0 2px'}}>▼</span>
      </Button>
    </div>
    <Popover placement="bottom end">
      <ListBox
        data-testid="combo-box-list-box"
        className={styles.menu}>
        <MyListBoxItem>にほんご</MyListBoxItem>
        <MyListBoxItem>ニホンゴ</MyListBoxItem>
        <MyListBoxItem>ﾆﾎﾝｺﾞ</MyListBoxItem>
        <MyListBoxItem>日本語</MyListBoxItem>
        <MyListBoxItem>123</MyListBoxItem>
        <MyListBoxItem>１２３</MyListBoxItem>
      </ListBox>
    </Popover>
  </ComboBox>
);

let manyItems = [...Array(10000)].map((_, i) => ({id: i, name: `Item ${i}`}));

const VirtualizedComboBoxRender = (args: ComboBoxProps<any> & {isLoading: boolean}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const {contains} = useFilter({sensitivity: 'base'});
  const filteredItems = useMemo(() => {
    return manyItems.filter((item) => contains(item.name, searchTerm));
  }, [searchTerm, contains]);

  return (
    <ComboBox items={filteredItems} inputValue={searchTerm} onInputChange={setSearchTerm}>
      <Label style={{display: 'block'}}>Test</Label>
      <div style={{display: 'flex'}}>
        <Input />
        <Button>
          <span aria-hidden="true" style={{padding: '0 2px'}}>▼</span>
        </Button>
      </div>
      <Popover>
        <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 25}}>
          <ListBox className={styles.menu}>
            <Collection items={filteredItems}>
              {(item: any) => <MyListBoxItem>{item.name}</MyListBoxItem>}
            </Collection>
            <MyListBoxLoaderIndicator isLoading={args.isLoading} />
          </ListBox>
        </Virtualizer>
      </Popover>
    </ComboBox>
  );
};

export const VirtualizedComboBox: StoryObj<typeof VirtualizedComboBoxRender> = {
  render: (args) => <VirtualizedComboBoxRender {...args} />,
  args: {
    isLoading: false
  }
};

let renderEmptyState = () => {
  return  (
    <div style={{height: 30, width: '100%'}}>
      No results
    </div>
  );
};

interface Character {
  name: string,
  height: number,
  mass: number,
  birth_year: number
}

const AsyncVirtualizedDynamicComboboxRender = (props: {delay: number}): JSX.Element => {
  let list = useAsyncList<Character>({
    async load({signal, cursor, filterText}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      await new Promise(resolve => setTimeout(resolve, props.delay));
      let res = await fetch(cursor || `https://swapi.py4e.com/api/people/?search=${filterText}`, {signal});
      let json = await res.json();

      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <ComboBox inputValue={list.filterText} onInputChange={list.setFilterText} allowsEmptyCollection>
      <Label style={{display: 'block'}}>Async Virtualized Dynamic ComboBox</Label>
      <div style={{display: 'flex', position: 'relative'}}>
        <Input />
        {list.isLoading && <LoadingSpinner style={{left: '130px', top: '0px', height: 20, width: 20}} />}
        <Button>
          <span aria-hidden="true" style={{padding: '0 2px'}}>▼</span>
        </Button>
      </div>
      <Popover>
        <Virtualizer
          layout={ListLayout}
          layoutOptions={{rowHeight: 25, loaderHeight: 30}}>
          <ListBox<Character> className={styles.menu} renderEmptyState={renderEmptyState}>
            <Collection items={list.items}>
              {item => <MyListBoxItem id={item.name}>{item.name}</MyListBoxItem>}
            </Collection>
            <MyListBoxLoaderIndicator isLoading={list.loadingState === 'loadingMore'} onLoadMore={list.loadMore} />
          </ListBox>
        </Virtualizer>
      </Popover>
    </ComboBox>
  );
};

export const AsyncVirtualizedDynamicCombobox: StoryObj<typeof AsyncVirtualizedDynamicComboboxRender> = {
  render: (args) => <AsyncVirtualizedDynamicComboboxRender {...args} />,
  args: {
    delay: 50
  }
};

const MyListBoxLoaderIndicator = (props) => {
  return (
    <ListBoxLoadMoreItem
      style={{height: 30, width: '100%'}}
      {...props}>
      <LoadingSpinner style={{height: 20, width: 20, position: 'unset'}} />
    </ListBoxLoadMoreItem>
  );
};

export function WithCreateOption() {
  let [inputValue, setInputValue] = useState('');

  return (
    <ComboBox
      allowsEmptyCollection
      inputValue={inputValue}
      onInputChange={setInputValue}>
      <Label style={{display: 'block'}}>Favorite Animal</Label>
      <div style={{display: 'flex'}}>
        <Input />
        <Button>
          <span aria-hidden="true" style={{padding: '0 2px'}}>▼</span>
        </Button>
      </div>
      <Popover placement="bottom end">
        <ListBox
          data-testid="combo-box-list-box"
          className={styles.menu}>
          {inputValue.length > 0 && (
            <MyListBoxItem onAction={() => alert('hi')}>
              {`Create "${inputValue}"`}
            </MyListBoxItem>
          )}
          <MyListBoxItem>Aardvark</MyListBoxItem>
          <MyListBoxItem>Cat</MyListBoxItem>
          <MyListBoxItem>Dog</MyListBoxItem>
          <MyListBoxItem>Kangaroo</MyListBoxItem>
          <MyListBoxItem>Panda</MyListBoxItem>
          <MyListBoxItem>Snake</MyListBoxItem>
        </ListBox>
      </Popover>
    </ComboBox>
  );
}

export const ComboBoxListBoxItemWithAriaLabel: ComboBoxStory = () => (
  <ComboBox name="combo-box-example" data-testid="combo-box-example" allowsEmptyCollection>
    <Label style={{display: 'block'}}>Test</Label>
    <div style={{display: 'flex'}}>
      <Input />
      <Button>
        <span aria-hidden="true" style={{padding: '0 2px'}}>▼</span>
      </Button>
    </div>
    <Popover placement="bottom end">
      <ListBox
        renderEmptyState={renderEmptyState}
        data-testid="combo-box-list-box"
        className={styles.menu}>
        <MyListBoxItem aria-label="Item Foo" textValue="Foo">Item <b>Foo</b></MyListBoxItem>
        <MyListBoxItem aria-label="Item Bar" textValue="Bar">Item <b>Bar</b></MyListBoxItem>
        <MyListBoxItem aria-label="Item Baz" textValue="Baz">Item <b>Baz</b></MyListBoxItem>
      </ListBox>
    </Popover>
  </ComboBox>
);
