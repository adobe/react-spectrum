import {Children, isValidElement, ReactElement} from 'react';
import {CollectionChildren} from '@react-types/shared';

export function getChildrenSafe<T>(children: CollectionChildren<T>): ReactElement[] {
  const childArray: ReactElement[] = [];
  Children.forEach(children, child => {
    if (isValidElement(child)) {
      childArray.push(child);
    }
  });
  return childArray;
}
