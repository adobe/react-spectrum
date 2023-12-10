import {
  Button,
  GridList as AriaGridList,
  GridListItem as AriaGridListItem,
  GridListItemProps,
  GridListProps
} from 'react-aria-components';
import {Checkbox} from './Checkbox';
import React from 'react';

export function GridList<T extends object>(
  { children, ...props }: GridListProps<T>
) {
  return (
    <AriaGridList {...props} className={`overflow-auto relative border dark:border-zinc-600 rounded-lg ${props.className}`}>
      {children}
    </AriaGridList>
  );
}

export function GridListItem({ children, ...props }: GridListItemProps) {
  let textValue = typeof children === 'string' ? children : undefined;
  return (
    <AriaGridListItem textValue={textValue} {...props} className="relative flex gap-3 cursor-default select-none py-2 px-3 text-gray-900 disabled:text-gray-300 dark:text-zinc-200 dark:disabled:text-zinc-600 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700/60 selected:bg-blue-100 selected:hover:bg-blue-200 dark:selected:bg-blue-700/30 dark:selected:hover:bg-blue-700/40 selected:z-10 border-y dark:border-y-zinc-700 border-transparent -mb-px last:mb-0 selected:border-blue-200 dark:selected:border-blue-900 first:border-t-0 last:border-b-0 outline-none focus-visible:outline-blue-600 -outline-offset-2">
      {({ selectionMode, selectionBehavior, allowsDragging }) => (
        <>
          {/* Add elements for drag and drop and selection. */}
          {allowsDragging && <Button slot="drag">≡</Button>}
          {selectionMode === 'multiple' && selectionBehavior === 'toggle' && (
            <Checkbox slot="selection" />
          )}
          {children}
        </>
      )}
    </AriaGridListItem>
  );
}
