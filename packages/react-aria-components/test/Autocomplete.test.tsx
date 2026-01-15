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

import './installPointerEvent';
import {act, pointerMap, render, within} from '@react-spectrum/test-utils-internal';
import {AriaAutocompleteTests} from './AriaAutocomplete.test-util';
import {Autocomplete, Breadcrumb, Breadcrumbs, Button, Cell, Collection, Column, Dialog, DialogTrigger, GridList, GridListItem, Header, Input, Label, ListBox, ListBoxItem, ListBoxLoadMoreItem, ListBoxSection, Menu, MenuItem, MenuSection, Popover, Row, SearchField, Select, SelectValue, Separator, SubmenuTrigger, Tab, Table, TableBody, TableHeader, TabList, TabPanel, Tabs, Tag, TagGroup, TagList, Text, TextField, Tree, TreeItem, TreeItemContent} from '..';
import React, {ReactNode, useState} from 'react';
import {useAsyncList} from 'react-stately';
import {useFilter} from '@react-aria/i18n';
import userEvent from '@testing-library/user-event';

interface AutocompleteItem {
  id: string,
  name: string
}

let items: AutocompleteItem[] = [{id: '1', name: 'Foo'}, {id: '2', name: 'Bar'}, {id: '3', name: 'Baz'}];
let onAction = jest.fn();
let onSelectionChange = jest.fn();

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

let SubMenus = (props) => (
  <Menu {...props}>
    <MenuItem>Foo</MenuItem>
    <SubmenuTrigger>
      <MenuItem>Bar</MenuItem>
      <Popover>
        <Menu {...props}>
          <MenuItem>Lvl 1 Bar 1</MenuItem>
          <SubmenuTrigger>
            <MenuItem>Lvl 1 Bar 2</MenuItem>
            <Popover>
              <Menu {...props}>
                <MenuItem>Lvl 2 Bar 1</MenuItem>
                <MenuItem>Lvl 2 Bar 2</MenuItem>
                <MenuItem>Lvl 2 Bar 3</MenuItem>
              </Menu>
            </Popover>
          </SubmenuTrigger>
          <MenuItem >Lvl 1 Bar 3</MenuItem>
        </Menu>
      </Popover>
    </SubmenuTrigger>
    <MenuItem id="3">Baz</MenuItem>
  </Menu>
);

let SubDialogs = (props) => (
  <Menu {...props}>
    <MenuItem>Foo</MenuItem>
    <SubmenuTrigger>
      <MenuItem>Bar</MenuItem>
      <Popover>
        <AutocompleteWrapper inputProps={{autoFocus: true}}>
          <Menu {...props}>
            <MenuItem>Lvl 1 Bar 1</MenuItem>
            <SubmenuTrigger>
              <MenuItem>Lvl 1 Bar 2</MenuItem>
              <Popover>
                <AutocompleteWrapper inputProps={{autoFocus: true}}>
                  <Menu {...props}>
                    <MenuItem>Lvl 2 Bar 1</MenuItem>
                    <MenuItem>Lvl 2 Bar 2</MenuItem>
                    <MenuItem>Lvl 2 Bar 3</MenuItem>
                  </Menu>
                </AutocompleteWrapper>
              </Popover>
            </SubmenuTrigger>
            <MenuItem >Lvl 1 Bar 3</MenuItem>
          </Menu>
        </AutocompleteWrapper>
      </Popover>
    </SubmenuTrigger>
    <MenuItem id="3">Baz</MenuItem>
  </Menu>
);

