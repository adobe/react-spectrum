/**
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  ActionButton,
  ActionButtonGroup,
  Collection,
  Image,
  Key,
  Text,
  TreeView,
  TreeViewItem,
  TreeViewItemContent,
  TreeViewItemProps,
  TreeViewLoadMoreItem,
  TreeViewLoadMoreItemProps,
  TreeViewProps
} from '../src';
import {categorizeArgTypes, getActionArgs} from './utils';
import {checkers} from './assets/check';
import FileTxt from '../s2wf-icons/S2_Icon_FileText_20_N.svg';
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import FolderOpen from '../s2wf-icons/S2_Icon_FolderOpen_20_N.svg';
import Lock from '../s2wf-icons/S2_Icon_Lock_20_N.svg';
import LockOpen from '../s2wf-icons/S2_Icon_LockOpen_20_N.svg';
import type {Meta, StoryObj} from '@storybook/react';
import React, {ReactElement, useState} from 'react';
import Visibility from '../s2wf-icons/S2_Icon_Visibility_20_N.svg';
import VisibilityOff from '../s2wf-icons/S2_Icon_VisibilityOff_20_N.svg';

const events = ['onSelectionChange'];

const meta: Meta<typeof TreeView> = {
  title: 'Highlight Selection/TreeView',
  component: TreeView,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {...getActionArgs(events)},
  argTypes: {
    ...categorizeArgTypes('Events', events),
    children: {table: {disable: true}}
  }
};

export default meta;


interface TreeViewLayersItemType {
  id?: string,
  name: string,
  icon?: ReactElement,
  childItems?: TreeViewLayersItemType[],
  isLocked?: boolean,
  isVisible?: boolean
}

let layersRows: TreeViewLayersItemType[] = [
  {id: 'layer-1', name: 'Layer', icon: <Image src={checkers} alt="" />},
  {id: 'layer-2', name: 'Layer', icon: <Image src={checkers} alt="" />, isVisible: false},
  {id: 'layer-group-1', name: 'Layer group', icon: <Image src={checkers} alt="" />, isVisible: false, childItems: [
    {id: 'layer-group-1-1', name: 'Layer', icon: <Image src={checkers} alt="" />},
    {id: 'layer-group-1-2', name: 'Layer', icon: <Image src={checkers} alt="" />},
    {id: 'layer-group-1-3', name: 'Layer', icon: <Image src={checkers} alt="" />},
    {id: 'layer-group-1-4', name: 'Layer', icon: <Image src={checkers} alt="" />},
    {id: 'layer-group-1-group-1', name: 'Layer Group', icon: <Image src={checkers} alt="" />, childItems: [
      {id: 'layer-group-1-group-1-1', name: 'Layer', icon: <Image src={checkers} alt="" />},
      {id: 'layer-group-1-group-1-2', name: 'Layer', icon: <Image src={checkers} alt="" />},
      {id: 'layer-group-1-group-1-3', name: 'Layer', icon: <Image src={checkers} alt="" />}
    ]}
  ]},
  {id: 'layer-group-2', name: 'Layer group', icon: <Image src={checkers} alt="" />, isLocked: true, childItems: [
    {id: 'layer-group-2-1', name: 'Layer', icon: <Image src={checkers} alt="" />},
    {id: 'layer-group-2-2', name: 'Layer', icon: <Image src={checkers} alt="" />, isVisible: false},
    {id: 'layer-group-2-3', name: 'Layer', icon: <Image src={checkers} alt="" />, isLocked: true},
    {id: 'layer-group-2-4', name: 'Layer', icon: <Image src={checkers} alt="" />},
    {id: 'layer-group-2-group-1', name: 'Layer Group', icon: <Image src={checkers} alt="" />}
  ]},
  {id: 'layer-group-3', name: 'Layer group', icon: <Image src={checkers} alt="" />, childItems: [
    {id: 'reports-1', name: 'Reports 1', icon: <Image src={checkers} alt="" />, childItems: [
      {id: 'layer-group-3-1', name: 'Layer', icon: <Image src={checkers} alt="" />},
      {id: 'layer-group-3-2', name: 'Layer', icon: <Image src={checkers} alt="" />},
      {id: 'layer-group-3-3', name: 'Layer', icon: <Image src={checkers} alt="" />},
      {id: 'layer-group-3-4', name: 'Layer', icon: <Image src={checkers} alt="" />},
      {id: 'layer-group-3-group-1', name: 'Layer Group', icon: <Image src={checkers} alt="" />, childItems: [
        {id: 'layer-group-3-group-1-1', name: 'Layer', icon: <Image src={checkers} alt="" />},
        {id: 'layer-group-3-group-1-2', name: 'Layer', icon: <Image src={checkers} alt="" />},
        {id: 'layer-group-3-group-1-3', name: 'Layer', icon: <Image src={checkers} alt="" />}
      ]}
    ]},
    {id: 'layer-group-3-2', name: 'Layer', icon: <Image src={checkers} alt="" />},
    {id: 'layer-group-3-3', name: 'Layer', icon: <Image src={checkers} alt="" />},
    {id: 'layer-group-3-4', name: 'Layer', icon: <Image src={checkers} alt="" />},
    ...Array.from({length: 100}, (_, i) => ({id: `layer-group-3-repeat-${i}`, name: 'Layer', icon: <Image src={checkers} alt="" />}))
  ]},
  {id: 'layer-4', name: 'Layer', icon: <FileTxt />, isLocked: true, isVisible: false}
];

const TreeExampleLayersItem = (props: Omit<TreeViewItemProps, 'children'> & TreeViewLayersItemType & TreeViewLoadMoreItemProps): ReactElement => {
  let {childItems, name, icon = <FileTxt />, loadingState, onLoadMore, isLocked = false, isVisible = true} = props;
  return (
    <>
      <TreeViewItem id={props.id} textValue={name} href={props.href}>
        <TreeViewItemContent>
          <Text>{name}</Text>
          {icon}
          <ActionButtonGroup>
            <ActionButton isQuiet>{isLocked ? <Lock /> : <LockOpen />}</ActionButton>
            <ActionButton isQuiet>{isVisible ? <Visibility /> : <VisibilityOff />}</ActionButton>
          </ActionButtonGroup>
        </TreeViewItemContent>
        <Collection items={childItems}>
          {(item) => (
            <TreeExampleLayersItem
              textValue={item.id || item.name}
              {...item} />
          )}
        </Collection>
        {onLoadMore && loadingState && <TreeViewLoadMoreItem loadingState={loadingState} onLoadMore={onLoadMore} /> }
      </TreeViewItem>
    </>
  );
};

const TreeExampleLayers = (args: TreeViewProps<TreeViewLayersItemType>): ReactElement => (
  <div style={{width: '300px', resize: 'both', height: '320px', overflow: 'auto', display: 'flex', flexDirection: 'column'}}>
    <TreeView aria-label="test dynamic tree" items={layersRows} {...args}>
      {(item) => (
        <TreeExampleLayersItem textValue={item.id || item.name} {...item} />
      )}
    </TreeView>
  </div>
);

export const LayersTree: StoryObj<typeof TreeExampleLayers> = {
  render: TreeExampleLayers,
  args: {
    defaultExpandedKeys: ['layer-group-2'],
    selectionMode: 'multiple',
    selectionStyle: 'highlight',
    selectionCornerStyle: 'round'
  }
};

interface TreeViewFileItemType {
  id?: string,
  name: string,
  icon?: ReactElement,
  childItems?: TreeViewFileItemType[],
  isExpanded?: boolean
}

let rows: TreeViewFileItemType[] = [
  {id: 'documentation', name: 'Documentation', icon: <Folder />, childItems: [
    {id: 'project-1', name: 'Project 1 Level 1', icon: <FileTxt />},
    {id: 'project-2', name: 'Project 2 Level 1', icon: <Folder />, childItems: [
      {id: 'project-2A', name: 'Project 2A Level 2', icon: <FileTxt />},
      {id: 'project-2B', name: 'Project 2B Level 2', icon: <FileTxt />},
      {id: 'project-2C', name: 'Project 2C Level 3', icon: <FileTxt />}
    ]},
    {id: 'project-3', name: 'Project 3', icon: <FileTxt />},
    {id: 'project-4', name: 'Project 4', icon: <FileTxt />},
    {id: 'project-5', name: 'Project 5', icon: <Folder />, childItems: [
      {id: 'project-5A', name: 'Project 5A', icon: <FileTxt />},
      {id: 'project-5B', name: 'Project 5B', icon: <FileTxt />},
      {id: 'project-5C', name: 'Project 5C', icon: <FileTxt />}
    ]},
    ...Array.from({length: 100}, (_, i) => ({id: `projects-repeat-${i}`, name: `Reports ${i}`, icon: <FileTxt />}))
  ]},
  {id: 'branding', name: 'Branding', icon: <Folder />, childItems: [
    {id: 'proposals', name: 'Proposals', icon: <FileTxt />},
    {id: 'explorations', name: 'Explorations', icon: <FileTxt />},
    {id: 'assets', name: 'Assets', icon: <FileTxt />}
  ]},
  {id: 'file01', name: 'File 01', icon: <FileTxt />},
  {id: 'file02', name: 'File 02', icon: <FileTxt />},
  {id: 'file03', name: 'File 03', icon: <FileTxt />}
];

const TreeExampleFileItem = (props: Omit<TreeViewItemProps, 'children'> & TreeViewFileItemType & TreeViewLoadMoreItemProps & {expandedKeys: Set<Key>}): ReactElement => {
  let {childItems, name, icon = <FileTxt />, loadingState, onLoadMore, expandedKeys} = props;
  let isExpanded = expandedKeys.has(props.id as Key);
  return (
    <>
      <TreeViewItem id={props.id} textValue={name} href={props.href}>
        <TreeViewItemContent>
          <Text>{name}</Text>
          {isExpanded ? <FolderOpen /> : icon}
        </TreeViewItemContent>
        <Collection items={childItems}>
          {(item) => (
            <TreeExampleFileItem
              id={item.id || item.name}
              icon={item.icon}
              childItems={item.childItems}
              textValue={item.name}
              name={item.name}
              expandedKeys={expandedKeys}
              href={props.href} />
          )}
        </Collection>
        {onLoadMore && loadingState && <TreeViewLoadMoreItem loadingState={loadingState} onLoadMore={onLoadMore} /> }
      </TreeViewItem>
    </>
  );
};

const TreeExampleFiles = (args: TreeViewProps<TreeViewFileItemType>): ReactElement => {
  let [expandedKeys, setExpandedKeys] = useState<Set<Key>>(new Set(['branding']));
  let [items, setItems] = useState(rows);
  let onExpandedChange = (keys: Set<Key>) => {
    setExpandedKeys(keys);
    // Iterate over depth first all items in 'rows' that are in the keys set, add a property 'isExpanded' to the item. we must maintain the tree structure.
    // This is to work around the fact that we cannot change the icon inside the TreeViewItemContent because it doesn't re-render for the expanded state change.
    let newItems = rows.reduce((acc, item) => {
      let iterator = (children: TreeViewFileItemType[]) => {
        return children.map(child => {
          let newChild = {...child};
          if (keys.has(child.id as Key)) {
            newChild.isExpanded = true;
          }
          if (child.childItems) {
            newChild.childItems = iterator(child.childItems);
          }
          return newChild;
        });
      };
      let newChildren;
      if (item.childItems) {
        newChildren = iterator(item.childItems);
      }
      acc.push({...item, isExpanded: keys.has(item.id as Key), childItems: newChildren});
      return acc;
    }, [] as TreeViewFileItemType[]);
    setItems(newItems);
  };
  return (
    <div style={{width: '300px', resize: 'both', height: '320px', overflow: 'auto', display: 'flex', flexDirection: 'column'}}>
      <TreeView selectionCornerStyle="square" aria-label="test dynamic tree" items={items} onExpandedChange={onExpandedChange} expandedKeys={expandedKeys} {...args}>
        {(item) => (
          <TreeExampleFileItem
            id={item.id}
            expandedKeys={expandedKeys}
            icon={item.icon}
            childItems={item.childItems}
            textValue={item.name}
            name={item.name} />
        )}
      </TreeView>
    </div>
  );
};

export const FileTree: StoryObj<typeof TreeExampleFiles> = {
  render: TreeExampleFiles,
  args: {
    selectionMode: 'multiple',
    selectionStyle: 'highlight'
  }
};
