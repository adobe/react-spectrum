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
import {Autocomplete, Header, Input, Keyboard, Label, Menu, Section, Separator, Text} from 'react-aria-components';
import {MyMenuItem} from './utils';
import React from 'react';
import styles from '../example/index.css';
import {useAsyncList} from 'react-stately';
import {useFilter} from 'react-aria';

export default {
  title: 'React Aria Components',
  argTypes: {
    onAction: {
      table: {
        disable: true
      }
    }
  },
  args: {
    onAction: action('onAction')
  }
};

export const AutocompleteExample = {
  render: ({onAction}) => {
    return (
      <Autocomplete defaultInputValue="Ba" name="autocomplete-example" data-testid="autocomplete-example">
        <Label style={{display: 'block'}}>Test</Label>
        <div style={{display: 'flex'}}>
          <Input />
        </div>
        <Menu className={styles.menu} onAction={onAction}>
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
  },
  name: 'Autocomplete complex static'
};
interface AutocompleteItem {
  id: string,
  name: string
}

let items: AutocompleteItem[] = [{id: '1', name: 'Foo'}, {id: '2', name: 'Bar'}, {id: '3', name: 'Baz'}];

export const AutocompleteRenderPropsMenuDynamic = {
  render: ({onAction}) => {
    return (
      <Autocomplete>
        {() => (
          <>
            <Label style={{display: 'block'}}>Test</Label>
            <div style={{display: 'flex'}}>
              <Input />
            </div>
            <Menu className={styles.menu} items={items} onAction={onAction}>
              {item => <MyMenuItem id={item.id}>{item.name}</MyMenuItem>}
            </Menu>
          </>
        )}
      </Autocomplete>
    );
  },
  name: 'Autocomplete, render props, dynamic menu'
};

export const AutocompleteOnActionOnMenuItems = {
  render: () => {
    return (
      <Autocomplete>
        {() => (
          <>
            <Label style={{display: 'block'}}>Test</Label>
            <div style={{display: 'flex'}}>
              <Input />
            </div>
            <Menu className={styles.menu}>
              <MyMenuItem onAction={action('Foo action')}>Foo</MyMenuItem>
              <MyMenuItem onAction={action('Bar action')}>Bar</MyMenuItem>
              <MyMenuItem onAction={action('Baz action')}>Baz</MyMenuItem>
            </Menu>
          </>
        )}
      </Autocomplete>
    );
  },
  name: 'Autocomplete, onAction on menu items'
};


export const AutocompleteRenderPropsIsDisabled = {
  render: ({onAction, isDisabled}) => {
    return (
      <Autocomplete isDisabled={isDisabled}>
        {({isDisabled}) => (
          <>
            <Label style={{display: 'block'}}>Test</Label>
            <div style={{display: 'flex'}}>
              <Input />
            </div>
            <Menu className={styles.menu} items={isDisabled ? [] : items} onAction={onAction}>
              {item => <MyMenuItem id={item.id}>{item.name}</MyMenuItem>}
            </Menu>
          </>
        )}
      </Autocomplete>
    );
  },
  name: 'Autocomplete, render props, isDisabled toggle',
  argTypes: {
    isDisabled: {
      control: 'boolean'
    }
  }
};

const AsyncExample = ({onAction}) => {
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
    <Autocomplete inputValue={list.filterText} onInputChange={list.setFilterText}>
      <Label style={{display: 'block'}}>Test</Label>
      <div style={{display: 'flex'}}>
        <Input />
      </div>
      <Menu<AutocompleteItem>
        items={list.items}
        className={styles.menu}
        onAction={onAction}>
        {item => <MyMenuItem>{item.name}</MyMenuItem>}
      </Menu>
    </Autocomplete>
  );
};

export const AutocompleteAsyncLoadingExample = {
  render: ({onAction}) => {
    return <AsyncExample onAction={onAction} />;
  },
  name: 'Autocomplete, useAsync level filtering'
};


const CaseSensitiveFilter = ({onAction}) => {
  let {contains} = useFilter({
    sensitivity: 'case'
  });
  let defaultFilter = (itemText, input) => contains(itemText, input);
  return (
    <Autocomplete defaultFilter={defaultFilter}>
      {() => (
        <>
          <Label style={{display: 'block'}}>Test</Label>
          <div style={{display: 'flex'}}>
            <Input />
          </div>
          <Menu className={styles.menu} items={items} onAction={onAction}>
            {item => <MyMenuItem id={item.id}>{item.name}</MyMenuItem>}
          </Menu>
        </>
      )}
    </Autocomplete>
  );
};

export const AutocompleteCaseSensitive = {
  render: ({onAction}) => {
    return <CaseSensitiveFilter onAction={onAction} />;
  },
  name: 'Autocomplete, case sensitive filter'
};
