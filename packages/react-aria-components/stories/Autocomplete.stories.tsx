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
import {Autocomplete, Button, Dialog, Header, Input, Keyboard, Label, Menu, MenuSection, MenuTrigger, Popover, Separator, Text} from 'react-aria-components';
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
    },
    isDisabled: {
      control: 'boolean'
    },
    isReadOnly: {
      control: 'boolean'
    }
  },
  args: {
    onAction: action('onAction')
  }
};

export const AutocompleteExample = {
  render: ({onAction, isDisabled, isReadOnly}) => {
    return (
      <Autocomplete isReadOnly={isReadOnly} isDisabled={isDisabled} defaultInputValue="Ba" name="autocomplete-example" data-testid="autocomplete-example">
        <div>
          <Label style={{display: 'block'}}>Test</Label>
          <Input />
          <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
          <Menu className={styles.menu} onAction={onAction}>
            <MenuSection className={styles.group} aria-label={'Section 1'}>
              <MyMenuItem>Foo</MyMenuItem>
              <MyMenuItem>Bar</MyMenuItem>
              <MyMenuItem>Baz</MyMenuItem>
              <MyMenuItem href="http://google.com">Google</MyMenuItem>
              <MyMenuItem>Option</MyMenuItem>
              <MyMenuItem>Option with a space</MyMenuItem>
            </MenuSection>
            <Separator style={{borderTop: '1px solid gray', margin: '2px 5px'}} />
            <MenuSection className={styles.group}>
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
            </MenuSection>
          </Menu>
        </div>
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

export const AutocompleteMenuDynamic = {
  render: ({onAction, isDisabled, isReadOnly}) => {
    return (
      <Autocomplete isReadOnly={isReadOnly} isDisabled={isDisabled}>
        <div>
          <Label style={{display: 'block'}}>Test</Label>
          <Input />
          <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
          <Menu className={styles.menu} items={items} onAction={onAction}>
            {item => <MyMenuItem id={item.id}>{item.name}</MyMenuItem>}
          </Menu>
        </div>
      </Autocomplete>
    );
  },
  name: 'Autocomplete, dynamic menu'
};

export const AutocompleteRenderPropsIsDisabled = {
  render: ({onAction, isDisabled, isReadOnly}) => {
    return (
      <Autocomplete isReadOnly={isReadOnly} isDisabled={isDisabled}>
        {({isDisabled}) => (
          <div>
            <Label style={{display: 'block'}}>Test</Label>
            <Input />
            <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
            <Menu className={styles.menu} items={isDisabled ? [] : items} onAction={onAction}>
              {item => <MyMenuItem id={item.id}>{item.name}</MyMenuItem>}
            </Menu>
          </div>
        )}
      </Autocomplete>
    );
  },
  name: 'Autocomplete, render props, custom menu isDisabled behavior'
};

export const AutocompleteOnActionOnMenuItems = {
  render: ({isDisabled, isReadOnly}) => {
    return (
      <Autocomplete isDisabled={isDisabled} isReadOnly={isReadOnly}>
        <div>
          <Label style={{display: 'block'}}>Test</Label>
          <Input />
          <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
          <Menu className={styles.menu}>
            <MyMenuItem onAction={action('Foo action')}>Foo</MyMenuItem>
            <MyMenuItem onAction={action('Bar action')}>Bar</MyMenuItem>
            <MyMenuItem onAction={action('Baz action')}>Baz</MyMenuItem>
          </Menu>
        </div>
      </Autocomplete>
    );
  },
  name: 'Autocomplete, onAction on menu items'
};

export const AutocompleteDisabledKeys = {
  render: ({onAction, isDisabled, isReadOnly}) => {
    return (
      <Autocomplete isDisabled={isDisabled} isReadOnly={isReadOnly}>
        <div>
          <Label style={{display: 'block'}}>Test</Label>
          <Input />
          <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
          <Menu className={styles.menu} items={items} onAction={onAction} disabledKeys={['2']}>
            {item => <MyMenuItem id={item.id}>{item.name}</MyMenuItem>}
          </Menu>
        </div>
      </Autocomplete>
    );
  },
  name: 'Autocomplete, disabled key'
};

const AsyncExample = ({onAction, isDisabled, isReadOnly}) => {
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
    <Autocomplete isDisabled={isDisabled} isReadOnly={isReadOnly} inputValue={list.filterText} onInputChange={list.setFilterText}>
      <div>
        <Label style={{display: 'block'}}>Test</Label>
        <Input />
        <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
        <Menu<AutocompleteItem>
          items={items}
          className={styles.menu}
          onAction={onAction}>
          {item => <MyMenuItem>{item.name}</MyMenuItem>}
        </Menu>
      </div>
    </Autocomplete>
  );
};

export const AutocompleteAsyncLoadingExample = {
  render: (args) => {
    return <AsyncExample {...args} />;
  },
  name: 'Autocomplete, useAsync level filtering'
};


const CaseSensitiveFilter = ({onAction, isDisabled, isReadOnly}) => {
  let {contains} = useFilter({
    sensitivity: 'case'
  });
  let defaultFilter = (itemText, input) => contains(itemText, input);
  return (
    <Autocomplete isDisabled={isDisabled} isReadOnly={isReadOnly} defaultFilter={defaultFilter}>
      <div>
        <Label style={{display: 'block'}}>Test</Label>
        <Input />
        <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
        <Menu className={styles.menu} items={items} onAction={onAction}>
          {item => <MyMenuItem id={item.id}>{item.name}</MyMenuItem>}
        </Menu>
      </div>
    </Autocomplete>
  );
};

export const AutocompleteCaseSensitive = {
  render: (args) => {
    return <CaseSensitiveFilter {...args} />;
  },
  name: 'Autocomplete, case sensitive filter'
};

// TODO: how would we handle this for a DialogTrigger? I guess we could automatically grab the overlaytrigger state from context and send a onAction that gets chained by the one provided
// to Menu
export const AutocompleteInPopover = {
  render: ({onAction, isDisabled, isReadOnly}) => {
    return (
      <MenuTrigger>
        <Button>
          Open popover
        </Button>
        <Popover
          placement="bottom start"
          style={{
            background: 'Canvas',
            color: 'CanvasText',
            border: '1px solid gray',
            padding: 20
          }}>
          <Dialog>
            <Autocomplete isReadOnly={isReadOnly} isDisabled={isDisabled}>
              <div>
                <Label style={{display: 'block'}}>Test</Label>
                <Input autoFocus />
                <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
                <Menu className={styles.menu} items={items} onAction={onAction}>
                  {item => <MyMenuItem id={item.id}>{item.name}</MyMenuItem>}
                </Menu>
              </div>
            </Autocomplete>
          </Dialog>
        </Popover>
      </MenuTrigger>

    );
  },
  name: 'Autocomplete in popover'
};
