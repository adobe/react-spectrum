'use client';
import {
  Button,
  GridList as AriaGridList,
  GridListItem as AriaGridListItem,
  GridListItemProps,
  GridListProps,
  GridListLoadMoreItem as AriaGridListLoadMoreItem,
  GridListLoadMoreItemProps
} from 'react-aria-components';
import {Checkbox} from './Checkbox';
import {GripVertical} from 'lucide-react';
import {ProgressCircle} from './ProgressCircle';
import './GridList.css';

export function GridList<T extends object>(
  { children, layout = 'grid', ...props }: GridListProps<T>
) {
  return (
    (
      <AriaGridList {...props} layout={layout}>
        {children}
      </AriaGridList>
    )
  );
}

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
            {allowsDragging && <Button slot="drag"><GripVertical size={16} /></Button>}
            {selectionMode === 'multiple' && selectionBehavior === 'toggle' && (
              <Checkbox slot="selection" />
            )}
            {children}
          </>
        )}
      </AriaGridListItem>
    )
  );
}

export function GridListLoadMoreItem(props: GridListLoadMoreItemProps) {
  return (
    <AriaGridListLoadMoreItem {...props}>
      <ProgressCircle isIndeterminate aria-label="Loading more..." />
    </AriaGridListLoadMoreItem>
  );
}
