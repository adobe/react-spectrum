import {ButtonGroupButton} from '@react-types/button';
import {ButtonGroupCollection} from './';
import {ReactElement} from 'react';
import {SelectionManager} from '@react-stately/selection';

export interface ButtonGroupStateBase {
  children: ButtonGroupButton| ButtonGroupButton[]
}

export interface ButtonGroupState {
  buttonCollection: ButtonGroupCollection<ReactElement>,
  selectionManager: SelectionManager
}
