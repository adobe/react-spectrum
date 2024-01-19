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

import {Button, Collection, Text, Tree, TreeItem, TreeItemContent, TreeItemProps} from 'react-aria-components';
import {classNames} from '@react-spectrum/utils';
import React, {ReactNode} from 'react';
import styles from '../example/index.css';

export default {
  title: 'React Aria Components'
};

interface StaticTreeItemProps extends TreeItemProps {
  title?: string,
  children?: ReactNode
}

const StaticTreeItem = (props: StaticTreeItemProps) => {
  // TODO: update the styles
  return (
    <TreeItem
      {...props}
      className={({isFocused, isSelected, isHovered}) => classNames(styles, 'item', {
        focused: isFocused,
        selected: isSelected,
        hovered: isHovered
      })}>
      <TreeItemContent>
        {({isExpanded}) => (
          <>
            {isExpanded && <div>Im expanded</div>}
            <Text slot="title">{props.title || props.children}</Text>
            <Button aria-label="Info">ⓘ</Button>
            <Button aria-label="Menu">☰</Button>
          </>
        )}
      </TreeItemContent>
      {props.title && props.children}
    </TreeItem>
  );
};

export const TreeExampleStatic = (args) => (
  <Tree defaultExpandedKeys="all" className={styles.menu} {...args} aria-label="test static tree">
    <StaticTreeItem id="Photos" textValue="Photos">Photos</StaticTreeItem>
    <StaticTreeItem id="projects" textValue="Projects" title="Projects">
      <StaticTreeItem id="projects-1" textValue="Projects-1" title="Projects-1">
        <StaticTreeItem id="projects-1A" textValue="Projects-1A">
          Projects-1A
        </StaticTreeItem>
      </StaticTreeItem>
      <StaticTreeItem id="projects-2" textValue="Projects-2">
        Projects-2
      </StaticTreeItem>
      <StaticTreeItem id="projects-3" textValue="Projects-3">
        Projects-3
      </StaticTreeItem>
    </StaticTreeItem>
    <TreeItem id="reports">
      <TreeItemContent>
        Reports
      </TreeItemContent>
    </TreeItem>
    <TreeItem id="tests">
      <TreeItemContent>
        {({isFocused}) => (
          <Text slot="title">{`${isFocused} tests`}</Text>
        )}
      </TreeItemContent>
    </TreeItem>
  </Tree>
);


let rows = [
  {id: 'projects', name: 'Projects', childItems: [
    {id: 'project-1', name: 'Project 1'},
    {id: 'project-2', name: 'Project 2', childItems: [
      {id: 'project-2A', name: 'Project 2A'},
      {id: 'project-2B', name: 'Project 2B'},
      {id: 'project-2C', name: 'Project 2C'}
    ]},
    {id: 'project-3', name: 'Project 3'},
    {id: 'project-4', name: 'Project 4'},
    {id: 'project-5', name: 'Project 5', childItems: [
      {id: 'project-5A', name: 'Project 5A'},
      {id: 'project-5B', name: 'Project 5B'},
      {id: 'project-5C', name: 'Project 5C'}
    ]}
  ]},
  {id: 'reports', name: 'Reports', childItems: [
    {id: 'reports-1', name: 'Reports 1', childItems: [
      {id: 'reports-1A', name: 'Reports 1A', childItems: [
        {id: 'reports-1AB', name: 'Reports 1AB', childItems: [
          {id: 'reports-1ABC', name: 'Reports 1ABC'}
        ]}
      ]},
      {id: 'reports-1B', name: 'Reports 1B'},
      {id: 'reports-1C', name: 'Reports 1C'}
    ]},
    {id: 'reports-2', name: 'Reports 2'}
  ]}
];

interface DynamicTreeItemProps extends TreeItemProps {
  children?: ReactNode
}

const DynamicTreeItem = (props: DynamicTreeItemProps) => {
  // TODO: update the styles
  return (
    <TreeItem
      {...props}
      className={({isFocused, isSelected, isHovered}) => classNames(styles, 'item', {
        focused: isFocused,
        selected: isSelected,
        hovered: isHovered
      })}>
      <TreeItemContent>
        {({isExpanded}) => (
          <>
            {/* TODO: should render a chevron that we can modify with a isExpanded render prop */}
            {isExpanded && <div>Im expanded</div>}
            <Text slot="title">{props.children}</Text>
            {/* TODO: Test left/right keyboard movement */}
            <Button aria-label="Info">ⓘ</Button>
            {/* TODO: make this menu expandable later and test it */}
            <Button aria-label="Menu">☰</Button>
          </>
        )}
      </TreeItemContent>
      <Collection items={props.childItems}>
        {item => (
          <DynamicTreeItem childItems={item.childItems} textValue={item.name}>
            {item.name}
          </DynamicTreeItem>
        )}
      </Collection>
    </TreeItem>
  );
};

// TODO: finish story
export const TreeExampleDynamic = (args) => (
  // TODO: update the styles here
  // expandedKeys={['projects', 'project-5', 'reports']}
  <Tree {...args} defaultExpandedKeys="all" className={styles.menu} aria-label="test dynamic tree" items={rows}>
    {item => (
      //  TODO: figure out the TS here and how to get it to infer the item type, it is because of the ...args
      <DynamicTreeItem childItems={item.childItems} textValue={item.name}>
        {item.name}
      </DynamicTreeItem>
    )}
  </Tree>
);

TreeExampleDynamic.story = {
  // TODO: add the proper parameters
  // args: {
  //   selectionMode: 'none',
  //   selectionBehavior: 'toggle',
  //   shouldFocusOnHover: false
  // },
  // argTypes: {
  //   selectionMode: {
  //     control: {
  //       type: 'radio',
  //       options: ['none', 'single', 'multiple']
  //     }
  //   },
  //   selectionBehavior: {
  //     control: {
  //       type: 'radio',
  //       options: ['toggle', 'replace']
  //     }
  //   }
  // },
  // parameters: {
  //   description: {
  //     data: 'Hover styles should have higher specificity than focus style for testing purposes. Hover style should not be applied on keyboard focus even if shouldFocusOnHover is true'
  //   }
  // }
};
