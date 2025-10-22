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

import {action} from '@storybook/addon-actions';
import {Autocomplete, Button, Cell, Collection, Column, DialogTrigger, GridList, GridListHeader, GridListSection, Header, Input, Keyboard, Label, ListBox, ListBoxSection, ListLayout, Menu, MenuItem, MenuSection, MenuTrigger, OverlayArrow, Popover, Row, SearchField, Select, SelectValue, Separator, SubmenuTrigger, Table, TableBody, TableHeader, TableLayout, TagGroup, TagList, Text, TextArea, TextField, Tooltip, TooltipTrigger, Virtualizer} from 'react-aria-components';
import {LoadingSpinner, MyListBoxItem, MyMenuItem} from './utils';
import {Meta, StoryObj} from '@storybook/react';
import {MyCheckbox} from './Table.stories';
import {MyGridListItem} from './GridList.stories';
import {MyListBoxLoaderIndicator} from './ListBox.stories';
import {MyTag} from './TagGroup.stories';
import {Node} from '@react-types/shared';
import React, {useState} from 'react';
import styles from '../example/index.css';
import {useAsyncList, useListData, useTreeData} from 'react-stately';
import {useFilter} from 'react-aria';
import './styles.css';

export default {
  title: 'React Aria Components/Autocomplete',
  component: Autocomplete,
  args: {
    onAction: action('onAction'),
    selectionMode: 'multiple',
    escapeKeyBehavior: 'clearSelection',
    disableVirtualFocus: false
  },
  argTypes: {
    onAction: {
      table: {
        disable: true
      }
    },
    onSelectionChange: {
      table: {
        disable: true
      }
    },
    selectionMode: {
      control: 'radio',
      options: ['none', 'single', 'multiple']
    },
    escapeKeyBehavior: {
      control: 'radio',
      options: ['clearSelection', 'none']
    }
  }
} as Meta<typeof Autocomplete>;

export type AutocompleteStory = StoryObj<typeof Autocomplete>;
export type MenuStory = StoryObj<typeof Menu>;
export type ListBoxStory = StoryObj<typeof ListBox>;

let StaticMenu = (props) => {
  return (
    <Menu className={styles.menu} {...props}>
      <MenuSection className={styles.group} aria-label={'Section 1'}>
        <MyMenuItem>Foo</MyMenuItem>
        <MyMenuItem>Bar</MyMenuItem>
        <MyMenuItem>Baz</MyMenuItem>
        <MyMenuItem href="http://google.com">Google</MyMenuItem>
        <SubmenuTrigger>
          <MyMenuItem>With subdialog</MyMenuItem>
          <Popover
            style={{
              background: 'Canvas',
              color: 'CanvasText',
              border: '1px solid gray',
              padding: 5
            }}>
            <AutocompleteWrapper>
              <TextField autoFocus>
                <Label style={{display: 'block'}}>Search</Label>
                <Input />
                <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
              </TextField>
              <Menu className={styles.menu} {...props}>
                <MyMenuItem>Subdialog Foo</MyMenuItem>
                <MyMenuItem>Subdialog Bar</MyMenuItem>
                <MyMenuItem>Subdialog Baz</MyMenuItem>
              </Menu>
            </AutocompleteWrapper>
          </Popover>
        </SubmenuTrigger>
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
  );
};

function AutocompleteWrapper(props) {
  let {contains} = useFilter({sensitivity: 'base'});
  let filter = (textValue, inputValue) => contains(textValue, inputValue);
  return (
    <Autocomplete filter={filter} {...props} />
  );
}

export const AutocompleteExample: AutocompleteStory = {
  render: (args) => {
    return (
      <AutocompleteWrapper disableVirtualFocus={args.disableVirtualFocus}>
        <div>
          <TextField autoFocus data-testid="autocomplete-example">
            <Label style={{display: 'block'}}>Test</Label>
            <Input />
            <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
          </TextField>
          <StaticMenu {...args} />
        </div>
      </AutocompleteWrapper>
    );
  },
  name: 'Autocomplete complex static with textfield'
};

