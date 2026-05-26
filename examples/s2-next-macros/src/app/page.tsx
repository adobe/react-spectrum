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

'use client';

import React, {useState} from 'react';
import '@react-spectrum/s2/page.css';
import {
  ActionButton,
  ActionButtonGroup,
  ActionMenu,
  Button,
  ButtonGroup,
  Cell,
  Collection,
  Column,
  Content,
  ContextualHelpPopover,
  Divider,
  Heading,
  LinkButton,
  ListView,
  ListViewItem,
  Menu,
  MenuItem,
  MenuTrigger,
  NotificationBadge,
  Picker,
  PickerItem,
  Provider,
  Row,
  SubmenuTrigger,
  TableBody,
  TableHeader,
  TableView,
  Text,
  ToggleButton,
  ToggleButtonGroup,
  TreeView,
  TreeViewItem,
  TreeViewItemContent,
  UnavailableMenuItemTrigger,
  useDragAndDrop,
  useListData,
  useTreeData
} from '@react-spectrum/s2';
import Edit from '@react-spectrum/s2/icons/Edit';
import FileTxt from '@react-spectrum/s2/icons/FileText';
import Folder from '@react-spectrum/s2/icons/Folder';
import Section from './components/Section';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {CardViewExample} from './components/CardViewExample';
import {CollectionCardsExample} from './components/CollectionCardsExample';

const Lazy = React.lazy(() => import('./Lazy.js'));

type TreeItemData = {id: string; name: string; childItems?: TreeItemData[]};

let listItems = [
  {id: 'photoshop', name: 'Adobe Photoshop'},
  {id: 'xd', name: 'Adobe XD'},
  {id: 'indesign', name: 'Adobe InDesign'},
  {id: 'premiere', name: 'Adobe Premiere'},
  {id: 'aftereffects', name: 'Adobe After Effects'}
];

let tableItems = [
  {id: '1', name: 'Games', type: 'File folder', modified: '6/7/2020'},
  {id: '2', name: 'Program Files', type: 'File folder', modified: '4/7/2021'},
  {id: '3', name: 'bootmgr', type: 'System file', modified: '11/20/2010'},
  {id: '4', name: 'log.txt', type: 'Text document', modified: '1/2/2022'},
  {id: '5', name: 'readme.md', type: 'Text document', modified: '3/15/2023'}
];

let treeItems: TreeItemData[] = [
  {id: 'photos', name: 'Photos'},
  {
    id: 'projects',
    name: 'Projects',
    childItems: [
      {
        id: 'projects-1',
        name: 'Projects-1',
        childItems: [{id: 'projects-1A', name: 'Projects-1A'}]
      },
      {id: 'projects-2', name: 'Projects-2'},
      {id: 'projects-3', name: 'Projects-3'}
    ]
  }
];

function ReorderableListView() {
  let list = useListData({initialItems: listItems});
  let {dragAndDropHooks} = useDragAndDrop({
    getItems: keys =>
      [...keys].map(key => {
        let item = list.getItem(key)!;
        return {'text/plain': item.name};
      }),
    onReorder(e) {
      if (e.target.dropPosition === 'before') {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        list.moveAfter(e.target.key, e.keys);
      }
    }
  });
  return (
    <ListView
      aria-label="Reorderable files"
      selectionMode="multiple"
      items={list.items}
      dragAndDropHooks={dragAndDropHooks}
      styles={style({width: 320, height: 320})}>
      {(item: any) => (
        <ListViewItem textValue={item.name}>
          <Text>{item.name}</Text>
        </ListViewItem>
      )}
    </ListView>
  );
}

