import React, {useContext, useRef} from 'react';
import {useGridRow} from '@react-aria/grid';
import {useListItem} from '@react-aria/list';
import {FocusRing} from '@react-aria/focus';
import {ListBoxContext} from '@react-spectrum/listbox/src/ListBoxContext';
import {ListContext} from './List';

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
  let {rowProps} = useGridRow({
    node: item,
    isVirtualized: true,
    ref
  }, state);
  console.log('list item', item)
  let {listItemProps} = useListItem({
    node: item,
    selectionManager: state.selectionManager,
    keyboardDelegate,
    ref
  }, state);
  console.log('row key', item.key)
  console.log('is sel', state.selectionManager.isSelected(item.key))

  console.log('list item props', listItemProps)
  console.log('rendered', item.childNodes)
  return (
    <FocusRing>
      <div {...rowProps}>
        <div ref={ref} {...listItemProps}>
          {item.rendered}
        </div>
      </div>
    </FocusRing>
  );
}

// export function ListItem({item, state, delegate}) {
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