export const AutocompleteSearchfield: AutocompleteStory = {
  render: (args) => {
    return (
      <AutocompleteWrapper defaultValue="Ba" disableVirtualFocus={args.disableVirtualFocus}>
        <div>
          <SearchField autoFocus data-testid="autocomplete-example">
            <Label style={{display: 'block'}}>Test</Label>
            <Input />
            <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
          </SearchField>
          <StaticMenu {...args} />
        </div>
      </AutocompleteWrapper>
    );
  },
  name: 'Autocomplete complex static with searchfield',
  parameters: {
    description: {
      data: 'Note that on mobile, trying to type into the subdialog inputs may cause scrolling and thus cause the subdialog to close. Please test in landscape mode.'
    }
  }
};

// Note that the trigger items in this array MUST have an id, even if the underlying MenuItem might apply its own
// id. If it is omitted, we can't build the collection node for the trigger node and an error will throw
let dynamicAutocompleteSubdialog: MenuNode[] = [
  {name: 'Section 1', isSection: true, children: [
    {name: 'Command Palette'},
    {name: 'Open View'}
  ]},
  {name: 'Section 2', isSection: true, children: [
    {name: 'Appearance', id: 'appearance', children: [
      {name: 'Sub Section 1', isSection: true, children: [
        {name: 'Move Primary Side Bar Right'},
        {name: 'Activity Bar Position', id: 'activity', isMenu: true, children: [
          {name: 'Default'},
          {name: 'Top'},
          {name: 'Bottom'},
          {name: 'Hidden'},
          {name: 'Subdialog test', id: 'sub', children: [
            {name: 'A'},
            {name: 'B'},
            {name: 'C'},
            {name: 'D'}
          ]},
          {name: 'Submenu test', id: 'sub2', isMenu: true, children: [
            {name: 'A'},
            {name: 'B'},
            {name: 'C'},
            {name: 'D'}
          ]}
        ]},
        {name: 'Panel Position', id: 'position', children: [
          {name: 'Top'},
          {name: 'Left'},
          {name: 'Right'},
          {name: 'Bottom'}
        ]}
      ]}
    ]},
    {name: 'Editor Layout', id: 'editor', children: [
      {name: 'Sub Section 1', isSection: true, children: [
        {name: 'Split up'},
        {name: 'Split down'},
        {name: 'Split left'},
        {name: 'Split right'}
      ]},
      {name: 'Sub Section 2', isSection: true, children: [
        {name: 'Single'},
        {name: 'Two columns'},
        {name: 'Three columns'},
        {name: 'Two rows'},
        {name: 'Three rows'}
      ]}
    ]}
  ]}
];

interface ItemNode {
  name?: string,
  textValue?: string,
  isSection?: boolean,
  isMenu?: boolean,
  children?: ItemNode[]
}

let dynamicRenderTrigger = (item: ItemNode) => {
  if (item.isMenu) {
    return (
      <SubmenuTrigger>
        <MyMenuItem key={item.name}>{item.name}</MyMenuItem>
        <Popover className={styles.popover}>
          <Menu items={item.children} className={styles.menu} onAction={action(`${item.name} onAction`)}>
            {(item) => dynamicRenderFuncSections(item)}
          </Menu>
        </Popover>
      </SubmenuTrigger>
    );
  } else {
    return (
      <SubmenuTrigger>
        <MyMenuItem id={item.name} textValue={item.name}>
          {item.name}
        </MyMenuItem>
        <Popover
          style={{
            background: 'Canvas',
            color: 'CanvasText',
            border: '1px solid gray',
            padding: 5
          }}>
          <AutocompleteWrapper>
            <SearchField autoFocus>
              <Label style={{display: 'block'}}>Search</Label>
              <Input />
              <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
            </SearchField>
            <Menu className={styles.menu} items={item.children} onAction={action(`${item.name} onAction`)}>
              {(item) => dynamicRenderFuncSections(item)}
            </Menu>
          </AutocompleteWrapper>
        </Popover>
      </SubmenuTrigger>
    );
  }
};

let dynamicRenderItem = (item) => (
  <MyMenuItem id={item.name} textValue={item.name}>
    {item.name}
  </MyMenuItem>
);

let dynamicRenderFuncSections = (item: ItemNode) => {
  if (item.children) {
    if (item.isSection) {
      return (
        <MenuSection className={styles.group} id={item.name} items={item.children}>
          {item.name != null && <Header style={{fontSize: '1.2em'}}>{item.name}</Header>}
          <Collection items={item.children ?? []}>
            {(item) => {
              if (item.children) {
                return dynamicRenderTrigger(item);
              } else {
                return dynamicRenderItem(item);
              }
            }}
          </Collection>
        </MenuSection>
      );
    } else {
      return dynamicRenderTrigger(item);
    }
  } else {
    return dynamicRenderItem(item);
  }
};

