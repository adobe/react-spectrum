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

import {ActionMenu, Content, Heading, IllustratedMessage, Link, MenuItem, Text, TreeView, TreeViewItem} from '../src';
import Delete from '../s2wf-icons/S2_Icon_Delete_20_N.svg';
import Edit from '../s2wf-icons/S2_Icon_Edit_20_N.svg';
import FileTxt from '../s2wf-icons/S2_Icon_FileText_20_N.svg';
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import FolderOpen from '../spectrum-illustrations/linear/FolderOpen';
import type {Meta} from '@storybook/react';

const meta: Meta<typeof TreeView> = {
  component: TreeView,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/TreeView'
};

export default meta;

function TreeExample(props) {
  return (
    <div style={{width: '300px', height: '320px'}}>
      <TreeView
        {...props}
        disabledKeys={['projects-1']}
        aria-label="test static tree"
        expandedKeys={['projects']}>
        <TreeViewItem id="Photos" textValue="Photos">
          <Text>Photos</Text>
          <Folder />
          <ActionMenu>
            <MenuItem id="edit">
              <Edit />
              <Text>Edit</Text>
            </MenuItem>
            <MenuItem id="delete">
              <Delete />
              <Text>Delete</Text>
            </MenuItem>
          </ActionMenu>
        </TreeViewItem>
        <TreeViewItem id="projects" textValue="Projects">
          <Text>Projects</Text>
          <Folder />
          <ActionMenu>
            <MenuItem id="edit">
              <Edit />
              <Text>Edit</Text>
            </MenuItem>
            <MenuItem id="delete">
              <Delete />
              <Text>Delete</Text>
            </MenuItem>
          </ActionMenu>
          <TreeViewItem id="projects-1" textValue="Projects-1">
            <Text>Projects-1</Text>
            <Folder />
            <ActionMenu>
              <MenuItem id="edit">
                <Edit />
                <Text>Edit</Text>
              </MenuItem>
              <MenuItem id="delete">
                <Delete />
                <Text>Delete</Text>
              </MenuItem>
            </ActionMenu>
            <TreeViewItem id="projects-1A" textValue="Projects-1A">
              <Text>Projects-1A</Text>
              <FileTxt />
              <ActionMenu>
                <MenuItem id="edit">
                  <Edit />
                  <Text>Edit</Text>
                </MenuItem>
                <MenuItem id="delete">
                  <Delete />
                  <Text>Delete</Text>
                </MenuItem>
              </ActionMenu>
            </TreeViewItem>
          </TreeViewItem>
          <TreeViewItem id="projects-2" textValue="Projects-2">
            <Text>Projects-2</Text>
            <FileTxt />
            <ActionMenu>
              <MenuItem id="edit">
                <Edit />
                <Text>Edit</Text>
              </MenuItem>
              <MenuItem id="delete">
                <Delete />
                <Text>Delete</Text>
              </MenuItem>
            </ActionMenu>
          </TreeViewItem>
          <TreeViewItem id="projects-3" textValue="Projects-3">
            <Text>Projects-3</Text>
            <FileTxt />
            <ActionMenu>
              <MenuItem id="edit">
                <Edit />
                <Text>Edit</Text>
              </MenuItem>
              <MenuItem id="delete">
                <Delete />
                <Text>Delete</Text>
              </MenuItem>
            </ActionMenu>
          </TreeViewItem>
        </TreeViewItem>
      </TreeView>
    </div>
  );
}


export const TreeStatic = {
  render: (args) => <TreeExample {...args} />
};

export const TreeSelection = {
  ...TreeStatic,
  args: {
    selectionMode: 'multiple',
    defaultSelectedKeys: ['projects-2', 'projects-3']
  }
};

export const TreeIsDetached = {
  ...TreeStatic,
  args: {
    isDetached: true,
    selectionMode: 'multiple',
    defaultSelectedKeys: ['projects-2', 'projects-3']
  }
};

export const TreeIsEmphasized = {
  ...TreeStatic,
  args: {
    isEmphasized: true,
    selectionMode: 'multiple',
    defaultSelectedKeys: ['projects-2', 'projects-3']
  }
};

export const TreeIsDetachedIsEmphasized = {
  ...TreeStatic,
  args: {
    isDetached: true,
    isEmphasized: true,
    selectionMode: 'multiple',
    defaultSelectedKeys: ['projects-2', 'projects-3']
  }
};

export const TreeIsDetachedMobile = {
  ...TreeStatic,
  args: {
    isDetached: true,
    selectionMode: 'multiple',
    defaultSelectedKeys: ['projects-2', 'projects-3']
  }
};


let rows = [
  {id: 'projects', name: 'Projects', icon: <Folder />, childItems: [
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
    {id: 'reports-2', name: 'Reports 2', icon: <FileTxt />},
    ...Array.from({length: 100}, (_, i) => ({id: `reports-repeat-${i}`, name: `Reports ${i}`, icon: <FileTxt />}))
  ]}
];

const TreeExampleDynamic = (args) => (
  <div style={{width: '300px', height: '320px', display: 'flex', flexDirection: 'column'}}>
    <TreeView aria-label="test dynamic tree" items={rows} {...args}>
      {(item: any) => (
        <TreeViewItem childItems={item.childItems} textValue={item.name}>
          <Text>{item.name}</Text>
          {item.icon}
        </TreeViewItem>
      )}
    </TreeView>
  </div>
);

export const Dynamic = {
  render: (args) => <TreeExampleDynamic {...args} />,
  args: {
    disabledKeys: ['project-2C', 'project-5'],
    defaultExpandedKeys: ['projects', 'projects-2', 'projects-5']
  }
};


function renderEmptyState() {
  return (
    <IllustratedMessage>
      <FolderOpen />
      <Heading>
        No results
      </Heading>
      <Content>
        <Content>No results found, press <Link href="https://adobe.com">here</Link> for more info.</Content>
      </Content>
    </IllustratedMessage>
  );
}

export const Empty = {
  render: TreeExampleDynamic,
  args: {
    renderEmptyState,
    items: []
  }
};
