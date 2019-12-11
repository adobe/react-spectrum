import {ChangeEvent} from 'react';

export interface ToggleState {
  isChecked: boolean,
  setChecked: (value:boolean, e:ChangeEvent<HTMLInputElement>) => void
}