export const AutocompleteMenuDynamic: AutocompleteStory = {
  render: (args) => {
    return (
      <>
        <input />
        <AutocompleteWrapper disableVirtualFocus={args.disableVirtualFocus}>
          <div>
            <SearchField autoFocus>
              <Label style={{display: 'block'}}>Test</Label>
              <Input />
              <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
            </SearchField>
            <Menu className={styles.menu} items={dynamicAutocompleteSubdialog} {...args}>
              {item => dynamicRenderFuncSections(item)}
            </Menu>
          </div>
        </AutocompleteWrapper>
        <input />
      </>
    );
  },
  name: 'Autocomplete, dynamic menu'
};

export const AutocompleteOnActionOnMenuItems: AutocompleteStory = {
  render: (args) => {
    return (
      <AutocompleteWrapper disableVirtualFocus={args.disableVirtualFocus}>
        <div>
          <SearchField autoFocus>
            <Label style={{display: 'block'}}>Test</Label>
            <Input />
            <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
          </SearchField>
          <Menu className={styles.menu} {...args}>
            <MyMenuItem onAction={action('Foo action')}>Foo</MyMenuItem>
            <MyMenuItem onAction={action('Bar action')}>Bar</MyMenuItem>
            <MyMenuItem onAction={action('Baz action')}>Baz</MyMenuItem>
          </Menu>
        </div>
      </AutocompleteWrapper>
    );
  },
  name: 'Autocomplete, onAction on menu items'
};

interface AutocompleteItem {
  id: string,
  name: string
}

let items: AutocompleteItem[] = [{id: '1', name: 'Foo'}, {id: '2', name: 'Bar'}, {id: '3', name: 'Baz'}];

export const AutocompleteDisabledKeys: AutocompleteStory = {
  render: (args) => {
    return (
      <AutocompleteWrapper disableVirtualFocus={args.disableVirtualFocus}>
        <div>
          <SearchField autoFocus>
            <Label style={{display: 'block'}}>Test</Label>
            <Input />
            <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
          </SearchField>
          <Menu className={styles.menu} items={items} disabledKeys={['2']} {...args}>
            {(item: AutocompleteItem) => <MyMenuItem id={item.id}>{item.name}</MyMenuItem>}
          </Menu>
        </div>
      </AutocompleteWrapper>
    );
  },
  name: 'Autocomplete, disabled key'
};

const AsyncExample = (args: any): React.ReactElement => {
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
  let {onSelectionChange, selectionMode, includeLoadState, escapeKeyBehavior, disableVirtualFocus} = args;
  let renderEmptyState;
  if (includeLoadState) {
    renderEmptyState = list.isLoading ? () => 'Loading' : () => 'No results found.';
  }

  return (
    <Autocomplete inputValue={list.filterText} onInputChange={list.setFilterText} disableVirtualFocus={disableVirtualFocus}>
      <div>
        <SearchField autoFocus>
          <Label style={{display: 'block'}}>Test</Label>
          <Input />
          <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
        </SearchField>
        <ListBox<AutocompleteItem>
          escapeKeyBehavior={escapeKeyBehavior}
          renderEmptyState={renderEmptyState}
          items={includeLoadState && list.isLoading ? [] : list.items}
          className={styles.menu}
          onSelectionChange={onSelectionChange}
          selectionMode={selectionMode}>
          {item => <MyListBoxItem>{item.name}</MyListBoxItem>}
        </ListBox>
      </div>
    </Autocomplete>
  );
};

export const AutocompleteAsyncLoadingExample: StoryObj<typeof AsyncExample> = {
  render: (args) => {
    return <AsyncExample {...args} />;
  },
  name: 'Autocomplete, useAsync level filtering with load state',
  args: {
    includeLoadState: true
  }
};

