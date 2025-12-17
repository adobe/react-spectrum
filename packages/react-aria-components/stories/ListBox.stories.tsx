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
import {Collection, DropIndicator, GridLayout, Header, ListBox, ListBoxItem, ListBoxProps, ListBoxSection, ListLayout, Separator, Text, useDragAndDrop, Virtualizer, WaterfallLayout} from 'react-aria-components';
import {ListBoxLoadMoreItem} from '../';
import {LoadingSpinner, MyListBoxItem} from './utils';
import {Meta, StoryFn, StoryObj} from '@storybook/react';
import React, {JSX, useState} from 'react';
import {Size} from '@react-stately/virtualizer';
import styles from '../example/index.css';
import './styles.css';
import {useAsyncList, useListData} from 'react-stately';

export default {
  title: 'React Aria Components/ListBox',
  component: ListBox,
  excludeStories: ['MyListBoxLoaderIndicator']
} as Meta<typeof ListBox>;

export type ListBoxStory = StoryFn<typeof ListBox>;
export type ListBoxStoryObj = StoryObj<typeof ListBox>;

export const ListBoxExample: ListBoxStory = (args) => (
  <ListBox className={styles.menu} {...args} aria-label="test listbox">
    <MyListBoxItem>Foo</MyListBoxItem>
    <MyListBoxItem>Bar</MyListBoxItem>
    <MyListBoxItem>Baz</MyListBoxItem>
    <MyListBoxItem href="http://google.com">Google</MyListBoxItem>
  </ListBox>
);

ListBoxExample.story = {
  args: {
    selectionMode: 'none',
    selectionBehavior: 'toggle',
    shouldFocusOnHover: false,
    escapeKeyBehavior: 'clearSelection'
  },
  argTypes: {
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
  },
  parameters: {
    description: {
      data: 'Hover styles should have higher specificity than focus style for testing purposes. Hover style should not be applied on keyboard focus even if shouldFocusOnHover is true'
    }
  }
};

// Known accessibility false positive: https://github.com/adobe/react-spectrum/wiki/Known-accessibility-false-positives#listbox
// also has a aXe landmark error, not sure what it means
export const ListBoxSections: ListBoxStory = () => (
  <ListBox className={styles.menu} selectionMode="multiple" selectionBehavior="replace" aria-label="test listbox with section">
    <ListBoxSection className={styles.group}>
      <Header style={{fontSize: '1.2em'}}>Section 1</Header>
      <MyListBoxItem>Foo</MyListBoxItem>
      <MyListBoxItem>Bar</MyListBoxItem>
      <MyListBoxItem>Baz</MyListBoxItem>
    </ListBoxSection>
    <Separator style={{borderTop: '1px solid gray', margin: '2px 5px'}} />
    <ListBoxSection className={styles.group} aria-label="Section 2">
      <MyListBoxItem>Foo</MyListBoxItem>
      <MyListBoxItem>Bar</MyListBoxItem>
      <MyListBoxItem>Baz</MyListBoxItem>
    </ListBoxSection>
  </ListBox>
);

export const ListBoxComplex: ListBoxStory = () => (
  <ListBox className={styles.menu} selectionMode="multiple" selectionBehavior="replace" aria-label="listbox complex">
    <MyListBoxItem>
      <Text slot="label">Item 1</Text>
      <Text slot="description">Description</Text>
    </MyListBoxItem>
    <MyListBoxItem>
      <Text slot="label">Item 2</Text>
      <Text slot="description">Description</Text>
    </MyListBoxItem>
    <MyListBoxItem>
      <Text slot="label">Item 3</Text>
      <Text slot="description">Description</Text>
    </MyListBoxItem>
  </ListBox>
);

interface Album {
  id: number,
  image: string,
  title: string,
  artist: string
}

let albums: Album[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1593958812614-2db6a598c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZGlzY298ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=900&q=60',
    title: 'Euphoric Echoes',
    artist: 'Luna Solstice'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bmVvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=900&q=60',
    title: 'Neon Dreamscape',
    artist: 'Electra Skyline'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHNwYWNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=900&q=60',
    title: 'Cosmic Serenade',
    artist: 'Orion\'s Symphony'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bXVzaWN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=900&q=60',
    title: 'Melancholy Melodies',
    artist: 'Violet Mistral'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1608433319511-dfe8ea4cbd3c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGJlYXR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=900&q=60',
    title: 'Rhythmic Illusions',
    artist: 'Mirage Beats'
  }
];

