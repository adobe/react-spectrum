/*
 * Copyright 2020 Adobe. All rights reserved.
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
import {ActionGroup, Item} from '@react-spectrum/actiongroup';
import Delete from '@spectrum-icons/workflow/Delete';
import Edit from '@spectrum-icons/workflow/Edit';
import FileTxt from '@spectrum-icons/workflow/FileTxt';
import Folder from '@spectrum-icons/workflow/Folder';
import React from 'react';
import {SpectrumTreeViewProps, TreeView, TreeViewItem} from '../src';
import {Text} from '@react-spectrum/text';

export default {
  title: 'Tree'
};

// TODO: audit the package json
// TODO add href story and onAction story for static and dynamic

// TODO add a resizable wrapper around this but for now apply a widht and height
export const TreeExampleStatic = (args: SpectrumTreeViewProps<unknown>) => (
  <TreeView {...args} height={300} width={300} disabledKeys={['projects-1']} aria-label="test static tree" onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
    <TreeViewItem id="Photos" textValue="Photos">
      <Text>Photos</Text>
      <Folder />
      <ActionGroup onAction={action('onActionGroup action')}>
        <Item key="edit">
          <Edit />
          <Text>Edit</Text>
        </Item>
        <Item key="delete">
          <Delete />
          <Text>Delete</Text>
        </Item>
      </ActionGroup>
    </TreeViewItem>
    <TreeViewItem id="projects" textValue="Projects">
      <Text>Projects</Text>
      <Folder />
      <ActionGroup onAction={action('onActionGroup action')}>
        <Item key="edit">
          <Edit />
          <Text>Edit</Text>
        </Item>
        <Item key="delete">
          <Delete />
          <Text>Delete</Text>
        </Item>
      </ActionGroup>
      <TreeViewItem id="projects-1" textValue="Projects-1">
        <Text>Projects-1</Text>
        <Folder />
        <ActionGroup onAction={action('onActionGroup action')}>
          <Item key="edit">
            <Edit />
            <Text>Edit</Text>
          </Item>
          <Item key="delete">
            <Delete />
            <Text>Delete</Text>
          </Item>
        </ActionGroup>
        <TreeViewItem id="projects-1A" textValue="Projects-1A">
          <Text>Projects-1A</Text>
          <FileTxt />
          <ActionGroup onAction={action('onActionGroup action')}>
            <Item key="edit">
              <Edit />
              <Text>Edit</Text>
            </Item>
            <Item key="delete">
              <Delete />
              <Text>Delete</Text>
            </Item>
          </ActionGroup>
        </TreeViewItem>
      </TreeViewItem>
      <TreeViewItem id="projects-2" textValue="Projects-2">
        <Text>Projects-2</Text>
        <FileTxt />
        <ActionGroup onAction={action('onActionGroup action')}>
          <Item key="edit">
            <Edit />
            <Text>Edit</Text>
          </Item>
          <Item key="delete">
            <Delete />
            <Text>Delete</Text>
          </Item>
        </ActionGroup>
      </TreeViewItem>
      <TreeViewItem id="projects-3" textValue="Projects-3">
        <Text>Projects-3</Text>
        <FileTxt />
        <ActionGroup onAction={action('onActionGroup action')}>
          <Item key="edit">
            <Edit />
            <Text>Edit</Text>
          </Item>
          <Item key="delete">
            <Delete />
            <Text>Delete</Text>
          </Item>
        </ActionGroup>
      </TreeViewItem>
    </TreeViewItem>
  </TreeView>
);

TreeExampleStatic.story = {
  args: {
    selectionMode: 'none',
    selectionBehavior: 'toggle',
    disabledBehavior: 'selection'
  },
  argTypes: {
    selectionMode: {
      control: {
        type: 'radio',
        options: ['none', 'single', 'multiple']
      }
    },
    selectionBehavior: {
      control: {
        type: 'radio',
        options: ['toggle', 'replace']
      }
    },
    disabledBehavior: {
      control: {
        type: 'radio',
        options: ['selection', 'all']
      }
    }
  }
};

let rows = [
  {id: 'projects', name: 'Projects', icon: <Folder />, childItems: [
    {id: 'project-1', name: 'Project 1', icon: <FileTxt />},
    {id: 'project-2', name: 'Project 2', icon: <Folder />, childItems: [
      {id: 'project-2A', name: 'Project 2A', icon: <FileTxt />},
      {id: 'project-2B', name: 'Project 2B', icon: <FileTxt />},
      {id: 'project-2C', name: 'Project 2C', icon: <FileTxt />}
    ]},
    {id: 'project-3', name: 'Project 3', icon: <FileTxt />},
    {id: 'project-4', name: 'Project 4', icon: <FileTxt />},
    {id: 'project-5', name: 'Project 5', icon: <Folder />, childItems: [
      {id: 'project-5A', name: 'Project 5A', icon: <FileTxt />},
      {id: 'project-5B', name: 'Project 5B', icon: <FileTxt />},
      {id: 'project-5C', name: 'Project 5C', icon: <FileTxt />}
    ]}
  ]},
  {id: 'reports', name: 'Reports', icon: <Folder />, childItems: [
    {id: 'reports-1', name: 'Reports 1', icon: <Folder />, childItems: [
      {id: 'reports-1A', name: 'Reports 1A', icon: <Folder />, childItems: [
        {id: 'reports-1AB', name: 'Reports 1AB', icon: <Folder />, childItems: [
          {id: 'reports-1ABC', name: 'Reports 1ABC', icon: <FileTxt />}
        ]}
      ]},
      {id: 'reports-1B', name: 'Reports 1B', icon: <FileTxt />},
      {id: 'reports-1C', name: 'Reports 1C', icon: <FileTxt />}
    ]},
    {id: 'reports-2', name: 'Reports 2', icon: <FileTxt />}
  ]}
];

export const TreeExampleDynamic = (args: SpectrumTreeViewProps<unknown>) => (
  <TreeView {...args} width={300} height={300} defaultExpandedKeys="all" disabledKeys={['reports-1AB']} aria-label="test dynamic tree" items={rows} onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
    {(item) => (
      <TreeViewItem childItems={item.childItems} textValue={item.name}>
        <Text>{item.name}</Text>
        {item.icon}
        <ActionGroup onAction={action('onActionGroup action')}>
          <Item key="edit">
            <Edit />
            <Text>Edit</Text>
          </Item>
          <Item key="delete">
            <Delete />
            <Text>Delete</Text>
          </Item>
        </ActionGroup>
      </TreeViewItem>
    )}
  </TreeView>
);

TreeExampleDynamic.story = {
  ...TreeExampleStatic.story,
  parameters: null
};
