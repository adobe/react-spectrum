import {SyntheticEvent} from 'react';

export interface Removable<T, R> {
  isRemovable?: boolean,
  onRemove?: (value: T, event?: SyntheticEvent) => R
}