type AlbumListBoxStory = StoryFn<typeof ListBox<Album>>;
export const ListBoxDnd: AlbumListBoxStory = (props) => {
  let list = useListData({
    initialItems: albums
  });

  let {dragAndDropHooks} = useDragAndDrop<Album>({
    getItems: (keys, items) => items.map(item => ({'text/plain': item.title ?? ''})),
    onReorder(e) {
      if (e.target.dropPosition === 'before') {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        list.moveAfter(e.target.key, e.keys);
      }
    }
  });

  return (
    <ListBox
      {...props}
      aria-label="Albums"
      items={list.items}
      selectionMode="multiple"
      dragAndDropHooks={dragAndDropHooks}>
      {item => (
        <ListBoxItem>
          <img src={item.image} alt="" />
          <Text slot="label">{item.title}</Text>
          <Text slot="description">{item.artist}</Text>
        </ListBoxItem>
      )}
    </ListBox>
  );
};

ListBoxDnd.story = {
  args: {
    layout: 'stack',
    orientation: 'horizontal'
  },
  argTypes: {
    layout: {
      control: 'radio',
      options: ['stack', 'grid']
    },
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical']
    }
  }
};

interface PreviewOffsetArgs {
  /** Strategy for positioning the preview. */
  mode: 'default' | 'custom',
  /** X offset in pixels (only used when mode = custom). */
  offsetX: number,
  /** Y offset in pixels (only used when mode = custom). */
  offsetY: number
}

function ListBoxDndWithPreview({mode, offsetX, offsetY, ...props}: PreviewOffsetArgs & ListBoxProps<typeof albums[0]>) {
  let list = useListData({
    initialItems: albums
  });

  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map(key => ({'text/plain': list.getItem(key)?.title ?? ''})),
    onReorder(e) {
      if (e.target.dropPosition === 'before') {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        list.moveAfter(e.target.key, e.keys);
      }
    },
    renderDragPreview(items) {
      let element = (
        <div style={{display: 'flex', alignItems: 'center', padding: 4, background: 'white', border: '1px solid gray'}}>
          <Text>{items[0]['text/plain']}</Text>
          {items.length > 1 && <span style={{marginLeft: 4, fontSize: 12}}>+{items.length - 1}</span>}
        </div>
      );

      if (mode === 'custom') {
        return {element, x: offsetX, y: offsetY};
      }
      return element;
    }
  });

  return (
    <ListBox
      {...props}
      aria-label="Albums with preview offset"
      items={list.items}
      selectionMode="multiple"
      dragAndDropHooks={dragAndDropHooks}>
      {item => (
        <ListBoxItem>
          <img src={item.image} alt="" />
          <Text slot="label">{item.title}</Text>
          <Text slot="description">{item.artist}</Text>
        </ListBoxItem>
      )}
    </ListBox>
  );
}

export const ListBoxPreviewOffset = {
  render(args) {
    return <ListBoxDndWithPreview {...args} />;
  },
  args: {
    layout: 'stack',
    orientation: 'horizontal',
    mode: 'default',
    offsetX: 20,
    offsetY: 20
  },
  argTypes: {
    layout: {
      control: 'radio',
      options: ['stack', 'grid']
    },
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical']
    },
    mode: {
      control: 'select',
      options: ['default', 'custom']
    },
    offsetX: {
      control: 'number'
    },
    offsetY: {
      control: 'number'
    }
  }
};

export const ListBoxHover: ListBoxStory = () => (
  <ListBox className={styles.menu} aria-label="test listbox" onAction={action('onAction')} >
    <MyListBoxItem onHoverStart={action('onHoverStart')} onHoverChange={action('onHoverChange')} onHoverEnd={action('onHoverEnd')}>Hover</MyListBoxItem>
    <MyListBoxItem>Bar</MyListBoxItem>
    <MyListBoxItem>Baz</MyListBoxItem>
    <MyListBoxItem href="http://google.com">Google</MyListBoxItem>
  </ListBox>
);

