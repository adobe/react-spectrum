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

import {action} from '@storybook/addon-actions';
import {
  Button,
  Checkbox,
  CheckboxProps,
  Collection,
  Dialog,
  DialogTrigger,
  DropIndicator,
  GridLayout,
  GridList,
  GridListItem,
  GridListItemProps,
  Heading,
  ListLayout,
  Modal,
  ModalOverlay,
  Popover,
  Size,
  Tag,
  TagGroup,
  TagList,
  useDragAndDrop,
  Virtualizer
} from 'react-aria-components';
import {classNames} from '@react-spectrum/utils';
import {Key, useAsyncList, useListData} from 'react-stately';
import {LoadingSpinner} from './utils';
import React, {useState} from 'react';
import styles from '../example/index.css';
import {UNSTABLE_GridListLoadingSentinel} from '../src/GridList';

export default {
  title: 'React Aria Components'
};

export const GridListExample = (args) => (
  <GridList
    {...args}
    className={styles.menu}
    aria-label="test gridlist"
    style={{
      width: 300,
      height: 300,
      display: 'grid',
      gridTemplate: args.layout === 'grid' ? 'repeat(3, 1fr) / repeat(3, 1fr)' : 'auto / 1fr',
      gridAutoFlow: 'row'
    }}>
    <MyGridListItem>1,1 <Button>Actions</Button></MyGridListItem>
    <MyGridListItem>1,2 <Button>Actions</Button></MyGridListItem>
    <MyGridListItem>1,3 <Button>Actions</Button></MyGridListItem>
    <MyGridListItem>2,1 <Button>Actions</Button></MyGridListItem>
    <MyGridListItem>2,2 <Button>Actions</Button></MyGridListItem>
    <MyGridListItem>2,3 <Button>Actions</Button></MyGridListItem>
    <MyGridListItem>3,1 <Button>Actions</Button></MyGridListItem>
    <MyGridListItem>3,2 <Button>Actions</Button></MyGridListItem>
    <MyGridListItem>3,3 <Button>Actions</Button></MyGridListItem>
  </GridList>
);

const MyGridListItem = (props: GridListItemProps) => {
  return (
    <GridListItem
      {...props}
      style={{display: 'flex', alignItems: 'center', gap: 8}}
      className={({isFocused, isSelected, isHovered}) => classNames(styles, 'item', {
        focused: isFocused,
        selected: isSelected,
        hovered: isHovered
      })}>
      {({selectionMode, allowsDragging}) => (<>
        {allowsDragging && <Button slot="drag">≡</Button>}
        {selectionMode !== 'none' ? <MyCheckbox slot="selection" /> : null}
        {props.children as any}
      </>)}
    </GridListItem>
  );
};

GridListExample.story = {
  args: {
    layout: 'stack',
    escapeKeyBehavior: 'clearSelection',
    shouldSelectOnPressUp: false
  },
  argTypes: {
    layout: {
      control: 'radio',
      options: ['stack', 'grid']
    },
    keyboardNavigationBehavior: {
      control: 'radio',
      options: ['arrow', 'tab']
    },
    selectionMode: {
      control: 'radio',
      options: ['none', 'single', 'multiple']
    },
    selectionBehavior: {
      control: 'radio',
      options: ['toggle', 'replace']
    },
    escapeKeyBehavior: {
      control: 'radio',
      options: ['clearSelection', 'none']
    }
  }
};

const MyCheckbox = ({children, ...props}: CheckboxProps) => {
  return (
    <Checkbox {...props}>
      {({isIndeterminate}) => (
        <>
          <div className="checkbox">
            <svg viewBox="0 0 18 18" aria-hidden="true">
              {isIndeterminate
                ? <rect x={1} y={7.5} width={15} height={3} />
                : <polyline points="1 9 7 14 15 4" />}
            </svg>
          </div>
          {children}
        </>
      )}
    </Checkbox>
  );
};

