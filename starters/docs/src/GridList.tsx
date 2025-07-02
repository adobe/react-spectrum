'use client';
import {
  Button,
  GridList as AriaGridList,
  GridListItem as AriaGridListItem,
  GridListItemProps,
  GridListProps
} from 'react-aria-components';
import {MyCheckbox} from './Checkbox';

import './GridList.css';

export function GridList<T extends object>(
  { children, ...props }: GridListProps<T>
) {
  return (
    (
      <AriaGridList {...props}>
        {children}
      </AriaGridList>
    )
  );
}

export { GridList as MyGridList };

export function GridListItem(
  { children, ...props }: Omit<GridListItemProps, 'children'> & {
    children?: React.ReactNode;
  }
) {
  let textValue = typeof children === 'string' ? children : undefined;
  return (
    (
      <AriaGridListItem textValue={textValue} {...props}>
        {({ selectionMode, selectionBehavior, allowsDragging }) => (
          <>
            {/* Add elements for drag and drop and selection. */}
            {allowsDragging && <Button slot="drag">≡</Button>}
            {selectionMode === 'multiple' && selectionBehavior === 'toggle' && (
              <MyCheckbox slot="selection" />
            )}
            {children}
          </>
        )}
      </AriaGridListItem>
    )
  );
}

export { GridListItem as MyItem };