let SubDialogAndMenu = (props) => (
  <Menu {...props}>
    <MenuItem>Foo</MenuItem>
    <SubmenuTrigger>
      <MenuItem>Bar</MenuItem>
      <Popover>
        <AutocompleteWrapper inputProps={{autoFocus: true}}>
          <Menu {...props}>
            <MenuItem>Lvl 1 Bar 1</MenuItem>
            <SubmenuTrigger>
              <MenuItem>Lvl 1 Bar 2</MenuItem>
              <Popover>
                <Menu {...props}>
                  <MenuItem>Lvl 2 Bar 1</MenuItem>
                  <SubmenuTrigger>
                    <MenuItem>Lvl 2 Bar 2</MenuItem>
                    <Popover>
                      <AutocompleteWrapper inputProps={{autoFocus: true}}>
                        <Menu {...props}>
                          <MenuItem>Lvl 3 Bar 1</MenuItem>
                          <MenuItem>Lvl 3 Bar 2</MenuItem>
                          <MenuItem>Lvl 3 Bar 3</MenuItem>
                        </Menu>
                      </AutocompleteWrapper>
                    </Popover>
                  </SubmenuTrigger>
                  <MenuItem>Lvl 2 Bar 3</MenuItem>
                </Menu>
              </Popover>
            </SubmenuTrigger>
            <MenuItem >Lvl 1 Bar 3</MenuItem>
          </Menu>
        </AutocompleteWrapper>
      </Popover>
    </SubmenuTrigger>
    <MenuItem id="3">Baz</MenuItem>
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

let StaticGridList = (props) => (
  <GridList aria-label="test gridlist" {...props}>
    <GridListItem id="1">Foo</GridListItem>
    <GridListItem id="2">Bar</GridListItem>
    <GridListItem id="3">Baz</GridListItem>
  </GridList>
);

let StaticTable = (props) => (
  <Table aria-label="test table" {...props}>
    <TableHeader>
      <Column isRowHeader>Column 1</Column>
      <Column>Column 2</Column>
      <Column>Column 3</Column>
    </TableHeader>
    <TableBody>
      <Row>
        <Cell>Foo</Cell>
        <Cell>Row 1 Cell 2</Cell>
        <Cell>Row 1 Cell 3</Cell>
      </Row>
      <Row>
        <Cell>Bar</Cell>
        <Cell>Row 2 Cell 2</Cell>
        <Cell>Row 2 Cell 3</Cell>
      </Row>
      <Row>
        <Cell>Baz</Cell>
        <Cell>Row 3 Cell 2</Cell>
        <Cell>Row 3 Cell 3</Cell>
      </Row>
    </TableBody>
  </Table>
);

let StaticTagGroup = (props) => (
  <TagGroup {...props}>
    <Label>Test tag group</Label>
    <TagList>
      <Tag>Foo</Tag>
      <Tag>Bar</Tag>
      <Tag>Baz</Tag>
    </TagList>
  </TagGroup>
);

let StaticTabs = (props) => (
  <Tabs {...props}>
    <TabList aria-label="Test tabs">
      <Tab id="1">Foo</Tab>
      <Tab id="2">Bar</Tab>
      <Tab id="3">Baz</Tab>
    </TabList>
    <TabPanel id="1">Foo content</TabPanel>
    <TabPanel id="2">Bar content</TabPanel>
    <TabPanel id="3">Baz content</TabPanel>
  </Tabs>
);

let StaticTree = (props) => (
  <Tree aria-label="test tree" {...props}>
    <TreeItem textValue="Foo">
      <TreeItemContent>
        Foo
      </TreeItemContent>
    </TreeItem>
    <TreeItem textValue="Bar">
      <TreeItemContent>
        Bar
      </TreeItemContent>
    </TreeItem>
    <TreeItem textValue="Baz">
      <TreeItemContent>
        Baz
      </TreeItemContent>
    </TreeItem>
  </Tree>
);

let StaticBreadcrumbs = (props) => (
  <Breadcrumbs {...props}>
    <Breadcrumb>Foo</Breadcrumb>
    <Breadcrumb>Bar</Breadcrumb>
    <Breadcrumb>Baz</Breadcrumb>
  </Breadcrumbs>
);

let AutocompleteWrapper = ({autocompleteProps = {}, inputProps = {}, children}: {autocompleteProps?: any, inputProps?: any, children?: ReactNode}) => {
  let {contains} = useFilter({sensitivity: 'base'});
  let filter = (textValue, inputValue) => contains(textValue, inputValue);

  return (
    <Autocomplete filter={filter} {...autocompleteProps}>
      <SearchField {...inputProps}>
        <Label style={{display: 'block'}}>Test</Label>
        <Input />
        <Button>✕</Button>
        <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
      </SearchField>
      {children}
    </Autocomplete>
  );
};

let ControlledAutocomplete = ({autocompleteProps = {}, inputProps = {}, children}: {autocompleteProps?: any, inputProps?: any, children?: ReactNode}) => {
  let [inputValue, setInputValue] = React.useState('');
  let {contains} = useFilter({sensitivity: 'base'});
  let filter = (textValue, inputValue) => contains(textValue, inputValue);

  return (
    <Autocomplete inputValue={inputValue} onInputChange={setInputValue} filter={filter} {...autocompleteProps}>
      <SearchField {...inputProps}>
        <Label style={{display: 'block'}}>Test</Label>
        <Input />
        <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
      </SearchField>
      {children}
    </Autocomplete>
  );
};

let AsyncFiltering = ({autocompleteProps = {}, inputProps = {}}: {autocompleteProps?: any, inputProps?: any, children?: ReactNode}) => {
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
    <Autocomplete inputValue={list.filterText} onInputChange={list.setFilterText} {...autocompleteProps}>
      <SearchField {...inputProps}>
        <Label style={{display: 'block'}}>Test</Label>
        <Input />
        <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
      </SearchField>
      <Menu
        items={list.items}
        onAction={onAction}
        onSelectionChange={onSelectionChange}>
        {item => <MenuItem id={item.id}>{item.name}</MenuItem>}
      </Menu>
    </Autocomplete>
  );
};