export function VirtualizedGridList() {
  let items: {id: number, name: string}[] = [];
  for (let i = 0; i < 10000; i++) {
    items.push({id: i, name: `Item ${i}`});
  }

  let list = useListData({
    initialItems: items
  });

  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => {
      return [...keys].map(key => ({'text/plain': list.getItem(key)?.name ?? ''}));
    },
    onReorder(e) {
      if (e.target.dropPosition === 'before') {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        list.moveAfter(e.target.key, e.keys);
      }
    },
    renderDropIndicator(target) {
      return <DropIndicator target={target} style={({isDropTarget}) => ({width: '100%', height: '100%', background: isDropTarget ? 'blue' : 'transparent'})} />;
    }
  });

  return (
    <Virtualizer
      layout={ListLayout}
      layoutOptions={{
        rowHeight: 25
      }}>
      <GridList
        className={styles.menu}
        selectionMode="multiple"
        dragAndDropHooks={dragAndDropHooks}
        style={{height: 400}}
        aria-label="virtualized listbox"
        items={list.items}>
        {item => <MyGridListItem>{item.name}</MyGridListItem>}
      </GridList>
    </Virtualizer>
  );
}

export function VirtualizedGridListGrid() {
  let items: {id: number, name: string}[] = [];
  for (let i = 0; i < 10000; i++) {
    items.push({id: i, name: `Item ${i}`});
  }

  return (
    <Virtualizer
      layout={GridLayout}
      layoutOptions={{
        minItemSize: new Size(40, 40)
      }}>
      <GridList className={styles.menu} layout="grid" style={{height: 400, width: 400}} aria-label="virtualized listbox" items={items}>
        {item => <MyGridListItem>{item.name}</MyGridListItem>}
      </GridList>
    </Virtualizer>
  );
}

let renderEmptyState = ({isLoading}) => {
  return  (
    <div style={{height: 30, width: '100%'}}>
      {isLoading ? <LoadingSpinner style={{height: 20, width: 20, transform: 'translate(-50%, -50%)'}} /> : 'No results'}
    </div>
  );
};

interface Character {
  name: string,
  height: number,
  mass: number,
  birth_year: number
}