const CaseSensitiveFilter = (args) => {
  let {contains} = useFilter({
    sensitivity: 'case'
  });
  let defaultFilter = (itemText, input) => contains(itemText, input);

  return (
    <Autocomplete<AutocompleteItem> filter={defaultFilter} disableVirtualFocus={args.disableVirtualFocus}>
      <div>
        <SearchField autoFocus>
          <Label style={{display: 'block'}}>Test</Label>
          <Input />
          <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
        </SearchField>
        <Menu className={styles.menu} items={items} {...args}>
          {(item: AutocompleteItem) => <MyMenuItem id={item.id}>{item.name}</MyMenuItem>}
        </Menu>
      </div>
    </Autocomplete>
  );
};

export const AutocompleteCaseSensitive: AutocompleteStory = {
  render: (args) => {
    return <CaseSensitiveFilter {...args} />;
  },
  name: 'Autocomplete, case sensitive filter'
};

export const AutocompleteWithListbox: AutocompleteStory = {
  render: (args) => {
    return (
      <DialogTrigger>
        <Button>
          Open popover
        </Button>
        <Popover
          placement="bottom start"
          style={{
            background: 'Canvas',
            color: 'CanvasText',
            border: '1px solid gray',
            padding: 20,
            height: 250
          }}>
          {() => (
            <AutocompleteWrapper defaultInputValue="Ba" disableVirtualFocus={args.disableVirtualFocus}>
              <div>
                <SearchField autoFocus>
                  <Label style={{display: 'block'}}>Test</Label>
                  <Input />
                  <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
                </SearchField>
                <ListBox className={styles.menu} {...args} aria-label="test listbox with section">
                  <ListBoxSection className={styles.group}>
                    <Header style={{fontSize: '1.2em'}}>Section 1</Header>
                    <MyListBoxItem>Foo</MyListBoxItem>
                    <MyListBoxItem>Bar</MyListBoxItem>
                    <MyListBoxItem>Baz</MyListBoxItem>
                    <MyListBoxItem href="http://google.com">Google</MyListBoxItem>
                  </ListBoxSection>
                  <Separator style={{borderTop: '1px solid gray', margin: '2px 5px'}} />
                  <ListBoxSection className={styles.group} aria-label="Section 2">
                    <MyListBoxItem>Copy</MyListBoxItem>
                    <MyListBoxItem>Paste</MyListBoxItem>
                    <MyListBoxItem>Cut</MyListBoxItem>
                  </ListBoxSection>
                </ListBox>
              </div>
            </AutocompleteWrapper>
          )}
        </Popover>
      </DialogTrigger>
    );
  },
  name: 'Autocomplete with ListBox + Popover'
};

function VirtualizedListBox(props) {
  let items: {id: number, name: string}[] = [];
  for (let i = 0; i < 10000; i++) {
    items.push({id: i, name: `Item ${i}`});
  }

  let list = useListData({
    initialItems: items
  });

  let {onSelectionChange, selectionMode, escapeKeyBehavior} = props;

  return (
    <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 25}}>
      <ListBox
        escapeKeyBehavior={escapeKeyBehavior}
        onSelectionChange={onSelectionChange}
        selectionMode={selectionMode}
        className={styles.menu}
        style={{height: 200}}
        aria-label="virtualized listbox"
        items={list.items}>
        {item => <MyListBoxItem>{item.name}</MyListBoxItem>}
      </ListBox>
    </Virtualizer>
  );
}

export const AutocompleteWithVirtualizedListbox: AutocompleteStory = {
  render: (args) => {
    return (
      <DialogTrigger>
        <Button>
          Open popover
        </Button>
        <Popover
          placement="bottom start"
          style={{
            background: 'Canvas',
            color: 'CanvasText',
            border: '1px solid gray',
            padding: 20,
            height: 250
          }}>
          {() => (
            <AutocompleteWrapper disableVirtualFocus={args.disableVirtualFocus}>
              <div>
                <SearchField autoFocus>
                  <Label style={{display: 'block'}}>Test</Label>
                  <Input />
                  <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
                </SearchField>
                <VirtualizedListBox {...args} />
              </div>
            </AutocompleteWrapper>
          )}
        </Popover>
      </DialogTrigger>
    );
  },
  name: 'Autocomplete with ListBox + Popover, virtualized'
};