let CustomFiltering = ({autocompleteProps = {}, inputProps = {}, children}: {autocompleteProps?: any, inputProps?: any, children?: ReactNode}) => {
  let [inputValue, setInputValue] = React.useState('');
  let {contains} = useFilter({sensitivity: 'base'});
  let filter = (textValue, inputValue, node) => {
    if (node.parentKey === 'sec1') {
      return true;
    }
    return contains(textValue, inputValue);
  };

  return (
    <Autocomplete inputValue={inputValue} onInputChange={setInputValue} filter={filter} {...autocompleteProps}>
      <SearchField {...inputProps}>
        <Label style={{display: 'block'}}>Test</Label>
        <Input />
        <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
      </SearchField>
      {children}
    </Autocomplete>
  );
};

describe('Autocomplete', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => jest.runAllTimers());
  });

  // Skipping since arrow keys will still leak out from useSelectableCollection, re-enable when that gets fixed
  it.skip('should prevent key presses from leaking out of the Autocomplete', async () => {
    let onKeyDown = jest.fn();
    let {getByRole} = render(
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div onKeyDown={onKeyDown}>
        <AutocompleteWrapper>
          <StaticMenu />
        </AutocompleteWrapper>
      </div>
    );

    let input = getByRole('searchbox');
    await user.tab();
    expect(document.activeElement).toBe(input);
    await user.keyboard('{ArrowDown}');
    expect(onKeyDown).not.toHaveBeenCalled();
    onKeyDown.mockReset();
  });

  it('should clear the input field when clicking on the clear button', async () => {
    let {getByRole} = render(
      <AutocompleteWrapper>
        <StaticMenu />
      </AutocompleteWrapper>
    );

    let input = getByRole('searchbox');
    await user.tab();
    expect(document.activeElement).toBe(input);
    await user.keyboard('Foo');
    expect(input).toHaveValue('Foo');

    let button = getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Clear search');
    await user.click(button);

    expect(input).toHaveValue('');
  });

  it('should apply focusVisible/focused to virtually focused menu items when keyboard navigating', async () => {
    let {getByRole} = render(
      <AutocompleteWrapper>
        <StaticMenu />
      </AutocompleteWrapper>
    );

    let input = getByRole('searchbox');
    await user.tab();
    expect(document.activeElement).toBe(input);
    // Focus ring should be on input when no aria-activeelement
    expect(input).toHaveAttribute('data-focus-visible');

    // Focus ring should be on option when it is the active descendant and keyboard modality
    await user.keyboard('{ArrowDown}');
    let menu = getByRole('menu');
    let options = within(menu).getAllByRole('menuitem');
    expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
    expect(options[0]).toHaveAttribute('data-focus-visible');
    expect(input).not.toHaveAttribute('data-focus-visible');
    expect(input).not.toHaveAttribute('data-focused');

    // Focus ring should not be on either input or option when hovering (aka mouse modality)
    await user.click(input);
    await user.hover(options[1]);
    options = within(menu).getAllByRole('menuitem');
    expect(options[1]).toHaveAttribute('data-focused');
    expect(options[1]).not.toHaveAttribute('data-focus-visible');
    expect(input).not.toHaveAttribute('data-focused');

    // Reset focus visible on input so that isTextInput in useFocusRing doesn't prevent the focus ring
    // from appearing on the input
    await user.tab();
    await user.tab({shift: true});

    // Focus ring should be on option after typing and option is autofocused
    await user.keyboard('Bar');
    act(() => jest.runAllTimers());
    options = within(menu).getAllByRole('menuitem');
    expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
    expect(options[0]).toHaveAttribute('data-focus-visible');
    expect(input).not.toHaveAttribute('data-focused');

    // Focus ring should be on input after clearing focus via ArrowLeft
    await user.keyboard('{ArrowLeft}');
    act(() => jest.runAllTimers());
    options = within(menu).getAllByRole('menuitem');
    input = getByRole('searchbox');
    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(input).toHaveAttribute('data-focus-visible');

    // Focus ring should be on input after clearing focus via Backspace
    await user.keyboard('{ArrowDown}');
    act(() => jest.runAllTimers());
    expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
    expect(options[0]).toHaveAttribute('data-focus-visible');
    expect(input).not.toHaveAttribute('data-focus-visible');
    expect(input).not.toHaveAttribute('data-focused');
    await user.keyboard('{Backspace}');
    act(() => jest.runAllTimers());
    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(input).toHaveAttribute('data-focus-visible');
  });

  it('should not display focus in the virtually focused menu if focus isn\'t in the autocomplete input', async function () {
    let {getByRole} = render(
      <>
        <input />
        <AutocompleteWrapper>
          <StaticMenu />
        </AutocompleteWrapper>
        <input />
      </>
    );

    let input = getByRole('searchbox');
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(input);
    expect(input).toHaveAttribute('data-focus-visible');
    await user.keyboard('{ArrowDown}');
    let menu = getByRole('menu');
    let options = within(menu).getAllByRole('menuitem');
    expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
    expect(options[0]).toHaveAttribute('data-focus-visible');
    expect(input).not.toHaveAttribute('data-focus-visible');
    expect(input).not.toHaveAttribute('data-focused');

    await user.tab();
    expect(document.activeElement).not.toBe(input);
    expect(options[0]).not.toHaveAttribute('data-focused');
    expect(options[0]).not.toHaveAttribute('data-focus-visible');
    expect(input).not.toHaveAttribute('data-focus-visible');
    expect(input).not.toHaveAttribute('data-focused');

    await user.tab({shift: true});
    act(() => jest.runAllTimers());
    expect(document.activeElement).toBe(input);
    expect(options[0]).toHaveAttribute('data-focused');
    expect(options[0]).toHaveAttribute('data-focus-visible');
    expect(input).not.toHaveAttribute('data-focus-visible');
    expect(input).not.toHaveAttribute('data-focused');
  });

  it('should restore focus visible styles back to the input when typing forward results in only disabled items', async function () {
    let {getByRole} = render(
      <AutocompleteWrapper>
        <StaticMenu disabledKeys={['2']} />
      </AutocompleteWrapper>
    );

    let input = getByRole('searchbox');
    await user.tab();
    expect(document.activeElement).toBe(input);
    expect(input).toHaveAttribute('data-focused');
    expect(input).toHaveAttribute('data-focus-visible');

    await user.keyboard('Ba');
    act(() => jest.runAllTimers());
    let menu = getByRole('menu');
    let options = within(menu).getAllByRole('menuitem');
    let baz = options[1];
    expect(baz).toHaveTextContent('Baz');
    expect(input).toHaveAttribute('aria-activedescendant', baz.id);
    expect(baz).toHaveAttribute('data-focus-visible');
    expect(input).not.toHaveAttribute('data-focused');
    expect(input).not.toHaveAttribute('data-focus-visible');

    await user.keyboard('r');
    act(() => jest.runAllTimers());
    options = within(menu).getAllByRole('menuitem');
    let bar = options[0];
    expect(bar).toHaveTextContent('Bar');
    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(bar).not.toHaveAttribute('data-focus-visible');
    expect(input).toHaveAttribute('data-focused');
    expect(input).toHaveAttribute('data-focus-visible');
  });

  it('should maintain focus styles on the input if typing forward results in an completely empty collection', async function () {
    let {getByRole} = render(
      <AutocompleteWrapper>
        <StaticMenu />
      </AutocompleteWrapper>
    );

    let input = getByRole('searchbox');
    await user.tab();
    expect(document.activeElement).toBe(input);
    expect(input).toHaveAttribute('data-focused');
    expect(input).toHaveAttribute('data-focus-visible');

    await user.keyboard('Q');
    act(() => jest.runAllTimers());
    let menu = getByRole('menu');
    let options = within(menu).queryAllByRole('menuitem');
    expect(options).toHaveLength(0);
    expect(input).toHaveAttribute('data-focused');
    expect(input).toHaveAttribute('data-focus-visible');
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('should restore focus visible styles back to the input if the user types forward and backspaces in quick succession', async function () {
    let {getByRole} = render(
      <AutocompleteWrapper>
        <StaticMenu />
      </AutocompleteWrapper>
    );

    let input = getByRole('searchbox');
    await user.tab();
    expect(document.activeElement).toBe(input);
    expect(input).toHaveAttribute('data-focused');
    expect(input).toHaveAttribute('data-focus-visible');

    await user.keyboard('F');
    // If 500ms hasn't elapsed the aria-activedecendant hasn't been updated
    act(() => jest.advanceTimersByTime(300));
    let menu = getByRole('menu');
    let options = within(menu).getAllByRole('menuitem');
    let foo = options[0];
    expect(foo).toHaveTextContent('Foo');
    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(foo).toHaveAttribute('data-focus-visible');
    expect(input).not.toHaveAttribute('data-focused');
    expect(input).not.toHaveAttribute('data-focus-visible');

    await user.keyboard('{Backspace}');
    act(() => jest.runAllTimers());
    expect(input).toHaveAttribute('data-focused');
    expect(input).toHaveAttribute('data-focus-visible');
    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(foo).not.toHaveAttribute('data-focus-visible');
  });

  it('should not move focus to the input field if tapping on a menu item via touch', async function () {
    let {getByRole} = render(
      <AutocompleteWrapper>
        <StaticMenu />
      </AutocompleteWrapper>
    );

    let input = getByRole('searchbox');
    let menu = getByRole('menu');
    let options = within(menu).getAllByRole('menuitem');
    let foo = options[0];

    await user.pointer({target: foo, keys: '[TouchA]'});
    expect(document.activeElement).not.toBe(input);
  });

  it('should move focus to the input field if clicking on a menu item via mouse', async function () {
    let {getByRole} = render(
      <AutocompleteWrapper>
        <StaticMenu />
      </AutocompleteWrapper>
    );

    let input = getByRole('searchbox');
    let menu = getByRole('menu');
    let options = within(menu).getAllByRole('menuitem');
    let foo = options[0];

    await user.pointer({target: foo, keys: '[MouseLeft]'});
    expect(document.activeElement).toBe(input);
  });

  it('should work inside a Select', async function () {
    let {getByRole} = render(
      <Select>
        <Label>Test</Label>
        <Button>
          <SelectValue />
        </Button>
        <Popover>
          <AutocompleteWrapper inputProps={{autoFocus: true}}>
            <StaticListbox />
          </AutocompleteWrapper>
        </Popover>
      </Select>
    );

    let button = getByRole('button');
    await user.tab();
    expect(document.activeElement).toBe(button);
    await user.keyboard('{Enter}');
    act(() => jest.runAllTimers());

    let searchfield = getByRole('searchbox');
    expect(document.activeElement).toBe(searchfield);
    let listbox = getByRole('listbox');
    let options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(searchfield).toHaveAttribute('aria-activedescendant', options[0].id);
    expect(options[0]).toHaveAttribute('data-focus-visible');

    await user.keyboard('{ArrowDown}');
    expect(searchfield).toHaveAttribute('aria-activedescendant', options[1].id);

    await user.keyboard('b');
    options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(searchfield).toHaveAttribute('aria-activedescendant', options[0].id);

    await user.keyboard('{Enter}');
    act(() => jest.runAllTimers());
    expect(listbox).not.toBeInTheDocument();
    expect(document.activeElement).toBe(button);
    expect(button).toHaveTextContent('Bar');
  });

  it('should be able to tab inside a focus scope that contains', async () => {
    const MyMenu = () => {
      let {contains} = useFilter({sensitivity: 'base'});

      return (
        <DialogTrigger>
          <Button aria-label="Menu">☰</Button>
          <Popover>
            <Dialog>
              <Button>First</Button>
              <Button>Second</Button>
              <Autocomplete filter={contains}>
                <TextField autoFocus aria-label="Search">
                  <Input />
                </TextField>
                <Menu>
                  <MenuItem>Open</MenuItem>
                  <MenuItem>
                    Rename…
                  </MenuItem>
                  <MenuItem>
                    Duplicate
                  </MenuItem>
                </Menu>
              </Autocomplete>
            </Dialog>
          </Popover>
        </DialogTrigger>
      );
    };

    function App() {
      return (
        <div>
          <input />
          <div>
            <MyMenu />
          </div>
          <input />
        </div>
      );
    }

    let {getByRole} = render(<App />);
    let trigger = getByRole('button', {name: 'Menu'});
    await user.click(trigger);
    let firstButton = getByRole('button', {name: 'First'});
    let secondButton = getByRole('button', {name: 'Second'});
    let input = getByRole('textbox');

    expect(document.activeElement).toBe(input);

    await user.tab();

    expect(document.activeElement).toBe(firstButton);

    await user.tab({shift: true});

    expect(document.activeElement).toBe(input);

    await user.tab({shift: true});

    expect(document.activeElement).toBe(secondButton);
  });

  it('should be able to tab inside a focus scope that contains with buttons after the autocomplete', async () => {
    const MyMenu = () => {
      let {contains} = useFilter({sensitivity: 'base'});

      return (
        <DialogTrigger>
          <Button aria-label="Menu">☰</Button>
          <Popover>
            <Dialog>
              <Autocomplete filter={contains}>
                <TextField autoFocus aria-label="Search">
                  <Input />
                </TextField>
                <Menu>
                  <MenuItem>Open</MenuItem>
                  <MenuItem>
                    Rename…
                  </MenuItem>
                  <MenuItem>
                    Duplicate
                  </MenuItem>
                </Menu>
              </Autocomplete>
              <Button>First</Button>
              <Button>Second</Button>
            </Dialog>
          </Popover>
        </DialogTrigger>
      );
    };

    function App() {
      return (
        <div>
          <input />
          <div>
            <MyMenu />
          </div>
          <input />
        </div>
      );
    }

    let {getByRole} = render(<App />);
    let trigger = getByRole('button', {name: 'Menu'});
    await user.click(trigger);
    let firstButton = getByRole('button', {name: 'First'});
    let secondButton = getByRole('button', {name: 'Second'});
    let input = getByRole('textbox');

    expect(document.activeElement).toBe(input);

    await user.tab();

    expect(document.activeElement).toBe(firstButton);

    await user.tab({shift: true});

    expect(document.activeElement).toBe(input);

    await user.tab({shift: true});

    expect(document.activeElement).toBe(secondButton);
  });

  it('should not auto focus first item when disableAutoFocusFirst is true', async () => {
    let {getByRole} = render(
      <AutocompleteWrapper autocompleteProps={{disableAutoFocusFirst: true}}>
        <StaticMenu />
      </AutocompleteWrapper>
    );

    let input = getByRole('searchbox');
    await user.tab();
    expect(document.activeElement).toBe(input);

    await user.keyboard('Foo');

    expect(input).not.toHaveAttribute('aria-activedescendant');

    await user.keyboard('{ArrowDown}');
    let menu = getByRole('menu');
    let options = within(menu).getAllByRole('menuitem');
    expect(input).toHaveAttribute('aria-activedescendant', options[0].id);
  });

  it('should close the Dialog on the second press of Escape if the inner ListBox has escapeKeyBehavior: "none" ', async () => {
    const DialogExample = (props) => {
      let {contains} = useFilter({sensitivity: 'base'});

      return (
        <DialogTrigger>
          <Button aria-label="Menu">☰</Button>
          <Popover>
            <Dialog>
              <Button>First</Button>
              <Button>Second</Button>
              <Autocomplete filter={contains}>
                <SearchField autoFocus aria-label="Search">
                  <Input />
                </SearchField>
                <StaticListbox escapeKeyBehavior={props?.escapeKeyBehavior} selectionMode="single" defaultSelectedKeys={['1']} />
              </Autocomplete>
            </Dialog>
          </Popover>
        </DialogTrigger>
      );
    };

    let {getByRole, getAllByRole, rerender, queryAllByRole} = render(<DialogExample escapeKeyBehavior="none" />);
    let button = getByRole('button');
    await user.tab();
    expect(document.activeElement).toBe(button);
    await user.keyboard('{Enter}');
    act(() => jest.runAllTimers());

    let dialogs = getAllByRole('dialog');
    expect(dialogs).toHaveLength(1);
    let options = getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');

    let input = getByRole('searchbox');
    expect(document.activeElement).toBe(input);
    await user.keyboard('I');
    expect(input).toHaveValue('I');

    await user.keyboard('{Escape}');
    expect(input).toHaveValue('');

    await user.keyboard('{Escape}');
    act(() => jest.runAllTimers());
    dialogs = queryAllByRole('dialog');
    expect(dialogs).toHaveLength(0);

    // Test without escapeKeyBehavior, 2nd Escape should clear selection instead of closing the dialog
    rerender(<DialogExample />);
    button = getByRole('button');
    await user.click(button);
    act(() => jest.runAllTimers());

    dialogs = getAllByRole('dialog');
    expect(dialogs).toHaveLength(1);
    options = getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');

    input = getByRole('searchbox');
    expect(document.activeElement).toBe(input);
    await user.keyboard('I');
    expect(input).toHaveValue('I');

    await user.keyboard('{Escape}');
    expect(input).toHaveValue('');

    await user.keyboard('{Escape}');
    act(() => jest.runAllTimers());
    dialogs = queryAllByRole('dialog');
    expect(dialogs).toHaveLength(1);
    options = getAllByRole('option');
    expect(options[0]).not.toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{Escape}');
    act(() => jest.runAllTimers());
    dialogs = queryAllByRole('dialog');
    expect(dialogs).toHaveLength(0);
  });

  it.each`
    Name              | Component
    ${'Tabs'}         | ${StaticTabs}
    ${'Tree'}         | ${StaticTree}
    ${'Breadcrumbs'}  | ${StaticBreadcrumbs}
  `('$Name doesnt get filtered by Autocomplete', async function ({Component}) {
    let {getByRole, getByTestId} = render(
      <AutocompleteWrapper>
        <Component data-testid="wrapped" />
      </AutocompleteWrapper>
    );

    let wrappedComponent = getByTestId('wrapped');
    expect(await within(wrappedComponent).findByText('Foo')).toBeTruthy();
    expect(await within(wrappedComponent).findByText('Bar')).toBeTruthy();
    expect(await within(wrappedComponent).findByText('Baz')).toBeTruthy();

    let input = getByRole('searchbox');
    await user.tab();
    expect(document.activeElement).toBe(input);
    await user.keyboard('Foo');
    expect(input).toHaveValue('Foo');
    expect(input).not.toHaveAttribute('aria-controls');
    expect(input).not.toHaveAttribute('aria-autocomplete');
    expect(input).not.toHaveAttribute('aria-activedescendant');

    expect(await within(wrappedComponent).findByText('Foo')).toBeTruthy();
    expect(await within(wrappedComponent).findByText('Bar')).toBeTruthy();
    expect(await within(wrappedComponent).findByText('Baz')).toBeTruthy();
  });

  it('should allow user to filter by node information', async () => {
    let {getByRole} = render(
      <CustomFiltering>
        <MenuWithSections />
      </CustomFiltering>
    );

    let input = getByRole('searchbox');
    await user.tab();
    expect(document.activeElement).toBe(input);
    let menu = getByRole('menu');
    let sections = within(menu).getAllByRole('group');
    expect(sections.length).toBe(2);
    let options = within(menu).getAllByRole('menuitem');
    expect(options).toHaveLength(6);

    await user.keyboard('Copy');
    sections = within(menu).getAllByRole('group');
    options = within(menu).getAllByRole('menuitem');
    expect(options).toHaveLength(4);
    expect(within(sections[0]).getByText('Foo')).toBeTruthy();
    expect(within(sections[0]).getByText('Bar')).toBeTruthy();
    expect(within(sections[0]).getByText('Baz')).toBeTruthy();
    expect(within(sections[1]).getByText('Copy')).toBeTruthy();
  });


  it('shouldnt prevent default on keyboard interactions if somehow the active descendant doesnt exist in the DOM', async () => {
    let defaultOptions = [
      {value: 'one'},
      {value: 'two'},
      {value: 'three'},
      {value: 'four'},
      {value: 'five'}
    ];
    function ControlledItemsFilter() {
      const [options, setOptions] = useState(defaultOptions);
      const [inputValue, onInputChange] = useState('');

      let [prevInputValue, setPrevInputValue] = useState(inputValue);
      if (prevInputValue !== inputValue) {
        setOptions(
          defaultOptions.filter(({value}) => value.includes(inputValue))
        );
        setPrevInputValue(inputValue);
      }

      return (
        <Autocomplete inputValue={inputValue} onInputChange={onInputChange}>
          <SearchField aria-label="Search">
            <Input aria-label="Search" placeholder="Search..." />
            <Button>X</Button>
          </SearchField>
          <ListBox selectionMode="multiple">
            <Collection items={options} dependencies={[inputValue]}>
              {(option) => (
                <ListBoxItem id={option.value}>{option.value}</ListBoxItem>
              )}
            </Collection>
            <ListBoxLoadMoreItem onLoadMore={() => {}} isLoading={false}>
              <div>Loading...</div>
            </ListBoxLoadMoreItem>
          </ListBox>
        </Autocomplete>
      );
    }
    let {getByRole} = render(
      <ControlledItemsFilter />
    );

    let input = getByRole('searchbox');
    await user.tab();
    expect(document.activeElement).toBe(input);
    await user.keyboard('o');
    act(() => jest.runAllTimers());
    let listbox = getByRole('listbox');
    let options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(input).toHaveAttribute('aria-activedescendant', options[0].id);

    await user.keyboard('o');
    act(() => jest.runAllTimers());
    options = within(listbox).queryAllByRole('option');
    expect(options).toHaveLength(0);
    expect(input).not.toHaveAttribute('aria-activedescendant');

    await user.keyboard('{Backspace}');
    act(() => jest.runAllTimers());
    options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(3);
  });
});

