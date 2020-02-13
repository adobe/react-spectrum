/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
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