let lotsOfSections: any[] = [];
for (let i = 0; i < 50; i++) {
  let children: {name: string, id: string}[] = [];
  for (let j = 0; j < 50; j++) {
    children.push({name: `Section ${i}, Item ${j}`, id: `item_${i}_${j}`});
  }

  lotsOfSections.push({name: 'Section ' + i, id: `section_${i}`, children});
}
lotsOfSections = [{name: 'Recently visited', id: 'recent', children: []}].concat(lotsOfSections);

function ShellExample() {
  let tree = useTreeData<any>({
    initialItems: lotsOfSections,
    getKey: item => item.id,
    getChildren: item => item.children || null
  });

  let onSelectionChange = (keys) => {
    tree.move([...keys][0], 'recent', 0);
  };

  return (
    <Virtualizer
      layout={ListLayout}
      layoutOptions={{
        rowHeight: 25,
        headingHeight: 25
      }}>
      <ListBox
        onSelectionChange={onSelectionChange}
        selectionMode="single"
        className={styles.menu}
        style={{height: 200}}
        aria-label="virtualized listbox"
        items={tree.items}>
        {section => {
          return (
            <ListBoxSection id={section.value.id} className={styles.group}>
              {section.value.name != null && <Header style={{fontSize: '1.2em'}}>{section.value.name}</Header>}
              <Collection items={section.children ?? []}>
                {item => <MyListBoxItem id={item.value.id}>{item.value.name}</MyListBoxItem>}
              </Collection>
            </ListBoxSection>
          );
        }}
      </ListBox>
    </Virtualizer>
  );
}

export const AutocompleteInPopover: MenuStory = {
  render: () => {
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
            padding: 20,
            height: 250
          }}>
          <AutocompleteWrapper>
            <div>
              <SearchField autoFocus>
                <Label style={{display: 'block'}}>Test</Label>
                <Input />
                <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
              </SearchField>
              <ShellExample />
            </div>
          </AutocompleteWrapper>
        </Popover>
      </MenuTrigger>
    );
  },
  name: 'Autocomplete in popover (menu trigger), shell example',
  argTypes: {
    selectionMode: {
      table: {
        disable: true
      }
    }
  },
  parameters: {
    description: {
      data: 'Menu is single selection so only the latest selected option will show the selected style'
    }
  }
};

export const AutocompleteInPopoverDialogTrigger: MenuStory = {
  render: () => {
    return (
      <DialogTrigger>
        <Button>
          Open popover
        </Button>
        <Popover
          placement="bottom start"
          style={{
            background: 'Canvas',
            color: 'CanvasText',
            border: '1px solid gray',
            padding: 20,
            height: 250
          }}>
          {() => (
            <AutocompleteWrapper>
              <div>
                <SearchField autoFocus>
                  <Label style={{display: 'block'}}>Test</Label>
                  <Input />
                  <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
                </SearchField>
                <ShellExample />
              </div>
            </AutocompleteWrapper>
          )}
        </Popover>
      </DialogTrigger>
    );
  },
  name: 'Autocomplete in popover (dialog trigger), shell example',
  argTypes: {
    selectionMode: {
      table: {
        disable: true
      }
    }
  },
  parameters: {
    description: {
      data: 'Menu is single selection so only the latest selected option will show the selected style'
    }
  }
};

const MyMenu = () => {
  let {contains} = useFilter({sensitivity: 'base'});

  return (
    <MenuTrigger>
      <Button aria-label="Menu">☰</Button>
      <Popover>
        <Button>First</Button>
        <Button>Second</Button>
        <Autocomplete filter={contains}>
          <TextField autoFocus>
            <Input />
          </TextField>
          <Menu>
            <MenuItem onAction={() => console.log('open')}>Open</MenuItem>
            <MenuItem onAction={() => console.log('rename')}>
              Rename…
            </MenuItem>
            <MenuItem onAction={() => console.log('duplicate')}>
              Duplicate
            </MenuItem>
            <MenuItem onAction={() => console.log('share')}>Share…</MenuItem>
            <MenuItem onAction={() => console.log('delete')}>
              Delete…
            </MenuItem>
          </Menu>
        </Autocomplete>
      </Popover>
    </MenuTrigger>
  );
};

