/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {GridCollection, useGridState} from '@react-stately/grid';
import {mergeProps} from '@react-aria/utils';
import React from 'react';
import {useFocus} from '@react-aria/interactions';
import {useGrid, useGridCell, useGridRow} from '../';
import {useListState} from '@react-stately/list';

export function Grid(props) {
  let {gridFocusMode = 'row', cellFocusMode = 'child'} = props;
  let state = useListState(props);
  let gridState = useGridState({
    ...props,
    selectionMode: 'multiple',
    collection: React.useMemo(() => new GridCollection({
      columnCount: 1,
      items: [...state.collection].map(item => ({
        type: 'item',
        childNodes: [{
          ...item,
          index: 0,
          type: 'cell'
        }]
      }))
    }), [state.collection])
  });

  let ref = React.useRef(null);
  let {gridProps} = useGrid({
    'aria-label': 'Grid',
    focusMode: gridFocusMode
  }, gridState, ref);

  return (
    <div {...gridProps} ref={ref}>
      {[...gridState.collection].map(item =>
        (<Row
          key={item.key}
          state={gridState}
          item={item}
          focusMode={cellFocusMode} />)
      )}
    </div>
  );
}

function Row({state, item, focusMode}) {
  let rowRef = React.useRef(null);
  let cellRef = React.useRef(null);
  let cellNode = [...item.childNodes][0];
  let {rowProps} = useGridRow({node: item}, state, rowRef);
  let {gridCellProps} = useGridCell({
    node: cellNode,
    focusMode
  }, state, cellRef);

  let [isRowFocused, setRowFocused] = React.useState(false);
  let {focusProps: rowFocusProps} = useFocus({
    onFocusChange: setRowFocused
  });

  let [isCellFocused, setCellFocused] = React.useState(false);
  let {focusProps: cellFocusProps} = useFocus({
    onFocusChange: setCellFocused
  });

  return (
    <div {...mergeProps(rowProps, rowFocusProps)} ref={rowRef} style={{outline: isRowFocused ? '2px solid red' : undefined}}>
      <div {...mergeProps(gridCellProps, cellFocusProps)} ref={cellRef} style={{outline: isCellFocused ? '2px solid green' : undefined}}>
        {cellNode.rendered}
      </div>
    </div>
  );
}
