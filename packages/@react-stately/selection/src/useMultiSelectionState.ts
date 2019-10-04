import {MultipleSelectionBase} from '@react-types/shared';
import {useCallback} from 'react';
import {useControlledState} from '@react-stately/utils';

export function useMultiSelectionState(props: MultipleSelectionBase) {
  let {allowsEmptySelection, onSelectionChange, selectedItems, defaultSelectedItems = []} = props;

  let [selectedList, setSelectedList] = useControlledState(selectedItems, defaultSelectedItems);

  function handleSelection(key: any) {
    const index = selectedList.findIndex(i => i === key);
    if (index !== -1) {
      if (selectedList.length > 1) {
        selectedList.splice(index, 1);
      } else if (allowsEmptySelection) {
        selectedList = [];
      }
    } else {
      selectedList.push(key);
    }
    setSelectedList([...selectedList]);
    onSelectionChange && onSelectionChange(selectedList);
  }

  const isSelected = useCallback(
    (value) => selectedList.includes(value),
    [selectedList]
  );

  return {handleSelection, isSelected, setSelectedList};
}