export const ListBoxGrid: ListBoxStory = (args) => (
  <ListBox
    {...args}
    className={styles.menu}
    aria-label="test listbox"
    style={{
      width: 300,
      height: 300,
      display: 'grid',
      gridTemplate: 'repeat(3, 1fr) / repeat(3, 1fr)',
      gridAutoFlow: args.orientation === 'vertical' ? 'row' : 'column'
    }}>
    <MyListBoxItem style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>1,1</MyListBoxItem>
    <MyListBoxItem style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>1,2</MyListBoxItem>
    <MyListBoxItem style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>1,3</MyListBoxItem>
    <MyListBoxItem style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>2,1</MyListBoxItem>
    <MyListBoxItem style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>2,2</MyListBoxItem>
    <MyListBoxItem style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>2,3</MyListBoxItem>
    <MyListBoxItem style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>3,1</MyListBoxItem>
    <MyListBoxItem style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>3,2</MyListBoxItem>
    <MyListBoxItem style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>3,3</MyListBoxItem>
  </ListBox>
);

ListBoxGrid.story = {
  args: {
    layout: 'grid',
    orientation: 'vertical'
  },
  argTypes: {
    orientation: {
      control: {
        type: 'radio',
        options: ['vertical', 'horizontal']
      }
    }
  }
};

function generateRandomString(minLength: number, maxLength: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

function VirtualizedListBoxRender({variableHeight, isLoading}: {variableHeight: boolean, isLoading?: boolean}): JSX.Element {
  let sections: {id: string, name: string, children: {id: string, name: string}[]}[] = [];
  for (let s = 0; s < 10; s++) {
    let items: {id: string, name: string}[] = [];
    for (let i = 0; i < 100; i++) {
      const l = (s * 5) + i + 10;
      items.push({id: `item_${s}_${i}`, name: `Section ${s}, Item ${i}${variableHeight ? ' ' + generateRandomString(l, l) : ''}`});
    }
    sections.push({id: `section_${s}`, name: `Section ${s}`, children: items});
  }

  return (
    <Virtualizer
      layout={new ListLayout({
        estimatedRowHeight: 25,
        estimatedHeadingHeight: 26,
        loaderHeight: 30
      })}>
      <ListBox className={styles.menu} style={{height: 400}} aria-label="virtualized listbox">
        <Collection items={sections}>
          {section => (
            <ListBoxSection className={styles.group}>
              <Header style={{fontSize: '1.2em'}}>{section.name}</Header>
              <Collection items={section.children}>
                {item => <MyListBoxItem>{item.name}</MyListBoxItem>}
              </Collection>
            </ListBoxSection>
          )}
        </Collection>
        <MyListBoxLoaderIndicator orientation="vertical" isLoading={isLoading} />
      </ListBox>
    </Virtualizer>
  );
}

export const VirtualizedListBox: StoryObj<typeof VirtualizedListBoxRender> = {
  render: (args) => <VirtualizedListBoxRender {...args} />,
  args: {
    variableHeight: false,
    isLoading: false
  }
};

export let VirtualizedListBoxEmpty: ListBoxStoryObj = {
  render: () => (
    <Virtualizer
      layout={ListLayout}
      layoutOptions={{
        rowHeight: 25,
        estimatedHeadingHeight: 26
      }}>
      <ListBox className={styles.menu} style={{height: 400}} aria-label="virtualized listbox" renderEmptyState={() => 'Empty'}>
        <MyListBoxLoaderIndicator />
      </ListBox>
    </Virtualizer>
  )
};

export let VirtualizedListBoxDnd: ListBoxStory = () => {
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
    <div style={{height: 400, width: 400, resize: 'both', padding: 40, overflow: 'hidden'}}>
      <Virtualizer
        layout={ListLayout}
        layoutOptions={{
          rowHeight: 25,
          gap: 8
        }}>
        <ListBox
          className={styles.menu}
          selectionMode="multiple"
          selectionBehavior="replace"
          style={{width: '100%', height: '100%'}}
          aria-label="virtualized listbox"
          items={list.items}
          dragAndDropHooks={dragAndDropHooks}>
          {item => <MyListBoxItem>{item.name}</MyListBoxItem>}
        </ListBox>
      </Virtualizer>
    </div>
  );
};

