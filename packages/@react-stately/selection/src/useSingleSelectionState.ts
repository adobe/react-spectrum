import {SingleSelectionBase} from '@react-types/shared';
import {useControlledState} from '@react-stately/utils';

export function useSingleSelectionState(props: SingleSelectionBase) {
  let {allowsEmptySelection, onSelectionChange, selectedItem, defaultSelectedItem = null} = props;

  let [selectedValue, setSelectedValue] = useControlledState(selectedItem, defaultSelectedItem);

  function handleSelection(key: any) {
    const value = selectedValue === key && allowsEmptySelection ? null : key;

    setSelectedValue(value);
    onSelectionChange && onSelectionChange(value);
  }

  return {handleSelection, selectedValue, setSelectedValue};
}
