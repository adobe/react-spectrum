import {DOMRef} from '@react-types/shared';
import {GridCollection, useGridState} from '@react-stately/grid';
import React from 'react';
import {useDOMRef} from '@react-spectrum/utils';
import {useGrid} from '@react-aria/grid';
import {useListState} from '@react-stately/list';

function Grid(props, ref: DOMRef<HTMLDataElement>) {
  const {collection} = useListState(props);
  const items = [...collection].map(item => ({
    type: 'row',
    childNodes: [{
      ...item,
      type: 'cell'
    }]
  }));
  let domRef = useDOMRef(ref);
  console.log('items', items);
  const gridCollection = new GridCollection({
    columnCount: 1,
    items
  });
  const state = useGridState({...props});

  let {gridProps} = useGrid({
    ...props,
    ref: domRef,
    isVirtualized: false
  }, state);

  // console.log('list col', collection);
  console.log('grid col', gridCollection)
  console.log('grid state', state);
  console.log('gridprops', gridProps)

  return (
    <div>Grid</div>
  );
}

const _Grid = React.forwardRef(Grid);
export {_Grid as Grid};
