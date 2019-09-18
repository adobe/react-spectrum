import React, {ReactElement, useEffect} from 'react';
import {useControlledState} from '@react-stately/utils';

interface SingleSelectionBaseProps extends React.HTMLAttributes<HTMLElement> {
  selectedItem?: any,
  defaultSelectedItem?: any,
  onSelectionChange?: (selectedItem: any) => void,
  typeToSelect?: boolean,
  children?: ReactElement | ReactElement[]
}

export function useTabListState(props: SingleSelectionBaseProps): {selectedItem: any, setSelectedItem: (val: any) => void} {
  // v3 how do we do defaults for state annd how do we document that?
  let selectedValue, defaultSelectedValue;
  let childrenArray = React.Children.toArray(props.children);

  if (props.selectedItem != null) {
    selectedValue = getSelectedValue(childrenArray, props.selectedItem);
  }

  if (props.defaultSelectedItem != null) {
    defaultSelectedValue = getSelectedValue(childrenArray, props.defaultSelectedItem);
  }

  let [selectedItem, setSelectedItem] = useControlledState(selectedValue, defaultSelectedValue || childrenArray[0].props.value, props.onSelectionChange);

  // In the case that a uncontrolled tablist's child is removed/added, update the selected tab
  useEffect(() => {
    let expectedValue = getSelectedValue(childrenArray, selectedItem);
    if (props.selectedItem == null && expectedValue !== selectedItem) {
      setSelectedItem(expectedValue);
    }
  }, [props.children, childrenArray, selectedItem, setSelectedItem, props.selectedItem]);

  return {
    selectedItem,
    setSelectedItem
  };
}

function getSelectedValue(childrenArray, selectedItem) {
  return childrenArray.find((child) => {
    if (child.props && child.props.value) {
      return child.props.value === selectedItem;
    }
  }) ? selectedItem : childrenArray[0].props.value;
}
