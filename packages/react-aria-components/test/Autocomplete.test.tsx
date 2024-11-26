/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaAutocompleteTests} from './AriaAutocomplete.test-util';
import {Autocomplete, Header, Input, Label, ListBox, ListBoxItem, ListBoxSection, Menu, MenuItem, MenuSection, SearchField, Separator, Text} from '..';
import React, {ReactNode} from 'react';
import {render} from '@react-spectrum/test-utils-internal';

interface AutocompleteItem {
  id: string,
  name: string
}

let items: AutocompleteItem[] = [{id: '1', name: 'Foo'}, {id: '2', name: 'Bar'}, {id: '3', name: 'Baz'}];

let StaticMenu = (props) => (
  <Menu {...props}>
    <MenuItem id="1">Foo</MenuItem>
    <MenuItem id="2">Bar</MenuItem>
    <MenuItem id="3">Baz</MenuItem>
  </Menu>
);

let DynamicMenu = (props) => (
  <Menu {...props} items={items}>
    {(item: AutocompleteItem) => <MenuItem id={item.id}>{item.name}</MenuItem>}
  </Menu>
);

let MenuWithLinks = (props) => (
  <Menu {...props}>
    <MenuItem id="1">Foo</MenuItem>
    <MenuItem id="2">Bar</MenuItem>
    <MenuItem id="3" href="https://google.com">Google</MenuItem>
  </Menu>
);

let MenuWithSections = (props) => (
  <Menu {...props}>
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
);

let StaticListbox = (props) => (
  <ListBox {...props}>
    <ListBoxItem id="1">Foo</ListBoxItem>
    <ListBoxItem id="2">Bar</ListBoxItem>
    <ListBoxItem id="3">Baz</ListBoxItem>
  </ListBox>
);

let ListBoxWithLinks = (props) => (
  <ListBox {...props}>
    <ListBoxItem id="1">Foo</ListBoxItem>
    <ListBoxItem id="2">Bar</ListBoxItem>
    <ListBoxItem id="3" href="https://google.com">Google</ListBoxItem>
  </ListBox>
);

let ListBoxWithSections = (props) => (
  <ListBox {...props}>
    <ListBoxSection id="sec1">
      <Header>ListBox Section 1</Header>
      <ListBoxItem id="1">Foo</ListBoxItem>
      <ListBoxItem id="2">Bar</ListBoxItem>
      <ListBoxItem id="3">Baz</ListBoxItem>
    </ListBoxSection>
    <Separator />
    <ListBoxSection id="sec2">
      <Header>ListBox Section 2</Header>
      <ListBoxItem id="4">Copy</ListBoxItem>
      <ListBoxItem id="5">Cut</ListBoxItem>
      <ListBoxItem id="6">Paste</ListBoxItem>
    </ListBoxSection>
  </ListBox>
);

let AutocompleteWrapper = ({autocompleteProps = {}, inputProps = {}, children}: {autocompleteProps?: any, inputProps?: any, collectionProps?: any, children?: ReactNode}) => (
  <Autocomplete {...autocompleteProps}>
    <SearchField {...inputProps}>
      <Label style={{display: 'block'}}>Test</Label>
      <Input />
      <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
    </SearchField>
    {children}
  </Autocomplete>
);

let ControlledAutocomplete = ({autocompleteProps = {}, inputProps = {}, children}: {autocompleteProps?: any, inputProps?: any, collectionProps?: any, children?: ReactNode}) => {
  let [inputValue, setInputValue] = React.useState('');

  return (
    <Autocomplete inputValue={inputValue} onInputChange={setInputValue} {...autocompleteProps}>
      <SearchField {...inputProps}>
        <Label style={{display: 'block'}}>Test</Label>
        <Input />
        <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
      </SearchField>
      {children}
    </Autocomplete>
  );
};

AriaAutocompleteTests({
  prefix: 'rac-static-menu',
  renderers: {
    standard: ({autocompleteProps, inputProps, collectionProps}) => render(
      <AutocompleteWrapper autocompleteProps={autocompleteProps} inputProps={inputProps}>
        <StaticMenu {...collectionProps} />
      </AutocompleteWrapper>
    ),
    links: ({autocompleteProps, inputProps, collectionProps}) => render(
      <AutocompleteWrapper autocompleteProps={autocompleteProps} inputProps={inputProps}>
        <MenuWithLinks {...collectionProps} />
      </AutocompleteWrapper>
    ),
    sections: ({autocompleteProps, inputProps, collectionProps}) => render(
      <AutocompleteWrapper autocompleteProps={autocompleteProps} inputProps={inputProps}>
        <MenuWithSections {...collectionProps} />
      </AutocompleteWrapper>
    ),
    controlled: ({autocompleteProps, inputProps, collectionProps}) => render(
      <ControlledAutocomplete autocompleteProps={autocompleteProps} inputProps={inputProps}>
        <StaticMenu {...collectionProps} />
      </ControlledAutocomplete>
    )
  }
});

AriaAutocompleteTests({
  prefix: 'rac-dynamic-menu',
  renderers: {
    standard: ({autocompleteProps, inputProps, collectionProps}) => render(
      <AutocompleteWrapper autocompleteProps={autocompleteProps} inputProps={inputProps}>
        <DynamicMenu {...collectionProps} />
      </AutocompleteWrapper>
    )
  }
});

AriaAutocompleteTests({
  prefix: 'rac-static-listbox',
  renderers: {
    standard: ({autocompleteProps, inputProps, collectionProps}) => render(
      <AutocompleteWrapper autocompleteProps={autocompleteProps} inputProps={inputProps}>
        <StaticListbox {...collectionProps} />
      </AutocompleteWrapper>
    ),
    links: ({autocompleteProps, inputProps, collectionProps}) => render(
      <AutocompleteWrapper autocompleteProps={autocompleteProps} inputProps={inputProps}>
        <ListBoxWithLinks {...collectionProps} />
      </AutocompleteWrapper>
    ),
    sections: ({autocompleteProps, inputProps, collectionProps}) => render(
      <AutocompleteWrapper autocompleteProps={autocompleteProps} inputProps={inputProps}>
        <ListBoxWithSections {...collectionProps} />
      </AutocompleteWrapper>
    ),
    controlled: ({autocompleteProps, inputProps, collectionProps}) => render(
      <ControlledAutocomplete autocompleteProps={autocompleteProps} inputProps={inputProps}>
        <StaticListbox {...collectionProps} />
      </ControlledAutocomplete>
    )
  },
  collectionType: 'listbox'
});
