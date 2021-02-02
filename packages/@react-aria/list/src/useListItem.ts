import {KeyboardDelegate} from '@react-types/shared';
import {MultipleSelectionManager} from '@react-stately/selection';
import React, {FocusEvent, HTMLAttributes, RefObject} from 'react';
import {getFocusableTreeWalker} from '@react-aria/focus';
import {ListKeyboardDelegate} from './ListKeyboardDelegate';
import {useGridCell} from '@react-aria/grid';
import {GridState} from '@react-stately/grid';
import {GridCollection} from '@react-types/grid';
import {Node} from '@react-types/shared';
import {isFocusVisible} from '@react-aria/interactions';

interface ListItemOptions<> {
  node: Node<unknown>,

  selectionManager: MultipleSelectionManager,

  keyboardDelegate: KeyboardDelegate,

  ref: RefObject<HTMLElement>,

  shouldFocusWrap?: boolean,

  selectOnFocus?: boolean
}


// interface ListItemAria {
//   listItemProps: HTMLAttributes<HTMLElement>
// }

export function useListItem<T, C extends GridCollection<T>>(props: ListItemOptions, state: GridState<T, C>) {
  let {
    node,
    ref
  } = props;
  // console.log('kb', props.keyboardDelegate)
  // console.log('kb d', delegate)
  let {gridCellProps} = useGridCell({
    node,
    ref,
    focusMode: 'cell'
  }, state);

  let walker;
  if (ref.current) {
    walker = getFocusableTreeWalker(ref.current);
  }
  let onKeyDown = (e: KeyboardEvent): void => {
    let focusable;
    console.log('here we go', ref.current);
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        e.stopPropagation();
        focusable = walker.previousNode();
        if (focusable) { // todo remove check once rows are not focusable
          focusable.focus();
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        e.stopPropagation();
        focusable = walker.nextNode();
        if (focusable && focusable !== ref.current) {
          focusable.focus();
        }
        break;
    }
  };

  let handlers = {
    onKeyDown
  };

  return {
    listItemProps: {
      ...gridCellProps,
      ...handlers
    }
  };
}