function VirtualizedListBoxGridExample({minSize = 80, maxSize = 100, preserveAspectRatio = false}: {minSize: number, maxSize: number, preserveAspectRatio: boolean}): JSX.Element {
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
    <div style={{height: 400, width: 400, resize: 'both', padding: 40, overflow: 'hidden'}}>
      <Virtualizer
        layout={GridLayout}
        layoutOptions={{
          minItemSize: new Size(minSize, minSize),
          maxItemSize: new Size(maxSize, maxSize),
          preserveAspectRatio
        }}>
        <ListBox
          className={styles.menu}
          selectionMode="multiple"
          selectionBehavior="replace"
          layout="grid"
          style={{width: '100%', height: '100%'}}
          aria-label="virtualized listbox"
          items={list.items}
          dragAndDropHooks={dragAndDropHooks}>
          {item => <MyListBoxItem style={{height: '100%', border: '1px solid', boxSizing: 'border-box'}}>{item.name}</MyListBoxItem>}
        </ListBox>
      </Virtualizer>
    </div>
  );
}

export const VirtualizedListBoxGrid: StoryObj<typeof VirtualizedListBoxGridExample> = {
  render: (args) => {
    return <VirtualizedListBoxGridExample {...args} />;
  },
  args: {
    minSize: 80,
    maxSize: 100,
    preserveAspectRatio: false
  }
};

let lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'.split(' ');
let defaultItems: {id: number, name: string}[] = [];
for (let i = 0; i < 1000; i++) {
  let words = Math.max(2, Math.floor(Math.random() * 25));
  let name = lorem.slice(0, words).join(' ');
  defaultItems.push({id: i, name});
}
function VirtualizedListBoxWaterfallExample({minSize = 40, maxSize = 65, maxColumns = undefined, minSpace = undefined, maxSpace = undefined}: {minSize: number, maxSize: number, maxColumns?: number, minSpace?: number, maxSpace?: number}): JSX.Element {
  let [items] = useState(defaultItems);

  return (
    <div style={{height: 400, width: 400, resize: 'both', padding: 40, overflow: 'hidden'}}>
      <Virtualizer
        layout={WaterfallLayout}
        layoutOptions={{
          minItemSize: new Size(minSize, 40),
          maxItemSize: new Size(maxSize, 65),
          maxColumns,
          minSpace: new Size(minSpace, 18),
          maxHorizontalSpace: maxSpace
        }}>
        <ListBox
          className={styles.menu}
          selectionMode="multiple"
          selectionBehavior="replace"
          layout="grid"
          style={{width: '100%', height: '100%'}}
          aria-label="virtualized listbox"
          items={items}>
          {item => <MyListBoxItem style={{height: '100%', border: '1px solid', boxSizing: 'border-box'}}>{item.name}</MyListBoxItem>}
        </ListBox>
      </Virtualizer>
    </div>
  );
}

export const VirtualizedListBoxWaterfall: StoryObj<typeof VirtualizedListBoxWaterfallExample> = {
  render: (args) => {
    return <VirtualizedListBoxWaterfallExample {...args} />;
  },
  args: {
    minSize: 40,
    maxSize: 65,
    maxColumns: undefined,
    minSpace: undefined,
    maxSpace: undefined
  },
  argTypes: {
    minSize: {
      control: 'number',
      description: 'The minimum width of each item in the grid list',
      defaultValue: 40
    },
    maxSize: {
      control: 'number',
      description: 'Maximum width of each item in the grid list.',
      defaultValue: 65
    },
    maxColumns: {
      control: 'number',
      description: 'Maximum number of columns in the grid list.',
      defaultValue: undefined
    },
    minSpace: {
      control: 'number',
      description: 'Minimum horizontal space between grid items.',
      defaultValue: undefined
    },
    maxSpace: {
      control: 'number',
      description: 'Maximum horizontal space between grid items.',
      defaultValue: undefined
    }
  }
};


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

