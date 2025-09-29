import {AriaCheckboxProps} from '@react-types/checkbox';
import {GridCollection} from '@react-types/grid';
import {GridState} from '@react-stately/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {Key} from '@react-types/shared';
import {useEffect, useRef} from 'react';
import {useId} from '@react-aria/utils';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export interface AriaGridSelectionCheckboxProps {
  /** A unique key for the checkbox. */
  key: Key
}

export interface GridSelectionCheckboxAria {
  /** Props for the row selection checkbox element. */
  checkboxProps: AriaCheckboxProps
}


/**
 * Provides the behavior and accessibility implementation for a selection checkbox in a grid.
 * @param props - Props for the selection checkbox.
 * @param state - State of the grid, as returned by `useGridState`.
 */
export function useGridSelectionCheckbox<T, C extends GridCollection<T>>(props: AriaGridSelectionCheckboxProps, state: GridState<T, C>): GridSelectionCheckboxAria {
  let {key} = props;

  let manager = state.selectionManager;
  let checkboxId = useId();
  let isDisabled = !state.selectionManager.canSelectItem(key);
  let isSelected = state.selectionManager.isSelected(key);

  let isShiftDown = useRef(false);
  useEffect(() => {
    let trackKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        isShiftDown.current = true;
      }
    };
    let trackKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        isShiftDown.current = false;
      }
    };

    document.addEventListener('keydown', trackKeyDown, true);
    document.addEventListener('keyup', trackKeyUp, true);

    return () => {
      document.removeEventListener('keydown', trackKeyDown, true);
      document.removeEventListener('keyup', trackKeyUp, true);
    };
  }, []);

  // Checkbox should always toggle selection, regardless of selectionBehavior.
  let onChange = () => isShiftDown.current ? manager.extendSelection(key) : manager.toggleSelection(key);

  const stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/grid');

  return {
    checkboxProps: {
      id: checkboxId,
      'aria-label': stringFormatter.format('select'),
      isSelected,
      isDisabled,
      onChange
    }
  };
}
