import {MultipleSelectionBase} from '@react-types/shared';
import {useCallback} from 'react';
import {useControlledState} from '@react-stately/utils';

export function useMultiSelectionState(props: MultipleSelectionBase) {
  let {allowsEmptySelection, onSelectionChange, selectedItems, defaultSelectedItems = []} = props;

  let [selectedList, setSelectedList] = useControlledState(selectedItems, defaultSelectedItems, onSelectionChange);

  function handleSelection(key: any) {
    const index = selectedList.findIndex(i => i === key);
    let list = [...selectedList];
    if (index !== -1) {
      if (list.length > 1) {
        list.splice(index, 1);
      } else if (allowsEmptySelection) {
        list = [];
      }
    } else {
      list.push(key);
    }
    setSelectedList([...list]);
  }

  const isSelected = useCallback(
    (value) => selectedList.includes(value),
    [selectedList]
  );

  return {handleSelection, isSelected, setSelectedList};
}
