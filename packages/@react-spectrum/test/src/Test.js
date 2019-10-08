import React from 'react';
import {useMultiSelectionState} from '../../../@react-stately/selection/src/useMultiSelectionState';
import {useSingleSelectionState} from '../../../@react-stately/selection/src';

let data = [];
// eslint-disable-next-line no-empty
for (let i = 0; i < 50; data[i] = i++) {}

// TODO: REMOVE FILE
export default function (props) {
  const {single, ...rest} = props;
  const state = single ? useSingleSelectionState(rest) : useMultiSelectionState(rest);
  const isSelected = single ? i => i === state.selectedValue : state.isSelected;
  const onSelect = single ? state.setSelectedValue : state.handleSelection;
  return (
    <ul>
      {data.map(i => (
        <li
          key={i}
          style={isSelected(i) ? {border: '2px solid red'} : {}}>
          <button onClick={() => onSelect(i)}>One {i}</button>
        </li>
      ))}
    </ul>
  );
}