const MyGridListLoaderIndicator = (props) => {
  return (
    <UNSTABLE_GridListLoadingSentinel
      style={{
        height: 30,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      {...props}>
      <LoadingSpinner style={{height: 20, width: 20, position: 'unset'}} />
    </UNSTABLE_GridListLoadingSentinel>
  );
};

export const AsyncGridList = (args) => {
  let list = useAsyncList<Character>({
    async load({signal, cursor, filterText}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      await new Promise(resolve => setTimeout(resolve, args.delay));
      let res = await fetch(cursor || `https://swapi.py4e.com/api/people/?search=${filterText}`, {signal});
      let json = await res.json();

      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <GridList
      className={styles.menu}
      style={{height: 200}}
      aria-label="async gridlist"
      renderEmptyState={() => renderEmptyState({isLoading: list.isLoading})}>
      <Collection items={list.items}>
        {(item: Character) => (
          <MyGridListItem id={item.name}>{item.name}</MyGridListItem>
        )}
      </Collection>
      <MyGridListLoaderIndicator isLoading={list.loadingState === 'loadingMore'} onLoadMore={list.loadMore} />
    </GridList>
  );
};

AsyncGridList.story = {
  args: {
    delay: 50
  }
};

export const AsyncGridListVirtualized = (args) => {
  let list = useAsyncList<Character>({
    async load({signal, cursor, filterText}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      await new Promise(resolve => setTimeout(resolve, args.delay));
      let res = await fetch(cursor || `https://swapi.py4e.com/api/people/?search=${filterText}`, {signal});
      let json = await res.json();
      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <Virtualizer
      layout={ListLayout}
      layoutOptions={{
        rowHeight: 25,
        loaderHeight: 30
      }}>
      <GridList
        className={styles.menu}
        style={{height: 200}}
        aria-label="async virtualized gridlist"
        renderEmptyState={() => renderEmptyState({isLoading: list.isLoading})}>
        <Collection items={list.items}>
          {item => <MyGridListItem id={item.name}>{item.name}</MyGridListItem>}
        </Collection>
        <MyGridListLoaderIndicator isLoading={list.loadingState === 'loadingMore'} onLoadMore={list.loadMore} />
      </GridList>
    </Virtualizer>
  );
};

AsyncGridListVirtualized.story = {
  args: {
    delay: 50
  }
};

export function TagGroupInsideGridList() {
  return (
    <GridList
      className={styles.menu}
      aria-label="Grid list with tag group"
      keyboardNavigationBehavior="tab"
      style={{
        width: 300,
        height: 300
      }}>
      <MyGridListItem textValue="Tags">
        1,1
        <TagGroup aria-label="Tag group 1" onRemove={action('onRemove')}>
          <TagList style={{display: 'flex', gap: 10}}>
            <Tag key="1">Tag 1<Button slot="remove">X</Button></Tag>
            <Tag key="2">Tag 2<Button slot="remove">X</Button></Tag>
            <Tag key="3">Tag 3<Button slot="remove">X</Button></Tag>
          </TagList>
        </TagGroup>
        <TagGroup aria-label="Tag group 2" onRemove={action('onRemove')}>
          <TagList style={{display: 'flex', gap: 10}}>
            <Tag key="1">Tag 1<Button slot="remove">X</Button></Tag>
            <Tag key="2">Tag 2<Button slot="remove">X</Button></Tag>
            <Tag key="3">Tag 3<Button slot="remove">X</Button></Tag>
          </TagList>
        </TagGroup>
      </MyGridListItem>
      <MyGridListItem>
        1,2 <Button>Actions</Button>
      </MyGridListItem>
      <MyGridListItem>
        1,3
        <TagGroup aria-label="Tag group">
          <TagList style={{display: 'flex', gap: 10}}>
            <Tag key="1">Tag 1</Tag>
            <Tag key="2">Tag 2</Tag>
            <Tag key="3">Tag 3</Tag>
          </TagList>
        </TagGroup>
      </MyGridListItem>
    </GridList>
  );
}

const GridListDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Set<Key>>(new Set([]));

  const handleSelectionChange = (e) => {
    setSelectedItem(e);
    setIsOpen(false);
  };

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button>Open GridList Options</Button>
      <Popover>
        <div>
          <GridList
            className={styles.menu}
            selectedKeys={selectedItem}
            aria-label="Favorite pokemon"
            selectionMode="single"
            onSelectionChange={handleSelectionChange}
            shouldSelectOnPressUp
            autoFocus>
            <MyGridListItem textValue="Charizard">
              Option 1 <Button>A</Button>
            </MyGridListItem>
            <MyGridListItem textValue="Blastoise">
              Option 2 <Button>B</Button>
            </MyGridListItem>
            <MyGridListItem textValue="Venusaur">
              Option 3 <Button>C</Button>
            </MyGridListItem>
            <MyGridListItem textValue="Pikachu">
              Option 4 <Button>D</Button>
            </MyGridListItem>
          </GridList>
        </div>
      </Popover>
    </DialogTrigger>
  );
};

function GridListInModalPickerRender(props) {
  const [mainModalOpen, setMainModalOpen] = useState(true);
  return (
    <>
      <Button onPress={() => setMainModalOpen(true)}>
        Open Modal
      </Button>
      <ModalOverlay
        {...props}
        isOpen={mainModalOpen}
        onOpenChange={setMainModalOpen}
        isDismissable
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)'
        }}>
        <Modal>
          <Dialog>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: 8,
                background: '#ccc',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                width: 'max-content',
                height: 'max-content'
              }}>
              <Heading slot="title">Open the GridList Picker</Heading>
              <GridListDropdown />
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}

export const GridListInModalPicker = {
  render: (args) => <GridListInModalPickerRender {...args} />,
  parameters: {
    docs: {
      description: {
        component: 'Selecting an option from the grid list over the backdrop should not result in the modal closing.'
      }
    }
  }
};
