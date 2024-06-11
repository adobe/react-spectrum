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

import {Button, GridList, GridListItem, GridListItemProps} from 'react-aria-components';
import {classNames} from '@react-spectrum/utils';
import React from 'react';
import styles from '../example/index.css';

export default {
  title: 'React Aria Components'
};

export const GridListExample = (args) => (
  <GridList
    {...args}
    className={styles.menu} 
    aria-label="test gridlist"
    style={{
      width: 300,
      height: 300,
      display: 'grid',
      gridTemplate: args.layout === 'grid' ? 'repeat(3, 1fr) / repeat(3, 1fr)' : 'auto / 1fr',
      gridAutoFlow: 'row'
    }}>
    <MyGridListItem>1,1 <Button>Actions</Button></MyGridListItem>
    <MyGridListItem>1,2 <Button>Actions</Button></MyGridListItem>
    <MyGridListItem>1,3 <Button>Actions</Button></MyGridListItem>
    <MyGridListItem>2,1 <Button>Actions</Button></MyGridListItem>
    <MyGridListItem>2,2 <Button>Actions</Button></MyGridListItem>
    <MyGridListItem>2,3 <Button>Actions</Button></MyGridListItem>
    <MyGridListItem>3,1 <Button>Actions</Button></MyGridListItem>
    <MyGridListItem>3,2 <Button>Actions</Button></MyGridListItem>
    <MyGridListItem>3,3 <Button>Actions</Button></MyGridListItem>
  </GridList>
);

const MyGridListItem = (props: GridListItemProps) => {
  return (
    <GridListItem
      {...props}
      style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}
      className={({isFocused, isSelected, isHovered}) => classNames(styles, 'item', {
        focused: isFocused,
        selected: isSelected,
        hovered: isHovered
      })} />
  );
};

GridListExample.story = {
  args: {
    layout: 'stack'
  },
  argTypes: {
    layout: {
      control: 'radio',
      options: ['stack', 'grid']
    },
    keyboardNavigationBehavior: {
      control: 'radio',
      options: ['arrow', 'tab']
    }
  }
};
