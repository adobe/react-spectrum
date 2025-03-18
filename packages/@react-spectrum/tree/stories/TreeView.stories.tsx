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
import {Collection} from 'react-aria-components';
import {Content} from '@react-spectrum/view';
import Delete from '@spectrum-icons/workflow/Delete';
import Edit from '@spectrum-icons/workflow/Edit';
import FileTxt from '@spectrum-icons/workflow/FileTxt';
import Folder from '@spectrum-icons/workflow/Folder';
import {Heading, Text} from '@react-spectrum/text';
import {IllustratedMessage} from '@react-spectrum/illustratedmessage';
import {Link} from '@react-spectrum/link';
import React from 'react';
import {SpectrumTreeViewProps, TreeView, TreeViewItem, TreeViewItemContent} from '../src';

export default {
  title: 'TreeView',
  excludeStories: [
    'renderEmptyState'
  ],
  argTypes: {
    items: {
      table: {
        disable: true
      }
    },
    renderEmptyState: {
      table: {
        disable: true
      }
    }
  }
};

// TODO: This story crashes on save and story switch, not sure why or if only local...
export const TreeExampleStatic = (args: SpectrumTreeViewProps<unknown>) => (
  <div style={{width: '300px', resize: 'both', height: '90vh', overflow: 'auto'}}>
    <TreeView {...args} disabledKeys={['projects-1']} aria-label="test static tree" onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
      <TreeViewItem id="Photos" textValue="Photos">
        <TreeViewItemContent>
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
        </TreeViewItemContent>
      </TreeViewItem>
      <TreeViewItem id="projects" textValue="Projects">
        <TreeViewItemContent>
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
        </TreeViewItemContent>
        <TreeViewItem id="projects-1" textValue="Projects-1">
          <TreeViewItemContent>
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
          </TreeViewItemContent>
          <TreeViewItem id="projects-1A" textValue="Projects-1A">
            <TreeViewItemContent>
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
            </TreeViewItemContent>
          </TreeViewItem>
        </TreeViewItem>
        <TreeViewItem id="projects-2" textValue="Projects-2">
          <TreeViewItemContent>
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
          </TreeViewItemContent>
        </TreeViewItem>
        <TreeViewItem id="projects-3" textValue="Projects-3">
          <TreeViewItemContent>
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
          </TreeViewItemContent>
        </TreeViewItem>
      </TreeViewItem>
    </TreeView>
  </div>
);

