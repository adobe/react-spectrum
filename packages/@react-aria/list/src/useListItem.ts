import {getFocusableTreeWalker} from '@react-aria/focus';
import {GridCollection} from '@react-types/grid';
import {GridState} from '@react-stately/grid';
import {HTMLAttributes, KeyboardEvent, RefObject} from 'react';
import {KeyboardDelegate} from '@react-types/shared';
import {MultipleSelectionManager} from '@react-stately/selection';
import {Node} from '@react-types/shared';
import {useGridCell} from '@react-aria/grid';

interface ListItemOptions<> {
  node: Node<unknown>,

  selectionManager: MultipleSelectionManager,

  keyboardDelegate: KeyboardDelegate,

  ref: RefObject<HTMLElement>,

  shouldFocusWrap?: boolean,

  selectOnFocus?: boolean
}

// TODO
interface ListItemAria {
  listItemProps: HTMLAttributes<HTMLElement>
}

export function useListItem<T, C extends GridCollection<T>>(props: ListItemOptions, state: GridState<T, C>): ListItemAria {
  let {
    node,
    ref
  } = props;
  let {gridCellProps} = useGridCell({
    node,
    ref,
    focusMode: 'cell'
  }, state);

  let walker;
  if (ref.current) {
    walker = getFocusableTreeWalker(ref.current);
  }
  let onKeyDown = (e: KeyboardEvent) => {
    let focusable;
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
    onKeyDownCapture: onKeyDown
  };

  return {
    listItemProps: {
      ...gridCellProps,
      ...handlers
    }
  };
}
