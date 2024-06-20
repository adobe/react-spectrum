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

import {Button, Checkbox, CheckboxProps, GridList, GridListItem, GridListItemProps, ListLayout, Virtualizer} from 'react-aria-components';
import {classNames} from '@react-spectrum/utils';
import {GridLayout} from '@react-spectrum/card';
import React, {useMemo} from 'react';
import {Size} from '@react-stately/virtualizer';
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
      style={{display: 'flex', alignItems: 'center', gap: 8}}
      className={({isFocused, isSelected, isHovered}) => classNames(styles, 'item', {
        focused: isFocused,
        selected: isSelected,
        hovered: isHovered
      })}>
      {({selectionMode}) => (<>
        {selectionMode !== 'none' ? <MyCheckbox slot="selection" /> : null}
        {props.children as any}
      </>)}
    </GridListItem>
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
    },
    selectionMode: {
      control: 'radio',
      options: ['none', 'single', 'multiple']
    },
    selectionBehavior: {
      control: 'radio',
      options: ['toggle', 'replace']
    }
  }
};

const MyCheckbox = ({children, ...props}: CheckboxProps) => {
  return (
    <Checkbox {...props}>
      {({isIndeterminate}) => (
        <>
          <div className="checkbox">
            <svg viewBox="0 0 18 18" aria-hidden="true">
              {isIndeterminate
                ? <rect x={1} y={7.5} width={15} height={3} />
                : <polyline points="1 9 7 14 15 4" />}
            </svg>
          </div>
          {children}
        </>
      )}
    </Checkbox>
  );
};

export function VirtualizedGridList() {
  let items: {id: number, name: string}[] = [];
  for (let i = 0; i < 10000; i++) {
    items.push({id: i, name: `Item ${i}`});
  }

  let layout = useMemo(() => {
    return new ListLayout({
      rowHeight: 25
    });
  }, []);

  return (
    <Virtualizer layout={layout}>
      <GridList className={styles.menu} style={{height: 400}} aria-label="virtualized listbox" items={items}>
        {item => <MyGridListItem>{item.name}</MyGridListItem>}
      </GridList>
    </Virtualizer>
  );
}

export function VirtualizedGridListGrid() {
  let items: {id: number, name: string}[] = [];
  for (let i = 0; i < 10000; i++) {
    items.push({id: i, name: `Item ${i}`});
  }

  let layout = useMemo(() => {
    return new GridLayout({
      minItemSize: new Size(40, 40)
    });
  }, []);

  return (
    <Virtualizer layout={layout}>
      <GridList className={styles.menu} layout="grid" style={{height: 400, width: 400}} aria-label="virtualized listbox" items={items}>
        {item => <MyGridListItem>{item.name}</MyGridListItem>}
      </GridList>
    </Virtualizer>
  );
}
