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

import {Button, Tree, TreeItem} from 'react-aria-components';
import {classNames} from '@react-spectrum/utils';
import React from 'react';
import styles from '../example/index.css';

export default {
  title: 'React Aria Components'
};

export const MyTreeItem = (props) => {
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
          {/* TODO: should render a chevron that we can modify with a isExpanded render prop */}
          {isExpanded && <div>Im expanded</div>}
          {props.children}
          {/* TODO: Test left/right keyboard movement */}
          <Button aria-label="Info">ⓘ</Button>
          {/* TODO: make this menu expandable later and test it */}
          <Button aria-label="Menu">☰</Button>
        </>
      )}
    </TreeItem>
  );
};

// TODO: finish story
export const TreeExample = (args) => (
  // TODO: update the styles here
  <Tree className={styles.menu} {...args} aria-label="test tree">
    {item => (
      <Item childItems={item.children}>
        <FolderIcon />
        <Text>{item.name}</Text>
      </Item>
    )}
  </Tree>
);

TreeExample.story = {
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
