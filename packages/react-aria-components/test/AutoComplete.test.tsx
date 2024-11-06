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

import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {AriaAutocompleteTests} from './AriaAutoComplete.test-util';
import {Autocomplete, Header, Input, Keyboard, Label, Menu, MenuItem, Section, Separator, Text} from '..';
import React from 'react';
import userEvent from '@testing-library/user-event';

let TestAutocomplete = ({autocompleteProps = {}, menuProps = {}}: {autocompleteProps?: any, menuProps?: any}) => (
  <Autocomplete data-testid="autocomplete-example" {...autocompleteProps}>
    <Label>Test</Label>
    <Input />
    <Text slot="description">Please select an option below.</Text>
    <Menu {...menuProps}>
      <Section aria-label={'Section 1'}>
        <MenuItem>Foo</MenuItem>
        <MenuItem>Bar</MenuItem>
        <MenuItem>Baz</MenuItem>
        <MenuItem href="https://google.com">Google</MenuItem>
      </Section>
      <Separator />
      <Section>
        <Header>Section 2</Header>
        <MenuItem textValue="Copy">
          <Text slot="label">Copy</Text>
          <Text slot="description">Description</Text>
          <Keyboard>⌘C</Keyboard>
        </MenuItem>
        <MenuItem textValue="Cut">
          <Text slot="label">Cut</Text>
          <Text slot="description">Description</Text>
          <Keyboard>⌘X</Keyboard>
        </MenuItem>
        <MenuItem textValue="Paste">
          <Text slot="label">Paste</Text>
          <Text slot="description">Description</Text>
          <Keyboard>⌘V</Keyboard>
        </MenuItem>
      </Section>
    </Menu>
  </Autocomplete>
);

let renderAutoComplete = (autocompleteProps = {}, menuProps = {}) => render(<TestAutocomplete {...{autocompleteProps, menuProps}} />);

describe('Menu', () => {
  let user;

  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {jest.runAllTimers();});
  });

  it('dummy test for now', async function () {
    renderAutoComplete();
    await user.tab();
  });

  // TODO: RAC specific tests go here (renderProps, data attributes, etc)
});

let StaticAutocomplete = ({autocompleteProps = {}, menuProps = {}}: {autocompleteProps?: any, menuProps?: any}) => (
  <Autocomplete data-testid="autocomplete-example" {...autocompleteProps}>
    <Label>Test</Label>
    <Input />
    <Text slot="description">Please select an option below.</Text>
    <Menu {...menuProps}>
      <MenuItem id="1">Foo</MenuItem>
      <MenuItem id="2">Bar</MenuItem>
      <MenuItem id="3">Baz</MenuItem>
    </Menu>
  </Autocomplete>
);

interface AutocompleteItem {
  id: string,
  name: string
}
let items: AutocompleteItem[] = [{id: '1', name: 'Foo'}, {id: '2', name: 'Bar'}, {id: '3', name: 'Baz'}];

let DynamicAutoComplete = ({autocompleteProps = {}, menuProps = {}}: {autocompleteProps?: any, menuProps?: any}) => (
  <Autocomplete {...autocompleteProps}>
    <Label>Test</Label>
    <Input />
    <Text slot="description">Please select an option below.</Text>
    <Menu {...menuProps} items={items}>
      {(item: AutocompleteItem) => <MenuItem id={item.id}>{item.name}</MenuItem>}
    </Menu>
  </Autocomplete>
);

let WithLinks = ({autocompleteProps = {}, menuProps = {}}: {autocompleteProps?: any, menuProps?: any}) => (
  <Autocomplete {...autocompleteProps}>
    <Label>Test</Label>
    <Input />
    <Text slot="description">Please select an option below.</Text>
    <Menu {...menuProps}>
      <MenuItem id="1">Foo</MenuItem>
      <MenuItem id="2">Bar</MenuItem>
      <MenuItem id="3" href="https://google.com">Google</MenuItem>
    </Menu>
  </Autocomplete>
);

let ControlledAutocomplete = ({autocompleteProps = {}, menuProps = {}}: {autocompleteProps?: any, menuProps?: any}) => {
  let [inputValue, setInputValue] = React.useState('');

  return (
    <Autocomplete inputValue={inputValue} onInputChange={setInputValue} {...autocompleteProps}>
      <Label>Test</Label>
      <Input />
      <Text slot="description">Please select an option below.</Text>
      <Menu {...menuProps} items={items}>
        {(item: AutocompleteItem) => <MenuItem id={item.id}>{item.name}</MenuItem>}
      </Menu>
    </Autocomplete>
  );
};

let SectionsAutocomplete = ({autocompleteProps = {}, menuProps = {}}: {autocompleteProps?: any, menuProps?: any}) => (
  <Autocomplete {...autocompleteProps}>
    <Label>Test</Label>
    <Input />
    <Text slot="description">Please select an option below.</Text>
    <Menu {...menuProps}>
      <Section id="sec1">
        <Header>Section 1</Header>
        <MenuItem id="1">Foo</MenuItem>
        <MenuItem id="2">Bar</MenuItem>
        <MenuItem id="3">Baz</MenuItem>
      </Section>
      <Separator />
      <Section id="sec2">
        <Header>Section 2</Header>
        <MenuItem id="4">Copy</MenuItem>
        <MenuItem id="5">Cut</MenuItem>
        <MenuItem id="6">Paste</MenuItem>
      </Section>
    </Menu>
  </Autocomplete>
);

AriaAutocompleteTests({
  prefix: 'rac-static',
  renderers: {
    standard: ({autocompleteProps, menuProps}) => render(
      <StaticAutocomplete autocompleteProps={autocompleteProps} menuProps={menuProps} />
    ),
    links: ({autocompleteProps, menuProps}) => render(
      <WithLinks autocompleteProps={autocompleteProps} menuProps={menuProps} />
    ),
    sections: ({autocompleteProps, menuProps}) => render(
      <SectionsAutocomplete autocompleteProps={autocompleteProps} menuProps={menuProps} />
    ),
  }
});

AriaAutocompleteTests({
  prefix: 'rac-dynamic',
  renderers: {
    standard: ({autocompleteProps, menuProps}) => render(
      <DynamicAutoComplete autocompleteProps={autocompleteProps} menuProps={menuProps} />
    )
  }
});

// TODO: maybe a bit overkill to run all the tests just for a controlled configuration, ideally would just have a
// subset of filter specific tests
// AriaAutocompleteTests({
//   prefix: 'rac-controlled',
//   renderers: {
//     standard: ({autocompleteProps, menuProps}) => render(
//       <ControlledAutocomplete autocompleteProps={autocompleteProps} menuProps={menuProps} />
//     )
//   }
// });
