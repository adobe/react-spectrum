
import {useControlledState} from '@react-stately/utils/src/useControlledState';
import {useState} from "react";

export function useTabListState(props) {
  // v3 how do we do defaults for state annd how do we document that?
  let [selectedIndex, setSelectedIndex] = useControlledState(props.selectedIndex, props.defaultSelectedIndex || 0, props.onChange);

  return {
    selectedIndex,
    setSelectedIndex
  };
}
