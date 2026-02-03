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

import {Button, Collection, FieldError, Form, Input, Label, ListBox, ListLayout, OverlayArrow, Popover, Select, SelectValue, TextField, Virtualizer} from 'react-aria-components';
import {ListBoxLoadMoreItem} from '../src/ListBox';
import {LoadingSpinner, MyListBoxItem} from './utils';
import {Meta, StoryFn, StoryObj} from '@storybook/react';
import React, {JSX} from 'react';
import styles from '../example/index.css';
import {Tag, TagGroup} from 'vanilla-starter/TagGroup';
import {useAsyncList} from 'react-stately';
import './styles.css';

export default {
  title: 'React Aria Components/Select',
  component: Select,
  argTypes: {
    validationBehavior: {
      control: 'select',
      options: ['native', 'aria']
    },
    selectionMode: {
      control: 'radio',
      options: ['single', 'multiple']
    }
  }
} as Meta<typeof Select>;

export type SelectStory = StoryFn<typeof Select>;

export const SelectExample: SelectStory = (args) => (
  <Select {...args} data-testid="select-example" id="select-example-id">
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

export const SelectRenderProps: SelectStory = (args) => (
  <Select {...args} data-testid="select-render-props">
    {({isOpen}) => (
      <>
        <Label style={{display: 'block'}}>Test</Label>
        <Button>
          <SelectValue>
            {({selectedItems, defaultChildren}) => (
              selectedItems.length <= 1 ? defaultChildren : `${selectedItems.length} selected items`
            )}
          </SelectValue>
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

export const SelectWithTagGroup: SelectStory = (args) => (
  <Select {...args} data-testid="select-example" id="select-example-id">
    <Label style={{display: 'block'}}>States</Label>
    <div style={{display: 'flex', gap: 8, alignItems: 'start', maxWidth: 250}}>
      <SelectValue>
        {({selectedItems, state}) => (
          <TagGroup
            aria-label="Selected states"
            items={selectedItems as {name: string}[]}
            renderEmptyState={() => 'No selected items'}
            onRemove={(keys) => {
              for (let key of keys) {
                state.selectionManager.toggleSelection(key);
              }
            }}>
            {item => <Tag>{item.name}</Tag>}
          </TagGroup>
        )}
      </SelectValue>
      <Button>+</Button>
    </div>
    <Popover placement="bottom end">
      <ListBox className={styles.menu} items={usStateOptions}>
        {state => <MyListBoxItem>{state.name}</MyListBoxItem>}
      </ListBox>
    </Popover>
  </Select>
);

let makeItems = (length: number) => Array.from({length}, (_, i) => ({
  id: i,
  name: `Item ${i}`
}));
let manyItems = makeItems(100);

const usStateOptions = [
  {id: 'AL', name: 'Alabama'},
  {id: 'AK', name: 'Alaska'},
  {id: 'AS', name: 'American Samoa'},
  {id: 'AZ', name: 'Arizona'},
  {id: 'AR', name: 'Arkansas'},
  {id: 'CA', name: 'California'},
  {id: 'CO', name: 'Colorado'},
  {id: 'CT', name: 'Connecticut'},
  {id: 'DE', name: 'Delaware'},
  {id: 'DC', name: 'District Of Columbia'},
  {id: 'FM', name: 'Federated States Of Micronesia'},
  {id: 'FL', name: 'Florida'},
  {id: 'GA', name: 'Georgia'},
  {id: 'GU', name: 'Guam'},
  {id: 'HI', name: 'Hawaii'},
  {id: 'ID', name: 'Idaho'},
  {id: 'IL', name: 'Illinois'},
  {id: 'IN', name: 'Indiana'},
  {id: 'IA', name: 'Iowa'},
  {id: 'KS', name: 'Kansas'},
  {id: 'KY', name: 'Kentucky'},
  {id: 'LA', name: 'Louisiana'},
  {id: 'ME', name: 'Maine'},
  {id: 'MH', name: 'Marshall Islands'},
  {id: 'MD', name: 'Maryland'},
  {id: 'MA', name: 'Massachusetts'},
  {id: 'MI', name: 'Michigan'},
  {id: 'MN', name: 'Minnesota'},
  {id: 'MS', name: 'Mississippi'},
  {id: 'MO', name: 'Missouri'},
  {id: 'MT', name: 'Montana'},
  {id: 'NE', name: 'Nebraska'},
  {id: 'NV', name: 'Nevada'},
  {id: 'NH', name: 'New Hampshire'},
  {id: 'NJ', name: 'New Jersey'},
  {id: 'NM', name: 'New Mexico'},
  {id: 'NY', name: 'New York'},
  {id: 'NC', name: 'North Carolina'},
  {id: 'ND', name: 'North Dakota'},
  {id: 'MP', name: 'Northern Mariana Islands'},
  {id: 'OH', name: 'Ohio'},
  {id: 'OK', name: 'Oklahoma'},
  {id: 'OR', name: 'Oregon'},
  {id: 'PW', name: 'Palau'},
  {id: 'PA', name: 'Pennsylvania'},
  {id: 'PR', name: 'Puerto Rico'},
  {id: 'RI', name: 'Rhode Island'},
  {id: 'SC', name: 'South Carolina'},
  {id: 'SD', name: 'South Dakota'},
  {id: 'TN', name: 'Tennessee'},
  {id: 'TX', name: 'Texas'},
  {id: 'UT', name: 'Utah'},
  {id: 'VT', name: 'Vermont'},
  {id: 'VI', name: 'Virgin Islands'},
  {id: 'VA', name: 'Virginia'},
  {id: 'WA', name: 'Washington'},
  {id: 'WV', name: 'West Virginia'},
  {id: 'WI', name: 'Wisconsin'},
  {id: 'WY', name: 'Wyoming'}
];

export const SelectManyItems: SelectStory = (args) => (
  <Select {...args}>
    <Label style={{display: 'block'}}>Test</Label>
    <Button>
      <SelectValue />
      <span aria-hidden="true" style={{paddingLeft: 5}}>▼</span>
    </Button>
    <Popover>
      <OverlayArrow>
        <svg width={12} height={12}><path d="M0 0,L6 6,L12 0" /></svg>
      </OverlayArrow>
      <ListBox items={usStateOptions} className={styles.menu}>
        {item => <MyListBoxItem>{item.name}</MyListBoxItem>}
      </ListBox>
    </Popover>
  </Select>
);

export const VirtualizedSelect: SelectStory = (args) => (
  <Select {...args}>
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
    <ListBoxLoadMoreItem style={{height: 30, width: '100%'}} {...props}>
      <LoadingSpinner style={{height: 20, width: 20, transform: 'translate(-50%, -50%)'}} />
    </ListBoxLoadMoreItem>
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
      <Button>
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

export const AsyncVirtualizedCollectionRenderSelect: StoryObj<typeof AsyncVirtualizedCollectionRenderSelectRender> = {
  render: (args) => <AsyncVirtualizedCollectionRenderSelectRender {...args} />,
  args: {
    delay: 50
  }
};

export const SelectSubmitExample: SelectStory = (args) => (
  <Form>
    <TextField
      isRequired
      autoComplete="username"
      className={styles.textfieldExample}
      name="username">
      <Label>Username</Label>
      <Input />
      <FieldError className={styles.errorMessage} />
    </TextField>
    <Select {...args} isRequired autoComplete="organization" name="company">
      <Label style={{display: 'block'}}>Company</Label>
      <Button>
        <SelectValue />
        <span aria-hidden="true" style={{paddingLeft: 5}}>
          ▼
        </span>
      </Button>
      <Popover>
        <OverlayArrow>
          <svg height={12} width={12}>
            <path d="M0 0,L6 6,L12 0" />
          </svg>
        </OverlayArrow>
        <ListBox className={styles.menu}>
          <MyListBoxItem>Adobe</MyListBoxItem>
          <MyListBoxItem>Google</MyListBoxItem>
          <MyListBoxItem>Microsoft</MyListBoxItem>
        </ListBox>
      </Popover>
      <FieldError className={styles.errorMessage} />
    </Select>
    <Button type="submit">Submit</Button>
    <Button type="reset">Reset</Button>
  </Form>
);

// Test case for https://github.com/adobe/react-spectrum/issues/8034
// Required select validation cannot currently be tested in the jsdom environment.
// In jsdom, forms are submitted even when required fields are empty.
// See: https://github.com/jsdom/jsdom/issues/2898
export const RequiredSelectWithManyItems = (props) => (
  <form>
    <Select {...props} name="select" isRequired>
      <Label style={{display: 'block'}}>Required Select with many items</Label>
      <Button>
        <SelectValue />
        <span aria-hidden="true" style={{paddingLeft: 5}}>▼</span>
      </Button>
      <FieldError />
      <Popover>
        <ListBox items={makeItems(301)} className={styles.menu}>
          {item => <MyListBoxItem>{item.name}</MyListBoxItem>}
        </ListBox>
      </Popover>
    </Select>
    <Button type="submit">Submit</Button>
  </form>
);

export const SelectScrollBug = () => {
  return (
    <div style={{display: 'flex', flexDirection: 'row', height: '100vh'}}>
      <div style={{flex: 3}}>
        Scrolling here should do nothing.
      </div>

      <div style={{flex: 1, overflowY: 'auto'}}>
        Scrolling here should scroll the right side.
        <br />
        <br />
        <br />
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Error
        voluptatibus esse qui enim neque aliquam facere velit ipsa non,
        voluptates aperiam odit minima dolorum harum! Facere eligendi officia
        ipsam mollitia!
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Error
        voluptatibus esse qui enim neque aliquam facere velit ipsa non,
        voluptates aperiam odit minima dolorum harum! Facere eligendi officia
        ipsam mollitia!
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Error
        voluptatibus esse qui enim neque aliquam facere velit ipsa non,
        voluptates aperiam odit minima dolorum harum! Facere eligendi officia
        ipsam mollitia!
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Error
        voluptatibus esse qui enim neque aliquam facere velit ipsa non,
        voluptates aperiam odit minima dolorum harum! Facere eligendi officia
        ipsam mollitia!
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Error
        voluptatibus esse qui enim neque aliquam facere velit ipsa non,
        voluptates aperiam odit minima dolorum harum! Facere eligendi officia
        ipsam mollitia!
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Error
        voluptatibus esse qui enim neque aliquam facere velit ipsa non,
        voluptates aperiam odit minima dolorum harum! Facere eligendi officia
        ipsam mollitia!
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Error
        voluptatibus esse qui enim neque aliquam facere velit ipsa non,
        voluptates aperiam odit minima dolorum harum! Facere eligendi officia
        ipsam mollitia!
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Error
        voluptatibus esse qui enim neque aliquam facere velit ipsa non,
        voluptates aperiam odit minima dolorum harum! Facere eligendi officia
        ipsam mollitia!
        <br />
        <br />
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Error
        voluptatibus esse qui enim neque aliquam facere velit ipsa non,
        voluptates aperiam odit minima dolorum harum! Facere eligendi officia
        ipsam mollitia!
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Error
        voluptatibus esse qui enim neque aliquam facere velit ipsa non,
        voluptates aperiam odit minima dolorum harum! Facere eligendi officia
        ipsam mollitia!
        <br />
        <br />
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Error
        voluptatibus esse qui enim neque aliquam facere velit ipsa non,
        voluptates aperiam odit minima dolorum harum! Facere eligendi officia
        ipsam mollitia!
        <br />
        <br />
        <br />
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Error
        voluptatibus esse qui enim neque aliquam facere velit ipsa non,
        voluptates aperiam odit minima dolorum harum! Facere eligendi officia
        ipsam mollitia!
        <br />
        <br />
        <br />
        <Select>
          <Label>Favorite Animal</Label>
          <Button>
            <SelectValue />
            <span aria-hidden="true">▼</span>
          </Button>
          <Popover>
            <ListBox>
              <MyListBoxItem>Cat</MyListBoxItem>
              <MyListBoxItem>Dog</MyListBoxItem>
              <MyListBoxItem>Kangaroo</MyListBoxItem>
            </ListBox>
          </Popover>
        </Select>
      </div>
    </div>
  );
};
