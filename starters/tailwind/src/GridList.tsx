import {
  Button,
  GridList as AriaGridList,
  GridListItem as AriaGridListItem,
  GridListItemProps,
  GridListProps
} from 'react-aria-components';
import {Checkbox} from './Checkbox';
import React from 'react';
import { focusRing } from './utils';
import { tv } from 'tailwind-variants';

export function GridList<T extends object>(
  { children, ...props }: GridListProps<T>
) {
  return (
    <AriaGridList {...props} className={`overflow-auto relative border dark:border-zinc-600 rounded-lg ${props.className}`}>
      {children}
    </AriaGridList>
  );
}

const itemStyles = tv({
  extend: focusRing,
  base: 'relative flex gap-3 cursor-default select-none py-2 px-3 text-sm border-y dark:border-y-zinc-700 border-transparent first:border-t-0 last:border-b-0 -mb-px last:mb-0 -outline-offset-2',
  variants: {
    isSelected: {
      false: 'text-gray-900 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700/60',
      true: 'bg-blue-100 dark:bg-blue-700/30 hover:bg-blue-200 dark:hover:bg-blue-700/40 border-blue-200 dark:border-blue-900'
    },
    isDisabled: {
      true: 'text-slate-300 dark:text-zinc-600 forced-colors:!text-[GrayText]'
    }
  }
});

export function GridListItem({ children, ...props }: GridListItemProps) {
  let textValue = typeof children === 'string' ? children : undefined;
  return (
    <AriaGridListItem textValue={textValue} {...props} className={itemStyles}>
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
