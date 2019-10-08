import {SingleSelectionBase} from '@react-types/shared';
import {useControlledState} from '@react-stately/utils';

export function useSingleSelectionState(props: SingleSelectionBase) {
  let {allowsEmptySelection, onSelectionChange, selectedItem, defaultSelectedItem} = props;

  let [selectedValue, setSelectedValue] = useControlledState(selectedItem, defaultSelectedItem, onSelectionChange);

  function handleSelection(key: any) {
    // if the selected value is already selected and we allow an empty selection, then deselect
    const value = selectedValue === key && allowsEmptySelection ? null : key;

    setSelectedValue(value);
  }

  return {selectedValue, setSelectedValue: handleSelection};
}