export const MyListBoxLoaderIndicator = (props) => {
  let {orientation, ...otherProps} = props;
  return (
    <ListBoxLoadMoreItem
      style={{
        height: orientation === 'horizontal' ? 100 : 30,
        width: orientation === 'horizontal' ? 30 : '100%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      {...otherProps}>
      <LoadingSpinner style={{height: 20, width: 20, position: 'unset'}} />
    </ListBoxLoadMoreItem>
  );
};

function AsyncListBoxRender(args: {delay: number, orientation: 'horizontal' | 'vertical'}): JSX.Element {
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
    <ListBox
      {...args}
      style={{
        height: args.orientation === 'horizontal' ? 'fit-content' : 400,
        width: args.orientation === 'horizontal' ? 400 : 200,
        overflow: 'auto'
      }}
      aria-label="async listbox"
      renderEmptyState={() => renderEmptyState({isLoading: list.isLoading})}>
      <Collection items={list.items}>
        {(item: Character) => (
          <MyListBoxItem
            style={{
              minHeight: args.orientation === 'horizontal' ? 100 : 50,
              minWidth: args.orientation === 'horizontal' ? 50 : 200,
              backgroundColor: 'lightgrey',
              border: '1px solid black',
              boxSizing: 'border-box'
            }}
            id={item.name}>
            {item.name}
          </MyListBoxItem>
        )}
      </Collection>
      <MyListBoxLoaderIndicator orientation={args.orientation} isLoading={list.loadingState === 'loadingMore'} onLoadMore={list.loadMore} />
    </ListBox>
  );
};

export const AsyncListBox: StoryObj<typeof AsyncListBoxRender> = {
  render: (args) => <AsyncListBoxRender {...args} />,
  args: {
    orientation: 'horizontal',
    delay: 50
  },
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical']
    }
  }
};

export const AsyncListBoxVirtualized: StoryFn<typeof AsyncListBoxRender> = (args) => {
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
        rowHeight: 50,
        padding: 4,
        loaderHeight: 30
      }}>
      <ListBox
        {...args}
        style={{
          height: 400,
          width: 100,
          border: '1px solid gray',
          background: 'lightgray',
          overflow: 'auto',
          padding: 'unset',
          display: 'flex'
        }}
        aria-label="async virtualized listbox"
        renderEmptyState={() => renderEmptyState({isLoading: list.isLoading})}>
        <Collection items={list.items}>
          {(item: Character) => (
            <MyListBoxItem
              style={{
                backgroundColor: 'lightgrey',
                border: '1px solid black',
                boxSizing: 'border-box',
                height: '100%',
                width: '100%'
              }}
              id={item.name}>
              {item.name}
            </MyListBoxItem>
          )}
        </Collection>
        <MyListBoxLoaderIndicator isLoading={list.loadingState === 'loadingMore'} onLoadMore={list.loadMore} />
      </ListBox>
    </Virtualizer>
  );
};

AsyncListBoxVirtualized.story = {
  args: {
    delay: 50
  }
};

export let VirtualizedListBoxDndOnAction: ListBoxStory = () => {
  let items: {id: number, name: string}[] = [];
  for (let i = 0; i < 100; i++) {
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
      return <DropIndicator target={target} style={({isDropTarget}) => ({width: '100%', height: 2, background: isDropTarget ? 'blue' : 'gray', margin: '2px 0'})} />;
    }
  });

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center'}}>
      <div style={{padding: 20, background: '#f0f0f0', borderRadius: 8, maxWidth: 600}}>
        <h3 style={{margin: '0 0 10px 0'}}>Instructions:</h3>
        <ul style={{margin: 0, paddingLeft: 20}}>
          <li><strong>Enter:</strong> Triggers onAction</li>
          <li><strong>Alt+Enter:</strong> Starts drag mode</li>
          <li><strong>Space:</strong> Toggles selection</li>
        </ul>
      </div>
      <div style={{height: 400, width: 300, resize: 'both', padding: 20, overflow: 'hidden', border: '2px solid #ccc', borderRadius: 8}}>
        <Virtualizer
          layout={ListLayout}
          layoutOptions={{
            rowHeight: 25,
            gap: 4
          }}>
          <ListBox
            className={styles.menu}
            selectionMode="multiple"
            style={{width: '100%', height: '100%'}}
            aria-label="Virtualized listbox with drag and drop and onAction"
            items={list.items}
            dragAndDropHooks={dragAndDropHooks}
            onAction={action('onAction')}>
            {item => <MyListBoxItem>{item.name}</MyListBoxItem>}
          </ListBox>
        </Virtualizer>
      </div>
    </div>
  );
};