AriaAutocompleteTests({
  prefix: 'rac-static-menu',
  renderers: {
    standard: () => render(
      <AutocompleteWrapper>
        <StaticMenu />
      </AutocompleteWrapper>
    ),
    links: () => render(
      <AutocompleteWrapper>
        <MenuWithLinks />
      </AutocompleteWrapper>
    ),
    sections: () => render(
      <AutocompleteWrapper>
        <MenuWithSections />
      </AutocompleteWrapper>
    ),
    controlled: () => render(
      <ControlledAutocomplete>
        <StaticMenu />
      </ControlledAutocomplete>
    ),
    itemActions: () => render(
      <AutocompleteWrapper>
        <StaticMenu onAction={onAction} />
      </AutocompleteWrapper>
    ),
    multipleSelection: () => render(
      <AutocompleteWrapper>
        <StaticMenu selectionMode="multiple" onSelectionChange={onSelectionChange} />
      </AutocompleteWrapper>
    ),
    disabledItems: () => render(
      <AutocompleteWrapper>
        <StaticMenu onAction={onAction} disabledKeys={['2']} />
      </AutocompleteWrapper>
    ),
    defaultValue: () => render(
      <AutocompleteWrapper autocompleteProps={{defaultInputValue: 'Ba'}}>
        <StaticMenu />
      </AutocompleteWrapper>
    ),
    submenus: () => render(
      <AutocompleteWrapper>
        <SubMenus />
      </AutocompleteWrapper>
    ),
    subdialogs: () => render(
      <AutocompleteWrapper>
        <SubDialogs />
      </AutocompleteWrapper>
    ),
    subdialogAndMenu: () => render(
      <AutocompleteWrapper>
        <SubDialogAndMenu />
      </AutocompleteWrapper>
    ),
    noVirtualFocus: () => render(
      <AutocompleteWrapper autocompleteProps={{disableVirtualFocus: true}}>
        <StaticMenu />
      </AutocompleteWrapper>
    )
  },
  actionListener: onAction,
  selectionListener: onSelectionChange
});