function ReorderableTableView() {
  let list = useListData({initialItems: tableItems});
  let {dragAndDropHooks} = useDragAndDrop({
    getItems: keys =>
      [...keys].map(key => {
        let item = list.getItem(key)!;
        return {'text/plain': item.name};
      }),
    onReorder(e) {
      if (e.target.dropPosition === 'before') {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        list.moveAfter(e.target.key, e.keys);
      }
    }
  });
  return (
    <TableView
      aria-label="Reorderable files"
      selectionMode="multiple"
      dragAndDropHooks={dragAndDropHooks}
      styles={style({width: 320, height: 320})}>
      <TableHeader>
        <Column isRowHeader>Name</Column>
        <Column>Type</Column>
        <Column>Date Modified</Column>
      </TableHeader>
      <TableBody items={list.items}>
        {(item: any) => (
          <Row id={item.id}>
            <Cell>{item.name}</Cell>
            <Cell>{item.type}</Cell>
            <Cell>{item.modified}</Cell>
          </Row>
        )}
      </TableBody>
    </TableView>
  );
}

function TreeItem({id, name, childItems}: TreeItemData) {
  return (
    <TreeViewItem id={id} textValue={name}>
      <TreeViewItemContent>
        <Text>{name}</Text>
        {childItems?.length ? <Folder /> : <FileTxt />}
      </TreeViewItemContent>
      {childItems && childItems.length > 0 && (
        <Collection items={childItems}>{(item: TreeItemData) => <TreeItem {...item} />}</Collection>
      )}
    </TreeViewItem>
  );
}

function ReorderableTreeView() {
  let treeData = useTreeData<TreeItemData>({
    initialItems: treeItems,
    getKey: item => item.id,
    getChildren: item => item.childItems ?? []
  });
  let processItem = (node: any): TreeItemData => ({
    ...node.value,
    id: node.key as string,
    childItems: node.children ? [...node.children].map(processItem) : undefined
  });
  let items = treeData.items.map(processItem);
  let {dragAndDropHooks} = useDragAndDrop({
    getItems: keys =>
      [...keys].map(key => {
        let item = treeData.getItem(key)!;
        return {'text/plain': item.value.name};
      }),
    getAllowedDropOperations: () => ['move'],
    onMove(e) {
      if (e.target.dropPosition === 'before') {
        treeData.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        treeData.moveAfter(e.target.key, e.keys);
      }
    }
  });
  return (
    <TreeView
      aria-label="Reorderable tree"
      items={items}
      dragAndDropHooks={dragAndDropHooks}
      styles={style({width: 320, height: 320})}>
      {(item: TreeItemData) => <TreeItem {...item} />}
    </TreeView>
  );
}