// export function useListItem(options: ListItemOptions) {
//   let {
//     keyboardDelegate: delegate,
//     selectionManager: manager,
//     ref,
//     listRef,
//     shouldFocusWrap = false,
//     selectOnFocus = false
//   } = options;
//
//   let listWalker, walker;
//   if (listRef.current) {
//     console.log('listref', listRef.current)
//     listWalker = getFocusableTreeWalker(listRef.current);
//   }
//   if (ref.current) {
//     walker = getFocusableTreeWalker(ref.current);
//   }
//
//   let onKeyDown = (e: KeyboardEvent) => {
//     console.log(`key: ${e.key} // focus: ${manager.focusedKey}`)
//     switch (e.key) {
//       case 'ArrowUp':
//         console.log('arrow up')
//         if (delegate.getKeyAbove) {
//           console.log('yes get key above')
//           e.preventDefault();
//           console.log('focused', manager.focusedKey)
//           let nextKey = manager.focusedKey != null
//             ? delegate.getKeyAbove(manager.focusedKey)
//             : delegate.getLastKey();
//           console.log('nextkey', nextKey)
//
//           if (nextKey != null) {
//             manager.setFocusedKey(nextKey);
//             if (manager.selectionMode === 'single' && selectOnFocus) {
//               manager.replaceSelection(nextKey);
//             }
//           } else if (shouldFocusWrap) {
//             let wrapKey = delegate.getLastKey(manager.focusedKey);
//             manager.setFocusedKey(wrapKey);
//             if (manager.selectionMode === 'single' && selectOnFocus) {
//               manager.replaceSelection(wrapKey);
//             }
//           }
//
//           if (e.shiftKey && manager.selectionMode === 'multiple') {
//             manager.extendSelection(nextKey);
//           }
//
//           let rowFocusable = listWalker.previousNode();
//           console.log('rowFocus', rowFocusable)
//           let focusable = walker.firstChild();
//           if (delegate.getFocusIndex()) {
//             console.log('focus index', delegate.getFocusIndex())
//             for (let i = 0; i < delegate.getFocusIndex(); i++) {
//               focusable = walker.nextNode();
//             }
//
//             console.log('focusable', focusable);
//             if (focusable) {
//               console.log('focus', manager.focusedKey, focusable);
//               focusable.focus();
//             }
//           } else {
//             // focus row
//             if (rowFocusable) {
//               rowFocusable.focus();
//             }
//           }
//         }
//         break;
//       case 'ArrowDown':
//         console.log('arrowdown')
//         if (delegate.getKeyBelow) {
//           console.log('yes get keybelow')
//           e.preventDefault();
//           let nextKey = manager.focusedKey != null
//             ? delegate.getKeyBelow(manager.focusedKey)
//             : delegate.getFirstKey();
//
//           if (nextKey != null) {
//             manager.setFocusedKey(nextKey);
//             if (manager.selectionMode === 'single' && selectOnFocus) {
//               manager.replaceSelection(nextKey);
//             }
//           } else if (shouldFocusWrap) {
//             let wrapKey = delegate.getFirstKey(manager.focusedKey);
//             manager.setFocusedKey(wrapKey);
//             if (manager.selectionMode === 'single' && selectOnFocus) {
//               manager.replaceSelection(wrapKey);
//             }
//           }
//
//           if (e.shiftKey && manager.selectionMode === 'multiple') {
//             manager.extendSelection(nextKey);
//           }
//
//           let rowFocusable = listWalker.nextNode();
//           console.log('rowFocus', rowFocusable)
//           let focusable = walker.firstChild();
//           if (delegate.getFocusIndex()) {
//             console.log('focus index', delegate.getFocusIndex())
//             for (let i = 0; i < delegate.getFocusIndex(); i++) {
//               focusable = walker.nextNode();
//             }
//
//             console.log('focusable', focusable);
//             if (focusable) {
//               console.log('focus', manager.focusedKey, focusable);
//               focusable.focus();
//             }
//           } else {
//             // focus row
//             if (rowFocusable) {
//               rowFocusable.focus();
//             }
//           }
//         }
//         break;
//       case 'ArrowLeft':
//         console.log('arrow left');
//         e.preventDefault();
//         let prev = walker.previousNode();
//         console.log('prev', prev);
//         if (prev) {
//           delegate.setFocusIndex(delegate.getFocusIndex() - 1);
//           prev.focus();
//         }
//         // get tree walker left (or wrap)
//         break;
//       case 'ArrowRight':
//         console.log('arrow right');
//         e.preventDefault();
//         let next = walker.nextNode();
//         if (next) {
//           delegate.setFocusIndex(delegate.getFocusIndex() + 1);
//           next.focus();
//         }
//         break;
//       // case 'Tab':
//       //   if (e.shiftKey) {
//       //     ref.current.focus();
//       //   } else {
//       //     let walker = getFocusableTreeWalker(ref.current, {tabbable: true});
//       //     let next: HTMLElement;
//       //     let last: HTMLElement;
//       //     do {
//       //       last = walker.lastChild() as HTMLElement;
//       //       console.log('get last', last)
//       //       if (last) {
//       //         next = last;
//       //       }
//       //     } while (last);
//       //
//       //     if (next && !next.contains(document.activeElement)) {
//       //       next.focus();
//       //     }
//       //   }
//       //   break;
//     }
//   };
//   let onFocus = (e: FocusEvent) => {
//     console.log('onfocus')
//     console.log('focus key', manager.focusedKey)
//     if (manager.isFocused) {
//       // If a focus event bubbled through a portal, reset focus state.
//       if (!e.currentTarget.contains(e.target)) {
//         manager.setFocused(false);
//       }
//
//       return;
//     }
//
//     // Focus events can bubble through portals. Ignore these events.
//     if (!e.currentTarget.contains(e.target)) {
//       return;
//     }
//
//     manager.setFocused(true);
//
//     if (manager.focusedKey == null) {
//       // If the user hasn't yet interacted with the collection, there will be no focusedKey set.
//       // Attempt to detect whether the user is tabbing forward or backward into the collection
//       // and either focus the first or last item accordingly.
//       let relatedTarget = e.relatedTarget as Element;
//       if (relatedTarget && (e.currentTarget.compareDocumentPosition(relatedTarget) & Node.DOCUMENT_POSITION_FOLLOWING)) {
//         console.log('a')
//         manager.setFocusedKey(manager.lastSelectedKey ?? delegate.getLastKey());
//       } else {
//         console.log('b', delegate.getFirstKey())
//         manager.setFocusedKey(manager.firstSelectedKey ?? delegate.getFirstKey());
//       }
//     }
//   };
//
//   let onBlur = (e) => {
//     // Don't set blurred and then focused again if moving focus within the collection.
//     if (!e.currentTarget.contains(e.relatedTarget as HTMLElement)) {
//       manager.setFocused(false);
//     }
//   };
//
//   let handlers = {
//     onKeyDownCapture: onKeyDown,
//     onFocus,
//     onBlur
//   };
//
//
//   // let tabIndex = manager.focusedKey == null ? 0 : -1;
//
//   return {
//     listItemProps: {
//       ...handlers,
//       role: 'row'
//     }
//   };
// }
