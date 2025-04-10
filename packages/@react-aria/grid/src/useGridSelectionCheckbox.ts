import {AriaCheckboxProps} from '@react-types/checkbox';
import {GridCollection} from '@react-types/grid';
import {GridState} from '@react-stately/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {Key} from '@react-types/shared';
import {useId} from '@react-aria-nutrient/utils';
import {useLocalizedStringFormatter} from '@react-aria-nutrient/i18n';

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

  // Checkbox should always toggle selection, regardless of selectionBehavior.
  let onChange = () => manager.toggleSelection(key);

  const stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria-nutrient/grid');

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
