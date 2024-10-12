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

import {Autocomplete, Header, Input, Keyboard, Label, Menu, Section, Separator, Text} from 'react-aria-components';
import {MyMenuItem} from './utils';
import React from 'react';
import styles from '../example/index.css';
import {useAsyncList} from 'react-stately';

export default {
  title: 'React Aria Components'
};

export const AutocompleteExample = () => (
  <Autocomplete name="autocomplete-example" data-testid="autocomplete-example">
    <Label style={{display: 'block'}}>Test</Label>
    <div style={{display: 'flex'}}>
      <Input />
    </div>
    <Menu className={styles.menu}>
      <Section className={styles.group} aria-label={'Section 1'}>
        <MyMenuItem>Foo</MyMenuItem>
        <MyMenuItem>Bar</MyMenuItem>
        <MyMenuItem>Baz</MyMenuItem>
        <MyMenuItem href="http://google.com">Google</MyMenuItem>
      </Section>
      <Separator style={{borderTop: '1px solid gray', margin: '2px 5px'}} />
      <Section className={styles.group}>
        <Header style={{fontSize: '1.2em'}}>Section 2</Header>
        <MyMenuItem textValue="Copy">
          <Text slot="label">Copy</Text>
          <Text slot="description">Description</Text>
          <Keyboard>⌘C</Keyboard>
        </MyMenuItem>
        <MyMenuItem textValue="Cut">
          <Text slot="label">Cut</Text>
          <Text slot="description">Description</Text>
          <Keyboard>⌘X</Keyboard>
        </MyMenuItem>
        <MyMenuItem textValue="Paste">
          <Text slot="label">Paste</Text>
          <Text slot="description">Description</Text>
          <Keyboard>⌘V</Keyboard>
        </MyMenuItem>
      </Section>
    </Menu>
  </Autocomplete>
);

interface AutocompleteItem {
  id: string,
  name: string
}

let items: AutocompleteItem[] = [{id: '1', name: 'Foo'}, {id: '2', name: 'Bar'}, {id: '3', name: 'Baz'}];
export const AutocompleteRenderPropsStatic = () => (
  <Autocomplete data-testid="autocomplete-render-props-static">
    {() => (
      <>
        <Label style={{display: 'block'}}>Test</Label>
        <div style={{display: 'flex'}}>
          <Input />
        </div>
        <Menu className={styles.menu}>
          <MyMenuItem>Foo</MyMenuItem>
          <MyMenuItem>Bar</MyMenuItem>
          <MyMenuItem>Baz</MyMenuItem>
        </Menu>
      </>
    )}
  </Autocomplete>
);

export const AutocompleteRenderPropsDefaultItems = () => (
  <Autocomplete defaultItems={items}>
    {() => (
      <>
        <Label style={{display: 'block'}}>Test</Label>
        <div style={{display: 'flex'}}>
          <Input />
        </div>
        <Menu className={styles.menu}>
          {(item: AutocompleteItem) => <MyMenuItem id={item.id}>{item.name}</MyMenuItem>}
        </Menu>
      </>
    )}
  </Autocomplete>
);

export const AutocompleteRenderPropsItems = {
  render: () => (
    <Autocomplete items={items}>
      {() => (
        <>
          <Label style={{display: 'block'}}>Test</Label>
          <div style={{display: 'flex'}}>
            <Input />
          </div>
          <Menu className={styles.menu}>
            {(item: AutocompleteItem) => <MyMenuItem id={item.id}>{item.name}</MyMenuItem>}
          </Menu>
        </>
      )}
    </Autocomplete>
  ),
  parameters: {
    description: {
      data: 'Note this won\'t filter the items in the Menu because it is fully controlled'
    }
  }
};

export const AutocompleteRenderPropsMenuDynamic = () => (
  <Autocomplete>
    {() => (
      <>
        <Label style={{display: 'block'}}>Test</Label>
        <div style={{display: 'flex'}}>
          <Input />
        </div>
        <Menu className={styles.menu} items={items}>
          {item => <MyMenuItem id={item.id}>{item.name}</MyMenuItem>}
        </Menu>
      </>
    )}
  </Autocomplete>
);

export const AutocompleteAsyncLoadingExample = () => {
  let list = useAsyncList<AutocompleteItem>({
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
      }) as AutocompleteItem[];

      return {
        items: json
      };
    }
  });

  return (
    <Autocomplete items={list.items} inputValue={list.filterText} onInputChange={list.setFilterText}>
      <Label style={{display: 'block'}}>Test</Label>
      <div style={{display: 'flex'}}>
        <Input />
      </div>
      <Menu<AutocompleteItem>
        className={styles.menu}>
        {item => <MyMenuItem>{item.name}</MyMenuItem>}
      </Menu>
    </Autocomplete>
  );
};
