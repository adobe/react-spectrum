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

import {AriaAutocompleteTests} from './AriaAutoComplete.test-util';
import {Autocomplete, Header, Input, Label, Menu, MenuItem, MenuSection, SearchField, Separator, Text} from '..';
import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';

interface AutocompleteItem {
  id: string,
  name: string
}

let items: AutocompleteItem[] = [{id: '1', name: 'Foo'}, {id: '2', name: 'Bar'}, {id: '3', name: 'Baz'}];

let StaticAutocomplete = ({autocompleteProps = {}, inputProps = {}, menuProps = {}}: {autocompleteProps?: any, inputProps?: any, menuProps?: any}) => (
  <Autocomplete {...autocompleteProps}>
    <SearchField {...inputProps}>
      <Label style={{display: 'block'}}>Test</Label>
      <Input />
      <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
    </SearchField>
    <Menu {...menuProps}>
      <MenuItem id="1">Foo</MenuItem>
      <MenuItem id="2">Bar</MenuItem>
      <MenuItem id="3">Baz</MenuItem>
    </Menu>
  </Autocomplete>
);

let DynamicAutoComplete = ({autocompleteProps = {}, inputProps = {}, menuProps = {}}: {autocompleteProps?: any, inputProps?: any, menuProps?: any}) => (
  <Autocomplete {...autocompleteProps}>
    <SearchField {...inputProps}>
      <Label style={{display: 'block'}}>Test</Label>
      <Input />
      <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
    </SearchField>
    <Menu {...menuProps} items={items}>
      {(item: AutocompleteItem) => <MenuItem id={item.id}>{item.name}</MenuItem>}
    </Menu>
  </Autocomplete>
);

let WithLinks = ({autocompleteProps = {}, inputProps = {}, menuProps = {}}: {autocompleteProps?: any, inputProps?: any, menuProps?: any}) => (
  <Autocomplete {...autocompleteProps}>
    <SearchField {...inputProps}>
      <Label style={{display: 'block'}}>Test</Label>
      <Input />
      <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
    </SearchField>
    <Menu {...menuProps}>
      <MenuItem id="1">Foo</MenuItem>
      <MenuItem id="2">Bar</MenuItem>
      <MenuItem id="3" href="https://google.com">Google</MenuItem>
    </Menu>
  </Autocomplete>
);

let ControlledAutocomplete = ({autocompleteProps = {}, inputProps = {}, menuProps = {}}: {autocompleteProps?: any, inputProps?: any, menuProps?: any}) => {
  let [inputValue, setInputValue] = React.useState('');

  return (
    <Autocomplete inputValue={inputValue} onInputChange={setInputValue} {...autocompleteProps}>
      <SearchField {...inputProps}>
        <Label style={{display: 'block'}}>Test</Label>
        <Input />
        <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
      </SearchField>
      <Menu {...menuProps}>
        <MenuItem id="1">Foo</MenuItem>
        <MenuItem id="2">Bar</MenuItem>
        <MenuItem id="3">Baz</MenuItem>
      </Menu>
    </Autocomplete>
  );
};

let MenuSectionsAutocomplete = ({autocompleteProps = {}, inputProps = {}, menuProps = {}}: {autocompleteProps?: any, inputProps?: any, menuProps?: any}) => (
  <Autocomplete {...autocompleteProps}>
    <SearchField {...inputProps}>
      <Label style={{display: 'block'}}>Test</Label>
      <Input />
      <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
    </SearchField>
    <Menu {...menuProps}>
      <MenuSection id="sec1">
        <Header>MenuSection 1</Header>
        <MenuItem id="1">Foo</MenuItem>
        <MenuItem id="2">Bar</MenuItem>
        <MenuItem id="3">Baz</MenuItem>
      </MenuSection>
      <Separator />
      <MenuSection id="sec2">
        <Header>MenuSection 2</Header>
        <MenuItem id="4">Copy</MenuItem>
        <MenuItem id="5">Cut</MenuItem>
        <MenuItem id="6">Paste</MenuItem>
      </MenuSection>
    </Menu>
  </Autocomplete>
);

AriaAutocompleteTests({
  prefix: 'rac-static',
  renderers: {
    standard: ({autocompleteProps, inputProps, menuProps}) => render(
      <StaticAutocomplete autocompleteProps={autocompleteProps} inputProps={inputProps} menuProps={menuProps} />
    ),
    links: ({autocompleteProps, inputProps, menuProps}) => render(
      <WithLinks autocompleteProps={autocompleteProps} inputProps={inputProps} menuProps={menuProps} />
    ),
    sections: ({autocompleteProps, inputProps, menuProps}) => render(
      <MenuSectionsAutocomplete autocompleteProps={autocompleteProps} inputProps={inputProps} menuProps={menuProps} />
    ),
    controlled: ({autocompleteProps, inputProps, menuProps}) => render(
      <ControlledAutocomplete autocompleteProps={autocompleteProps} inputProps={inputProps} menuProps={menuProps} />
    )
  }
});

AriaAutocompleteTests({
  prefix: 'rac-dynamic',
  renderers: {
    standard: ({autocompleteProps, inputProps, menuProps}) => render(
      <DynamicAutoComplete autocompleteProps={autocompleteProps} inputProps={inputProps} menuProps={menuProps} />
    )
  }
});