const MyMenu2 = () => {
  let {contains} = useFilter({sensitivity: 'base'});

  return (
    <MenuTrigger>
      <Button aria-label="Menu">☰</Button>
      <Popover>
        <Autocomplete filter={contains}>
          <TextField autoFocus>
            <Input />
          </TextField>
          <Menu>
            <MenuItem onAction={() => console.log('open')}>Open</MenuItem>
            <MenuItem onAction={() => console.log('rename')}>
              Rename…
            </MenuItem>
            <MenuItem onAction={() => console.log('duplicate')}>
              Duplicate
            </MenuItem>
            <MenuItem onAction={() => console.log('share')}>Share…</MenuItem>
            <MenuItem onAction={() => console.log('delete')}>
              Delete…
            </MenuItem>
          </Menu>
        </Autocomplete>
        <Button>First</Button>
        <Button>Second</Button>
      </Popover>
    </MenuTrigger>
  );
};

export function AutocompleteWithExtraButtons(): React.ReactElement {
  return (
    <div>
      <input />
      <div style={{display: 'flex', gap: '200px'}}>
        <MyMenu />
        <MyMenu2 />
      </div>
      <input />
    </div>
  );
}

// TODO: note that Space is used to select an item in a multiselect menu but that is also reserved for the
// autocomplete input field. Should we add logic to allow Space to select menu items when focus is in the Menu
// or is that a rare/unlikely use case for menus in general?
export const AutocompleteMenuInPopoverDialogTrigger: MenuStory = {
  render: (args) => {
    return (
      <DialogTrigger>
        <Button>
          Open popover
        </Button>
        <Popover
          placement="bottom start"
          style={{
            background: 'Canvas',
            color: 'CanvasText',
            border: '1px solid gray',
            padding: 20,
            height: 250
          }}>
          <AutocompleteWrapper>
            <div>
              <SearchField autoFocus>
                <Label style={{display: 'block'}}>Test</Label>
                <Input />
                <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
              </SearchField>
              <Menu className={styles.menu} items={dynamicAutocompleteSubdialog} {...args}>
                {item => dynamicRenderFuncSections(item)}
              </Menu>
            </div>
          </AutocompleteWrapper>
        </Popover>
      </DialogTrigger>
    );
  },
  name: 'Autocomplete in popover (dialog trigger), rendering dynamic autocomplete menu',
  argTypes: {
    selectionMode: {
      table: {
        disable: true
      }
    }
  }
};

let manyItems = [...Array(100)].map((_, i) => ({id: i, name: `Item ${i}`}));

export const AutocompleteSelect = (): React.ReactElement => (
  <Select style={{marginBottom: 40}}>
    <Label style={{display: 'block'}}>Test</Label>
    <Button>
      <SelectValue />
      <span aria-hidden="true" style={{paddingLeft: 5}}>▼</span>
    </Button>
    <Popover style={{background: 'Canvas', border: '1px solid ButtonBorder', padding: 5, boxSizing: 'border-box', display: 'flex'}}>
      <Autocomplete filter={useFilter({sensitivity: 'base'}).contains}>
        <SearchField aria-label="Search" autoFocus style={{display: 'flex', flexDirection: 'column'}}>
          <Input />
        </SearchField>
        <ListBox items={manyItems} className={styles.menu} style={{flex: 1}}>
          {item => <MyListBoxItem>{item.name}</MyListBoxItem>}
        </ListBox>
      </Autocomplete>
    </Popover>
  </Select>
);

interface Character {
  name: string,
  height: number,
  mass: number,
  birth_year: number
}

let renderEmptyState = (list, cursor) => {
  let emptyStateContent;
  if (list.loadingState === 'loading') {
    emptyStateContent = <LoadingSpinner style={{height: 20, width: 20, transform: 'translate(-50%, -50%)'}} />;
  } else if (list.loadingState === 'idle' && !cursor) {
    emptyStateContent = 'No results';
  }
  return  (
    <div style={{height: 30, width: '100%'}}>
      {emptyStateContent}
    </div>
  );
};