AriaAutocompleteTests({
  prefix: 'rac-dynamic-menu',
  renderers: {
    standard: () => render(
      <AutocompleteWrapper>
        <DynamicMenu />
      </AutocompleteWrapper>
    ),
    asyncFiltering: () => render(
      <AsyncFiltering />
    )
  }
});

AriaAutocompleteTests({
  prefix: 'rac-static-listbox',
  renderers: {
    standard: () => render(
      <AutocompleteWrapper>
        <StaticListbox />
      </AutocompleteWrapper>
    ),
    links: () => render(
      <AutocompleteWrapper>
        <ListBoxWithLinks />
      </AutocompleteWrapper>
    ),
    sections: () => render(
      <AutocompleteWrapper>
        <ListBoxWithSections />
      </AutocompleteWrapper>
    ),
    controlled: () => render(
      <ControlledAutocomplete>
        <StaticListbox />
      </ControlledAutocomplete>
    ),
    multipleSelection: () => render(
      <AutocompleteWrapper>
        <StaticListbox selectionMode="multiple" onSelectionChange={onSelectionChange} />
      </AutocompleteWrapper>
    ),
    disabledItems: () => render(
      <AutocompleteWrapper>
        <StaticListbox onAction={onAction} disabledKeys={['2']} />
      </AutocompleteWrapper>
    ),
    defaultValue: () => render(
      <AutocompleteWrapper autocompleteProps={{defaultInputValue: 'Ba'}}>
        <StaticListbox />
      </AutocompleteWrapper>
    ),
    noVirtualFocus: () => render(
      <AutocompleteWrapper autocompleteProps={{disableVirtualFocus: true}}>
        <StaticListbox />
      </AutocompleteWrapper>
    )
  },
  ariaPattern: 'listbox',
  actionListener: onAction,
  selectionListener: onSelectionChange
});

AriaAutocompleteTests({
  prefix: 'rac-static-table',
  renderers: {
    noVirtualFocus: () => render(
      <AutocompleteWrapper>
        <StaticTable />
      </AutocompleteWrapper>
    )
  },
  ariaPattern: 'grid'
});

AriaAutocompleteTests({
  prefix: 'rac-static-gridlist',
  renderers: {
    noVirtualFocus: () => render(
      <AutocompleteWrapper>
        <StaticGridList />
      </AutocompleteWrapper>
    )
  },
  ariaPattern: 'grid'
});

AriaAutocompleteTests({
  prefix: 'rac-static-taggroup',
  renderers: {
    noVirtualFocus: () => render(
      <AutocompleteWrapper>
        <StaticTagGroup />
      </AutocompleteWrapper>
    )
  },
  ariaPattern: 'grid'
});
