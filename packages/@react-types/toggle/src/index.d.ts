import {ChangeEvent} from 'react';

export interface ToggleState {
  checked: boolean,
  setChecked: (value:boolean) => void
}
