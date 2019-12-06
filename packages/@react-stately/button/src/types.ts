import {ButtonGroupButton} from '@react-types/button';
import {Key} from 'react';

export interface ButtonGroupStateBase {
  children: ButtonGroupButton| ButtonGroupButton[],
  disabledKeys?: Iterable<Key>
}

