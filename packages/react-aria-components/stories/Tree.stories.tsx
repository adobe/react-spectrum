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

import {Button, Collection, Content, Text, Tree, TreeItem} from 'react-aria-components';
import {classNames} from '@react-spectrum/utils';
import React from 'react';
import styles from '../example/index.css';

export default {
  title: 'React Aria Components'
};


// TODO: for static, make a generic wrapper like <heading> that wraps the non-collection item contents
// so they are omitted from the collection processing
{/* <TreeItem>
  <Content>
    <title>
      gawemgk
    </title>
    <button>

    </button>
  </Content>
  // this is dynamic
  <Collection>
    <TreeItem></TreeItem>
  </Collection>

  OR
  // This is static
  <TreeItem>
  </TreeItem>
</TreeItem> */}




// let projectSubItems = [
//   {id: 'project-1', name: 'Project 1'},
//   {id: 'project-2', name: 'Project 2', childItems: [
//     {id: 'project-2A', name: 'Project 2A'},
//     {id: 'project-2B', name: 'Project 2B'},
//     {id: 'project-2C', name: 'Project 2C'}
//   ]},
//   {id: 'project-3', name: 'Project 3'},
//   {id: 'project-4', name: 'Project 4'}
// ];

const StaticTreeItem = (props) => {
  // TODO: update the styles
  return (
    <TreeItem
      {...props}
      className={({isFocused, isSelected, isHovered}) => classNames(styles, 'item', {
        focused: isFocused,
        selected: isSelected,
        hovered: isHovered
      })}>
      {/* {({isExpanded}) => (
        <Content>
          {isExpanded && <div>Im expanded</div>}
          <Text slot="title">{props.title || props.children}</Text>
          <Button aria-label="Info">ⓘ</Button>
          <Button aria-label="Menu">☰</Button>
        </Content>
      )} */}

      {/* TODO this adds the content element to the collection properly if it isn't in the renderProps function... */}
      <Content>
        {/* TODO: should render a chevron that we can modify with a isExpanded render prop */}
        {/* {isExpanded && <div>Im expanded</div>} */}
        {/* TODO: support this title slot */}
        <Text slot="title">{props.title || props.children}</Text>
        {/* TODO: Test left/right keyboard movement */}
        <Button aria-label="Info">ⓘ</Button>
        {/* TODO: make this menu expandable later and test it */}
        <Button aria-label="Menu">☰</Button>
      </Content>
      {/* Renders the nested row */}
      {props.title ? props.children : null}
    </TreeItem>
  );
};





{/* <>
{({isExpanded}) => (
  <>
    <Content>
      {isExpanded && <div>Im expanded</div>}
      <Text slot="title">{props.title}</Text>
      <Button aria-label="Info">ⓘ</Button>
      <Button aria-label="Menu">☰</Button>
    </Content>
    {props.children}
  </>
)}
</>  */}

export const TreeExampleStatic = (args) => (
  // TODO: update the styles here
  <Tree expandedKeys="all" className={styles.menu} {...args} aria-label="test static tree">
    {/* <StaticTreeItem id="1" textValue="Projects" title="Projects">Blah</StaticTreeItem> */}
    <StaticTreeItem id="projects" textValue="Projects" title="Projects">
      <StaticTreeItem id="projects-1" textValue="Projects-1" title="Projects-1">
        <StaticTreeItem id="projects-1A" textValue="Projects-1A">
          Projects-1A
        </StaticTreeItem>
      </StaticTreeItem>
    </StaticTreeItem>
    <TreeItem id="reports">
      Reports
    </TreeItem>
  </Tree>
);




const MyTreeItem = (props) => {
  // TODO: update the styles
  return (
    <TreeItem
      {...props}
      className={({isFocused, isSelected, isHovered}) => classNames(styles, 'item', {
        focused: isFocused,
        selected: isSelected,
        hovered: isHovered
      })}>
      {({isExpanded}) => (
        <>
          <Content>
            {/* TODO: should render a chevron that we can modify with a isExpanded render prop */}
            {isExpanded && <div>Im expanded</div>}
            {props.children}
            {/* TODO: Test left/right keyboard movement */}
            <Button aria-label="Info">ⓘ</Button>
            {/* TODO: make this menu expandable later and test it */}
            <Button aria-label="Menu">☰</Button>
          </Content>
          {/* TODO should this have Collection here? */}
        </>
      )}
      <Collection items={props.childItems}>
        {item => (
          <MyTreeItem childItems={item.childItems} textValue={item.name}>
            {item.name}
          </MyTreeItem>
        )}
      </Collection>
    </TreeItem>
  );
};

// const MyTreeItem = (props) => {
//   // TODO: update the styles
//   return (
//     <TreeItem
//       {...props}
//       className={({isFocused, isSelected, isHovered}) => classNames(styles, 'item', {
//         focused: isFocused,
//         selected: isSelected,
//         hovered: isHovered
//       })}>
//       <Content>
//         {/* TODO: should render a chevron that we can modify with a isExpanded render prop */}
//         {/* {isExpanded && <div>Im expanded</div>} */}
//         {/* {props.children} */}
//         <Text slot="title">{props.title || props.children}</Text>
//         {/* TODO: Test left/right keyboard movement */}
//         <Button aria-label="Info">ⓘ</Button>
//         {/* TODO: make this menu expandable later and test it */}
//         <Button aria-label="Menu">☰</Button>
//       </Content>
//       <Collection items={props.childItems}>
//         {item => (
//           <MyTreeItem childItems={item.childItems} textValue={item.name}>
//             {item.name}
//           </MyTreeItem>
//         )}
//       </Collection>
//     </TreeItem>
//   );
// };


let rows = [
  // {id: 'projects', name: 'Projects', childItems: [
  //   {id: 'project-2', name: 'Project 2'}
  // ]},
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
// TODO: finish story
export const TreeExampleDynamic = (args) => (
  // TODO: update the styles here
  <Tree expandedKeys={['projects', 'project-5', 'reports']} className={styles.menu} {...args} aria-label="test dynamic tree" items={rows}>
    {item => (
      //  TODO: figure out the TS here and how to get it to infer the item type
      <MyTreeItem childItems={item.childItems} textValue={item.name}>
        {item.name}
      </MyTreeItem>
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
