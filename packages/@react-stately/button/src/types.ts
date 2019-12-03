import {ActionButtonProps} from '@react-spectrum/button';
import {Key, ReactElement} from 'react';

export interface ButtonGroupStateBase {
  children: ReactElement<ActionButtonProps> | ReactElement<ActionButtonProps>[],
  disabledKeys?: Iterable<Key>
}

export interface GroupNode {
  key: Key,
  prevKey?: Key,
  nextKey?: Key,
  isFocused?: boolean,
  isSelected?: boolean,
  isDisabled?: boolean,
  value?: any,
}
