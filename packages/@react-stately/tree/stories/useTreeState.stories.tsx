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

import {Collection, Key, Node} from '@react-types/shared';
import {Item} from '@react-stately/collections';
import React, {useMemo, useRef} from 'react';
import {TreeCollection} from '../src/TreeCollection';
import {usePress} from '@react-aria/interactions';
import {useSelectableCollection, useSelectableItem} from '@react-aria/selection';
import {useTreeState} from '../';

export default {
  title: 'useTreeState'
};

export const KeyboardNavigation = () => <TreeExample />;


function TreeExample(props = {}) {
  return (
    <Tree {...props}>
      <Item key="1" title="Animals">
        <Item>Aardvark</Item>
        <Item title="Bear">
          <Item>Black Bear</Item>
          <Item>Brown Bear</Item>
        </Item>
        <Item>Kangaroo</Item>
        <Item>Snake</Item>
      </Item>
      <Item key="2" title="Fruits">
        <Item>Apple</Item>
        <Item>Orange</Item>
        <Item title="Kiwi">
          <Item>Golden Kiwi</Item>
          <Item>Fuzzy Kiwi</Item>
        </Item>
      </Item>
    </Tree>
  );
}

function Tree(props) {
  let state = useTreeState(props);
  let ref = useRef(null);

  let keyboardDelegate = useMemo(() => new TreeKeyboardDelegate(state.collection, state.disabledKeys), [state.collection, state.disabledKeys]);

  let {collectionProps} = useSelectableCollection({
    keyboardDelegate,
    ref,
    selectionManager: state.selectionManager
  });

  return (
    <div
      {...collectionProps}
      ref={ref}
      role="tree">
      {TreeNodes({nodes: state.collection, state})}
    </div>
  );
}

function TreeNodes({nodes, state}: {nodes: Collection<Node<object>>, state: any}) {
  return Array.from(nodes).map(node => (
    <TreeItem
      node={node}
      key={node.key}
      state={state} />
  ));
}

function TreeItem({node, state}) {
  let ref = useRef(null);

  let {itemProps} = useSelectableItem({
    key: node.key,
    selectionManager: state.selectionManager,
    ref: ref
  });

  let {pressProps} = usePress({
    ...itemProps,
    onPress: () => state.toggleKey(node.key)
  });

  let isExpanded = node.hasChildNodes && state.expandedKeys.has(node.key);
  let isSelected = state.selectionManager.isSelected(node.key);

  return (
    <div
      {...pressProps}
      aria-expanded={node.hasChildNodes ? isExpanded : null}
      aria-selected={isSelected}
      ref={ref}
      role="treeitem">
      <div className="title">
        {node.rendered}
      </div>
      {isExpanded &&
        <div className="children" role="group">
          {TreeNodes({nodes: node.childNodes, state})}
        </div>
      }
    </div>
  );
}

class TreeKeyboardDelegate<T> {
  collator: Intl.Collator;
  collection: TreeCollection<T>;
  disabledKeys: Set<Key>;

  constructor(collection, disabledKeys) {
    this.collator = new Intl.Collator('en');
    this.collection = collection;
    this.disabledKeys = disabledKeys;
  }

  getKeyAbove(key) {
    let {collection, disabledKeys} = this;
    let keyBefore = collection.getKeyBefore(key);

    while (keyBefore !== null) {
      let item = collection.getItem(keyBefore);

      if (item?.type === 'item' && !disabledKeys.has(item.key)) {
        return keyBefore;
      }

      keyBefore = collection.getKeyBefore(keyBefore);
    }

    return null;
  }

  getKeyBelow(key) {
    let {collection, disabledKeys} = this;
    let keyBelow = collection.getKeyAfter(key);

    while (keyBelow !== null) {
      let item = collection.getItem(keyBelow);

      if (item?.type === 'item' && !disabledKeys.has(item.key)) {
        return keyBelow;
      }

      keyBelow = collection.getKeyAfter(keyBelow);
    }

    return null;
  }

  getFirstKey() {
    let {collection, disabledKeys} = this;
    let key = collection.getFirstKey();

    while (key !== null) {
      let item = collection.getItem(key);

      if (item?.type === 'item' && !disabledKeys.has(item.key)) {
        return key;
      }

      key = collection.getKeyAfter(key);
    }

    return null;
  }

  getLastKey() {
    let {collection, disabledKeys} = this;
    let key = collection.getLastKey();

    while (key !== null) {
      let item = collection.getItem(key);

      if (item?.type === 'item' && !disabledKeys.has(item.key)) {
        return key;
      }

      key = collection.getKeyBefore(key);
    }

    return null;
  }

  getKeyForSearch(search, fromKey = this.getFirstKey()) {
    let {collator, collection} = this;
    let key = fromKey;

    while (key !== null) {
      let item = collection.getItem(key);

      if (item?.textValue && collator.compare(search, item.textValue.slice(0, search.length)) === 0) {
        return key;
      }

      key = this.getKeyBelow(key);
    }

    return null;
  }
}