TreeExampleStatic.story = {
  args: {
    selectionMode: 'none',
    selectionStyle: 'checkbox',
    disabledBehavior: 'selection'
  },
  argTypes: {
    selectionMode: {
      control: 'radio',
      options: ['none', 'single', 'multiple']
    },
    selectionStyle: {
      control: 'radio',
      options: ['checkbox', 'highlight']
    },
    disabledBehavior: {
      control: 'radio',
      options: ['selection', 'all']
    },
    disallowEmptySelection: {
      control: {
        type: 'boolean'
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

const DynamicTreeItem = (props) => {
  let {childItems, name, icon} = props;
  return (
    <>
      <TreeViewItem id={props.id} textValue={name} href={props.href}>
        <TreeViewItemContent>
          <Text>{name}</Text>
          {icon}
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
        </TreeViewItemContent>
        <Collection items={childItems}>
          {(item: any) => (
            <DynamicTreeItem
              id={item.id}
              icon={item.icon}
              childItems={item.childItems}
              textValue={item.name}
              name={item.name}
              href={props.href}>
              {item.name}
            </DynamicTreeItem>
          )}
        </Collection>
      </TreeViewItem>
    </>
  );
};

export const TreeExampleDynamic = (args: SpectrumTreeViewProps<unknown>) => (
  <div style={{width: '300px', resize: 'both', height: '90vh', overflow: 'auto'}}>
    <TreeView disabledKeys={['reports-1AB']} aria-label="test dynamic tree" items={rows} onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')} {...args}>
      {(item: any) => (
        <DynamicTreeItem
          id={item.id}
          icon={item.icon}
          childItems={item.childItems}
          textValue={item.name}
          name={item.name} />
      )}
    </TreeView>
  </div>
);

TreeExampleDynamic.story = {
  ...TreeExampleStatic.story,
  parameters: null
};


export const WithActions = {
  render: TreeExampleDynamic,
  ...TreeExampleDynamic,
  args: {
    onAction: action('onAction'),
    ...TreeExampleDynamic.story.args
  },
  name: 'Tree with actions'
};

export const WithLinks = (args: SpectrumTreeViewProps<unknown>) => (
  <div style={{width: '300px', resize: 'both', height: '90vh', overflow: 'auto'}}>
    <TreeView {...args} disabledKeys={['reports-1AB']} aria-label="test dynamic tree" items={rows} onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
      {(item) => (
        <DynamicTreeItem
          id={item.id}
          icon={item.icon}
          childItems={item.childItems}
          textValue={item.name}
          name={item.name}
          href="https://adobe.com/" />
      )}
    </TreeView>
  </div>
);

WithLinks.story = {
  ...TreeExampleDynamic.story,
  name: 'Tree with links',
  parameters: {
    description: {
      data: 'every tree item should link to adobe.com'
    }
  }
};

export function renderEmptyState() {
  return (
    <IllustratedMessage>
      <svg width="150" height="103" viewBox="0 0 150 103">
        <path d="M133.7,8.5h-118c-1.9,0-3.5,1.6-3.5,3.5v27c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V23.5h119V92c0,0.3-0.2,0.5-0.5,0.5h-118c-0.3,0-0.5-0.2-0.5-0.5V69c0-0.8-0.7-1.5-1.5-1.5s-1.5,0.7-1.5,1.5v23c0,1.9,1.6,3.5,3.5,3.5h118c1.9,0,3.5-1.6,3.5-3.5V12C137.2,10.1,135.6,8.5,133.7,8.5z M15.2,21.5V12c0-0.3,0.2-0.5,0.5-0.5h118c0.3,0,0.5,0.2,0.5,0.5v9.5H15.2z M32.6,16.5c0,0.6-0.4,1-1,1h-10c-0.6,0-1-0.4-1-1s0.4-1,1-1h10C32.2,15.5,32.6,15.9,32.6,16.5z M13.6,56.1l-8.6,8.5C4.8,65,4.4,65.1,4,65.1c-0.4,0-0.8-0.1-1.1-0.4c-0.6-0.6-0.6-1.5,0-2.1l8.6-8.5l-8.6-8.5c-0.6-0.6-0.6-1.5,0-2.1c0.6-0.6,1.5-0.6,2.1,0l8.6,8.5l8.6-8.5c0.6-0.6,1.5-0.6,2.1,0c0.6,0.6,0.6,1.5,0,2.1L15.8,54l8.6,8.5c0.6,0.6,0.6,1.5,0,2.1c-0.3,0.3-0.7,0.4-1.1,0.4c-0.4,0-0.8-0.1-1.1-0.4L13.6,56.1z" />
      </svg>
      <Heading>No results</Heading>
      <Content>No results found, press <Link onPress={action('linkPress')}>here</Link> for more info.</Content>
    </IllustratedMessage>
  );
}

export const EmptyTree = {
  render: TreeExampleDynamic,
  ...TreeExampleDynamic,
  args: {
    ...TreeExampleDynamic.story.args,
    items: [],
    renderEmptyState
  },
  name: 'Empty Tree'
};

export const WithActionMenu = (args: SpectrumTreeViewProps<unknown>) => (
  <div style={{width: '300px', resize: 'both', height: '90vh', overflow: 'auto'}}>
    <TreeView {...args} disabledKeys={['reports-1AB']} aria-label="test dynamic tree" items={rows} onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
      {(item) => (
        <DynamicTreeItem
          id={item.id}
          icon={item.icon}
          childItems={item.childItems}
          textValue={item.name}
          name={item.name} />
      )}
    </TreeView>
  </div>
);
