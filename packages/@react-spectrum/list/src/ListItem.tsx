import React, {useContext, useRef} from 'react';
import {useGridCell, useGridRow} from '@react-aria/grid';
import {useListItem} from '@react-aria/list';
import {FocusRing} from '@react-aria/focus';
import {ListBoxContext} from '@react-spectrum/listbox/src/ListBoxContext';
import {ListContext} from './List';
import {classNames} from '@react-spectrum/utils';
import listStyles from './index.css';
import {useHover} from '@react-aria/interactions';
import {mergeProps} from '@react-aria/utils';

// function ListItem({item, state, delegate}) {
//   let ref = useRef();
//   let {rowProps} = useGridRow({
//     node: item,
//     ref
//   }, state);
//   let {listItemProps} = useListItem({
//     node: item,
//     selectionManager: state.selectionManager,
//     keyboardDelegate: delegate,
//     ref
//   }, state);
//
//   return (
//     <div
//       {...rowProps} >
//       <div {...listItemProps} ref={ref}>
//         {item.rendered}
//       </div>
//     </div>
//   );
// }


export function ListItem(props) {
  let {
    item,
    shouldSelectOnPressUp,
    shouldFocusOnHover,
    shouldUseVirtualFocus
  } = props;
  // console.log('list item', item)
  let {state, keyboardDelegate} = useContext(ListContext);
  let ref = useRef<HTMLDivElement>();
  let {hoverProps, isHovered} = useHover({});
  let {rowProps} = useGridRow({
    node: item,
    isVirtualized: true,
    ref
  }, state);
  // console.log('list item', item)
  let {gridCellProps} = useGridCell({
    node: item,
    ref,
    focusMode: 'cell'
  }, state);
  const mergedProps = mergeProps(
    gridCellProps,
    hoverProps
  );
  // console.log('row key', item.key)
  // console.log('is sel', state.selectionManager.isSelected(item.key))
  //
  // console.log('list item props', gridCellProps)
  // console.log('rendered', item.childNodes)
  console.log('lsit styles', listStyles)
  return (
    <FocusRing>
      <div {...rowProps}>
        <div
          className={
            classNames(
              listStyles,
              'react-spectrum-ListItem',
              {
                'is-focused': true,
                'is-hovered': isHovered
              }
            )
          }
          ref={ref}
          {...mergedProps}>
          {item.rendered}
        </div>
      </div>
    </FocusRing>
  );
}
