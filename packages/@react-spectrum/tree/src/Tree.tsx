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
import ChevronRightMedium from '@spectrum-icons/ui/ChevronRightMedium';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {CollectionBase, Expandable, MultipleSelection} from '@react-types/shared';
import {CollectionView} from '@react-aria/collections';
import {FocusRing} from '@react-aria/focus';
import {Item, ListLayout, Node, Section, TreeCollection} from '@react-stately/collections';
import {mergeProps} from '@react-aria/utils';
import React, {Key, useMemo, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/treeview/vars.css';
import {TreeState, useTreeState} from '@react-stately/tree';
import {usePress} from '@react-aria/interactions';
import {useSelectableCollection, useSelectableItem} from '@react-aria/selection';

export {Item, Section};

export function Tree<T>(props: CollectionBase<T> & Expandable & MultipleSelection) {
  let state = useTreeState(props);
  let layout = useMemo(() => 
    new ListLayout({
      rowHeight: 44,
      indentationForItem(tree: TreeCollection<T>, key: Key) {
        let level = tree.getItem(key).level;
        return 28 * level;
      }
    })
  , []);

  let {listProps} = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate: layout
  });

  return (
    <CollectionView
      {...listProps}
      focusedKey={state.selectionManager.focusedKey}
      className={classNames(styles, 'spectrum-TreeView')}
      layout={layout}
      collection={state.tree}>
      {(type, item) => {
        if (type === 'section') {
          return <TreeHeading item={item} />;
        }

        return (
          <TreeItem item={item} state={state} />
        );
      }}
    </CollectionView>
  );
}

interface TreeItemProps<T> {
  item: Node<T>,
  state: TreeState<T>
}

function TreeItem<T>(props: TreeItemProps<T>) {
  let {item, state} = props;
  let {
    rendered,
    hasChildNodes,
    isExpanded,
    isSelected
  } = item;
  
  let itemClassName = classNames(styles, 'spectrum-TreeView-item', {
    'is-open': isExpanded
  });

  let linkClassName = classNames(styles, 'spectrum-TreeView-itemLink', {
    'is-selected': isSelected
    // 'is-drop-target': isDropTarget
  });

  let ref = useRef<HTMLDivElement>();
  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    itemKey: item.key,
    itemRef: ref
  });

  let {pressProps} = usePress(itemProps);
  
  return (
    <div className={itemClassName} role="presentation">
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
        <div 
          {...mergeProps(pressProps, filterDOMProps(itemProps))}
          ref={ref}
          className={linkClassName}>
          {hasChildNodes &&
            <ChevronRightMedium
              UNSAFE_className={classNames(styles, 'spectrum-TreeView-indicator')}
              onMouseDown={e => e.stopPropagation()}
              onClick={() => state.toggleKey(item.key)} />
          }
          {rendered}
        </div>
      </FocusRing>
    </div>
  );
}

function TreeHeading({item}) {
  return (
    <div className={classNames(styles, 'spectrum-TreeView-heading')}>{item.rendered}</div>
  );
}
