/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {CollectionBase, Node} from '@react-types/shared';
import {Item} from '@react-spectrum/actiongroup';
import {List} from './List';
import {ListState, useListState} from '@react-stately/list';
import * as React from 'react';
import {Section} from '@react-spectrum/menu';
import styles from './styles.css';
import {useSelectableItem, useSelectableList} from '../src';

function SelectableList(props: CollectionBase<any> & {
  isSubUlRelativelyPositioned: boolean,
  isUlRelativelyPositioned: boolean
}) {
  const state = useListState(props);
  const listRef = React.useRef<HTMLUListElement>(null);
  const {listProps} = useSelectableList({
    ref: listRef,
    selectionManager: state.selectionManager,
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    isVirtualized: false,
    autoFocus: true
  });

  const renderLeaf = (node: Node<any>) => <SelectableItem node={node} state={state} />;

  return (
    <ul
      {...listProps}
      className={styles.list}
      style={{
        height: 200, overflow: 'auto', padding: 10, margin: 0, listStyle: 'none',
        position: props.isUlRelativelyPositioned ? 'relative' : 'static',
        borderTopWidth: '10px', borderBottomWidth: '20px'
      }}
      ref={listRef}>
      {Array.from(state.collection).map(node => {
        if (node.hasChildNodes) {
          return (
            <>
              <div
                style={{textTransform: 'uppercase'}}>{node.rendered}</div>
              <ul
                key={node.key}
                style={{
                  position: props.isSubUlRelativelyPositioned ? 'relative' : 'static',
                  padding: 0,
                  margin: 0,
                  listStyle: 'none'
                }}>
                {Array.from(node.childNodes).map(renderLeaf)}
              </ul>
            </>
          );
        } else {
          return renderLeaf(node);
        }
      })}
    </ul>
  );
}

function SelectableItem(props: {
  state: ListState<any>,
  node: Node<any>
}) {
  const {state, node} = props;
  const ref = React.useRef<HTMLLIElement>(null);
  const {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    key: node.key,
    isVirtualized: false,
    ref
  });

  const isFocused = node.key === state.selectionManager.focusedKey;
  return (
    <li
      {...itemProps}
      key={node.key}
      style={{
        backgroundColor: isFocused ? 'gray' : 'white',
        fontWeight: isFocused ? 'bold' : 'normal'
      }}
      ref={ref}>
      {node.rendered}
    </li>
  );
}

const options = [
  <Section title={'Brass'}>
    <Item>Trumpet</Item>
    <Item>Horn</Item>
    <Item>Trombone</Item>
    <Item>Tuba</Item>
  </Section>,
  <Section title={'String'}>
    <Item>Violin</Item>
    <Item>Viola</Item>
    <Item>Cello</Item>
    <Item>Harp</Item>
  </Section>,
  <Section title={'Wind'}>
    <Item>Flute</Item>
    <Item>Oboe</Item>
    <Item>Clarinet</Item>
  </Section>,
  <Section title={'Percussion'}>
    <Item>Piano</Item>
    <Item>Drums</Item>
  </Section>
];

export default {
  title: 'useSelectableList',
  parameters: {
    a11y: {
      config: {
        rules: [
          // Ignore landmark accessibility failure since the list is to test for selection/scrolling only
          {id: 'list', enabled: false}
        ]
      }
    }
  }
};

export const StaticUlStaticSubUl = () => (
  <SelectableList isSubUlRelativelyPositioned={false} isUlRelativelyPositioned={false}>
    {options}
  </SelectableList>
);

StaticUlStaticSubUl.story = {
  name: 'Static ul, static sub ul',
  parameters: {description: {data: 'Built to test if focusing an element scrolls into view.'}}
};

export const StaticUlRelativeSubUl = () => (
  <SelectableList isSubUlRelativelyPositioned isUlRelativelyPositioned={false}>
    {options}
  </SelectableList>
);

StaticUlRelativeSubUl.story = {
  name: 'Static ul, relative sub ul'
};

export const RelativeUlStaticSubUl = () => (
  <SelectableList isSubUlRelativelyPositioned={false} isUlRelativelyPositioned>
    {options}
  </SelectableList>
);

RelativeUlStaticSubUl.story = {
  name: 'Relative ul, static sub ul'
};

export const RelativeUlRelativeSubUl = () => (
  <SelectableList isSubUlRelativelyPositioned isUlRelativelyPositioned>
    {options}
  </SelectableList>
);

RelativeUlRelativeSubUl.story = {
  name: 'Relative ul, relative sub ul'
};

export const SingleSelectAllowEmptySelectOnFocus = () => (
  <List selectionMode="single">
    <Item>Paco de Lucia</Item>
    <Item>Vicente Amigo</Item>
    <Item>Gerardo Nunez</Item>
  </List>
);

SingleSelectAllowEmptySelectOnFocus.story = {
  name: 'single select, allow empty, select on focus'
};

export const SingleSelectDisallowEmptySelectionSelectOnFocus = () => (
  <List selectionMode="single" disallowEmptySelection>
    <Item>Paco de Lucia</Item>
    <Item>Vicente Amigo</Item>
    <Item>Gerardo Nunez</Item>
  </List>
);

SingleSelectDisallowEmptySelectionSelectOnFocus.story = {
  name: 'single select, disallow empty selection, select on focus'
};

export const MultiSelectReplaceOnPressSelectOnFocus = () => (
  <List selectionMode="multiple" selectionBehavior="replace">
    <Item>Paco de Lucia</Item>
    <Item>Vicente Amigo</Item>
    <Item>Gerardo Nunez</Item>
  </List>
);

MultiSelectReplaceOnPressSelectOnFocus.story = {
  name: 'multi select, replace on press, select on focus'
};

export const MultiSelectAllowEmptySelectOnFocus = () => (
  <List selectionMode="multiple">
    <Item>Paco de Lucia</Item>
    <Item>Vicente Amigo</Item>
    <Item>Gerardo Nunez</Item>
  </List>
);

MultiSelectAllowEmptySelectOnFocus.story = {
  name: 'multi select, allow empty, select on focus'
};

export const MultiSelectDisallowEmptySelectOnFocus = () => (
  <List selectionMode="multiple" disallowEmptySelection>
    <Item>Paco de Lucia</Item>
    <Item>Vicente Amigo</Item>
    <Item>Gerardo Nunez</Item>
  </List>
);

MultiSelectDisallowEmptySelectOnFocus.story = {
  name: 'multi select, disallow empty, select on focus'
};