export const AutocompleteWithAsyncListBox = (args) => {
  let [cursor, setCursor] = useState(null);
  let list = useAsyncList<Character>({
    async load({signal, cursor, filterText}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      await new Promise(resolve => setTimeout(resolve, args.delay));
      let res = await fetch(cursor || `https://swapi.py4e.com/api/people/?search=${filterText}`, {signal});
      let json = await res.json();
      setCursor(json.next);
      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <AutocompleteWrapper disableVirtualFocus={args.disableVirtualFocus}>
      <div>
        <TextField autoFocus data-testid="autocomplete-example">
          <Label style={{display: 'block'}}>Test</Label>
          <Input />
          <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
        </TextField>
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
            renderEmptyState={() => renderEmptyState(list, cursor)}>
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
      </div>
    </AutocompleteWrapper>
  );
};

AutocompleteWithAsyncListBox.story = {
  args: {
    delay: 50
  }
};

export const AutocompleteWithGridList = () => {
  return (
    <AutocompleteWrapper>
      <div>
        <TextField autoFocus data-testid="autocomplete-example">
          <Label style={{display: 'block'}}>Test</Label>
          <Input />
        </TextField>
        <GridList
          className={styles.menu}
          style={{height: 200, width: 200}}
          aria-label="test gridlist">
          <GridListSection>
            <GridListHeader>Section 1</GridListHeader>
            <MyGridListItem textValue="Foo">Foo <Button>Actions</Button></MyGridListItem>
            <MyGridListItem textValue="Bar">Bar <Button>Actions</Button></MyGridListItem>
            <MyGridListItem textValue="Baz">Baz <Button>Actions</Button></MyGridListItem>
          </GridListSection>
          <GridListSection>
            <GridListHeader>Section 2</GridListHeader>
            <MyGridListItem textValue="Charizard">Charizard<Button>Actions</Button></MyGridListItem>
            <MyGridListItem textValue="Blastoise">Blastoise <Button>Actions</Button></MyGridListItem>
            <MyGridListItem textValue="Pikachu">Pikachu <Button>Actions</Button></MyGridListItem>
            <MyGridListItem textValue="Venusaur">Venusaur<Button>Actions</Button></MyGridListItem>
          </GridListSection>
          <GridListSection>
            <GridListHeader>Section 3</GridListHeader>
            <MyGridListItem textValue="text value check">textValue is "text value check" <Button>Actions</Button></MyGridListItem>
            <MyGridListItem textValue="Blah">Blah <Button>Actions</Button></MyGridListItem>
          </GridListSection>
        </GridList>
      </div>
    </AutocompleteWrapper>
  );
};

export const AutocompleteWithTable = () => {
  return (
    <AutocompleteWrapper>
      <div>
        <TextField autoFocus data-testid="autocomplete-example">
          <Label style={{display: 'block'}}>Test</Label>
          <Input />
        </TextField>
        <Virtualizer
          layout={TableLayout}
          layoutOptions={{
            rowHeight: 25,
            headingHeight: 25,
            padding: 10
          }}>
          <Table aria-label="Files" selectionMode="multiple" style={{height: 400, width: 400, overflow: 'auto', scrollPaddingTop: 25}}>
            <TableHeader style={{background: 'var(--spectrum-gray-100)', width: '100%', height: '100%'}}>
              <Column>
                <MyCheckbox slot="selection" />
              </Column>
              <Column isRowHeader>Name</Column>
              <Column>Type</Column>
              <Column>Date Modified</Column>
            </TableHeader>
            <TableBody>
              <Row id="1" style={{width: 'inherit', height: 'inherit'}}>
                <Cell>
                  <MyCheckbox slot="selection" />
                </Cell>
                <Cell>Games</Cell>
                <Cell>File folder</Cell>
                <Cell>6/7/2020</Cell>
              </Row>
              <Row id="2" style={{width: 'inherit', height: 'inherit'}}>
                <Cell>
                  <MyCheckbox slot="selection" />
                </Cell>
                <Cell>Program Files</Cell>
                <Cell>File folder</Cell>
                <Cell>4/7/2021</Cell>
              </Row>
              <Row id="3" style={{width: 'inherit', height: 'inherit'}}>
                <Cell>
                  <MyCheckbox slot="selection" />
                </Cell>
                <Cell>bootmgr</Cell>
                <Cell>System file</Cell>
                <Cell>11/20/2010</Cell>
              </Row>
              <Row id="4" style={{width: 'inherit', height: 'inherit'}}>
                <Cell>
                  <MyCheckbox slot="selection" />
                </Cell>
                <Cell>log.txt</Cell>
                <Cell>Text Document</Cell>
                <Cell>1/18/2016</Cell>
              </Row>
            </TableBody>
          </Table>
        </Virtualizer>
      </div>
    </AutocompleteWrapper>
  );
};

export const AutocompleteWithTagGroup = () => {
  return (
    <AutocompleteWrapper>
      <div>
        <TextField autoFocus data-testid="autocomplete-example">
          <Label style={{display: 'block'}}>Test</Label>
          <Input />
        </TextField>
        <TagGroup>
          <Label>Categories</Label>
          <TagList style={{display: 'flex', gap: 4}}>
            <MyTag href="https://nytimes.com">News</MyTag>
            <MyTag>Travel</MyTag>
            <MyTag>Gaming</MyTag>
            <TooltipTrigger>
              <MyTag>Shopping</MyTag>
              <Tooltip
                offset={5}
                style={{
                  background: 'Canvas',
                  color: 'CanvasText',
                  border: '1px solid gray',
                  padding: 5,
                  borderRadius: 4
                }}>
                <OverlayArrow style={{transform: 'translateX(-50%)'}}>
                  <svg width="8" height="8" style={{display: 'block'}}>
                    <path d="M0 0L4 4L8 0" fill="white" strokeWidth={1} stroke="gray" />
                  </svg>
                </OverlayArrow>
                I am a tooltip
              </Tooltip>
            </TooltipTrigger>
          </TagList>
        </TagGroup>
      </div>
    </AutocompleteWrapper>
  );
};

type MenuNode = {
  name: string,
  id?: string,
  isSection?: boolean,
  isMenu?: boolean,
  children?: MenuNode[]
}

function AutocompleteNodeFiltering(args) {
  let {contains} = useFilter({sensitivity: 'base'});
  let filter = (textValue: string, inputValue: string, node: Node<MenuNode>) => {
    if ((node.parentKey === 'Section 1' && textValue === 'Open View') || (node.parentKey === 'Section 2' && textValue === 'Appearance')) {
      return true;
    }

    return contains(textValue, inputValue);
  };

  return (
    <Autocomplete<MenuNode> filter={filter} disableVirtualFocus={args.disableVirtualFocus}>
      <div>
        <SearchField autoFocus>
          <Label style={{display: 'block'}}>Test</Label>
          <Input />
          <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
        </SearchField>
        <Menu className={styles.menu} items={dynamicAutocompleteSubdialog} {...args}>
          {item => dynamicRenderFuncSections(item)}
        </Menu>
      </div>
    </Autocomplete>
  );
}

export const AutocompletePreserveFirstSectionStory: AutocompleteStory = {
  render: (args) => <AutocompleteNodeFiltering {...args} />,
  name: 'Autocomplete, per node filtering',
  parameters: {
    description: {
      data: 'It should never filter out Open View or Appearance'
    }
  }
};


let names = [
  {id: 1, name: 'David'},
  {id: 2, name: 'Sam'},
  {id: 3, name: 'Julia'}
];

const UserCustomFiltering = (args): React.ReactElement => {
  let [value, setValue] = useState('');

  let {contains} = useFilter({sensitivity: 'base'});


  let filter = (textValue, inputValue) => {
    let index = inputValue.lastIndexOf('@');
    let filterText = '';
    if (index > -1) {
      filterText = value.slice(index + 1);
    }

    return contains(textValue, filterText);
  };

  let onAction = (key) => {
    let index = value.lastIndexOf('@');
    if (index === -1) {
      index = value.length;
    }
    let name = names.find(person => person.id === key)!.name;
    setValue(value.slice(0, index).concat(name));
  };

  return (
    <Autocomplete inputValue={value} onInputChange={setValue} filter={filter} disableVirtualFocus={args.disableVirtualFocus}>
      <div>
        <TextField autoFocus>
          <Label style={{display: 'block'}}>Test</Label>
          <TextArea />
          <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
        </TextField>
        <ListBox {...args} className={styles.menu} items={names} aria-label="test listbox with sections" onAction={onAction} >
          {(item: any) => (
            <MyListBoxItem id={item.id}>
              {item.name}
            </MyListBoxItem>
          )}

        </ListBox>
      </div>
    </Autocomplete>
  );
};

export const AutocompleteUserCustomFiltering: AutocompleteStory = {
  render: (args) => <UserCustomFiltering {...args} />,
  name: 'Autocomplete, user custom filterText (mentions)',
  parameters: {
    description: {
      data: 'It should only filter if you type @, using the remainder of the string after the @ symbol as the filter text'
    }
  }
};