function App() {
  let [isLazyLoaded, setLazyLoaded] = useState(false);
  let [cardViewState, setCardViewState] = useState({
    layout: 'grid',
    loadingState: 'idle'
  });
  let cardViewLoadingOptions = [
    {id: 'idle', label: 'Idle'},
    {id: 'loading', label: 'Loading'},
    {id: 'sorting', label: 'Sorting'},
    {id: 'loadingMore', label: 'Loading More'},
    {id: 'error', label: 'Error'}
  ];
  let cardViewLayoutOptions = [
    {id: 'grid', label: 'Grid'},
    {id: 'waterfall', label: 'Waterfall'}
  ];
  return (
    <Provider elementType="main">
      <Heading styles={style({font: 'heading-xl', textAlign: 'center'})} level={1}>
        Spectrum 2 + Next.js
      </Heading>
      <div
        className={style({
          maxWidth: 288,
          margin: 'auto'
        })}>
        <Divider />
      </div>
      <div
        className={style({
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'center'
        })}>
        <Section title="Buttons">
          <ButtonGroup align="center" styles={style({maxWidth: '[100vw]'})}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">
              <Text>Secondary</Text>
            </Button>
            <ActionButton>
              <Edit />
              <Text>Action Button</Text>
              <NotificationBadge value={2} />
            </ActionButton>
            <ToggleButton>Toggle Button</ToggleButton>
            <LinkButton variant="primary" href="https://adobe.com" target="_blank">
              Link Button
            </LinkButton>
            <ActionButtonGroup density="compact">
              <ActionButton>Cut</ActionButton>
              <ActionButton>Copy</ActionButton>
              <ActionButton>Paste</ActionButton>
            </ActionButtonGroup>
            <ToggleButtonGroup density="compact" selectionMode="multiple">
              <ToggleButton id="bold">Bold</ToggleButton>
              <ToggleButton id="italic">Italic</ToggleButton>
              <ToggleButton id="underline">Underline</ToggleButton>
            </ToggleButtonGroup>
          </ButtonGroup>
        </Section>

        <Section title="Collections">
          <ActionMenu>
            <MenuItem>Action Menu Item 1</MenuItem>
            <MenuItem>Action Menu Item 2</MenuItem>
            <MenuItem>Action Menu Item 3</MenuItem>
          </ActionMenu>
          <Picker
            label="CardView Loading State"
            items={cardViewLoadingOptions}
            selectedKey={cardViewState.loadingState}
            onSelectionChange={loadingState =>
              setCardViewState({...cardViewState, loadingState: loadingState as string})
            }>
            {item => <PickerItem id={item.id}>{item.label}</PickerItem>}
          </Picker>
          <Picker
            label="CardView Layout"
            items={cardViewLayoutOptions}
            selectedKey={cardViewState.layout}
            onSelectionChange={layout =>
              setCardViewState({...cardViewState, layout: layout as string})
            }>
            {item => <PickerItem id={item.id}>{item.label}</PickerItem>}
          </Picker>
          <CardViewExample {...cardViewState} />
          <Divider styles={style({maxWidth: 320, marginX: 'auto'})} />
          <CollectionCardsExample loadingState={cardViewState.loadingState} />
          <MenuTrigger>
            <ActionButton>Menu</ActionButton>
            <Menu onAction={key => alert(key.toString())}>
              <MenuItem id="cut">Cut</MenuItem>
              <MenuItem id="copy">Copy</MenuItem>
              <MenuItem id="paste">Paste</MenuItem>
              <MenuItem id="replace">Replace</MenuItem>
              <SubmenuTrigger>
                <MenuItem id="share">Share</MenuItem>
                <Menu onAction={key => alert(key.toString())}>
                  <MenuItem id="copy-ink">Copy Link</MenuItem>
                  <SubmenuTrigger>
                    <MenuItem id="email">Email</MenuItem>
                    <Menu onAction={key => alert(key.toString())}>
                      <MenuItem id="attachment">Email as Attachment</MenuItem>
                      <MenuItem id="link">Email as Link</MenuItem>
                    </Menu>
                  </SubmenuTrigger>
                  <MenuItem id="sms">SMS</MenuItem>
                </Menu>
              </SubmenuTrigger>
              <UnavailableMenuItemTrigger isUnavailable>
                <MenuItem id="delete">Delete</MenuItem>
                <ContextualHelpPopover>
                  <Heading slot="title">Permission required</Heading>
                  <Content>Contact your administrator for permissions to delete.</Content>
                </ContextualHelpPopover>
              </UnavailableMenuItemTrigger>
            </Menu>
          </MenuTrigger>
          <MenuTrigger>
            <ActionButton>Menu Trigger</ActionButton>
            <Menu>
              <MenuItem href="/foo">Link to /foo</MenuItem>
              <MenuItem>Cut</MenuItem>
              <MenuItem>Copy</MenuItem>
              <MenuItem>Paste</MenuItem>
            </Menu>
          </MenuTrigger>
          <ReorderableListView />
          <ReorderableTableView />
          <ReorderableTreeView />
        </Section>

        {!isLazyLoaded && (
          <ActionButton onPress={() => setLazyLoaded(true)}>Load more</ActionButton>
        )}
        {isLazyLoaded && (
          <React.Suspense fallback={<>Loading</>}>
            <Lazy />
          </React.Suspense>
        )}
      </div>
    </Provider>
  );
}

export default App;
