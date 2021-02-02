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
import {DOMRef} from '@react-types/shared';
import {GridCollection, useGridState} from '@react-stately/grid';
import {GridKeyboardDelegate, useGrid, useGridRow} from '@react-aria/grid';
import React, {useRef} from 'react';
import {useCollator, useLocale} from '@react-aria/i18n';
import {useDOMRef} from '@react-spectrum/utils';
import {useListItem} from '@react-aria/list';
import {useListState} from '@react-stately/list';

function List(props, ref: DOMRef<HTMLDivElement>) {
  let domRef = useDOMRef(ref);
  let {collection} = useListState(props);

  let gridCollection = new GridCollection({
    columnCount: 1,
    items: [...collection].map(item => ({
      type: 'row',
      childNodes: [{
        ...item,
        index: 0,
        type: 'cell'
      }]
    }))
  });


  let state = useGridState({
    ...props,
    collection: gridCollection
  });

  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let {direction} = useLocale();
  let keyboardDelegate = new GridKeyboardDelegate({
    collection: state.collection,
    disabledKeys: state.disabledKeys,
    ref: domRef,
    direction,
    collator,
    focusMode: 'cell'
  });
  let {gridProps} = useGrid({
    keyboardDelegate,
    ref: domRef
    // focusMode: 'cell'
  }, state);

  // TODO adding grid props makes the grid keyboard delegate the main keyboard listener?
  return (
    <div
      {...gridProps}
      ref={domRef}>
      {
        [...collection].map(item => {
          // console.log('item', item)
          return <ListItem item={item} state={state} delegate={keyboardDelegate} />
        })
      }
    </div>
  );
}

function ListItem({item, state, delegate}) {
  let ref = useRef();
  // let {rowProps} = useGridRow({
  //   node: item,
  //   ref
  // }, state);
  let {rowProps} = useGridRow({
    node: item,
    ref
  }, state);
  let {listItemProps} = useListItem({
    node: item,
    selectionManager: state.selectionManager,
    keyboardDelegate: delegate,
    ref
  }, state);

  // console.log('row props', rowProps)
  // console.log('item', item)
  // let rendered = Array.isArray(item.rendered) ? item.rendered : [item.rendered];
  return (
    <div
      {...rowProps} >
      <div {...listItemProps} ref={ref}>
        {item.rendered}
      </div>
    </div>
  );
}

const _List = React.forwardRef(List); // as (pro[s &]) => ReactElement;
export {_List as List};
