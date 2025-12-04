'use client';
import React from 'react';
import {
  GridList as AriaGridList,
  GridListItem as AriaGridListItem,
  Button,
  composeRenderProps,
  GridListItemProps,
  GridListProps
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Checkbox } from './Checkbox';
import { composeTailwindRenderProps, focusRing } from './utils';

export function GridList<T extends object>(
  { children, ...props }: GridListProps<T>
) {
  return (
    <AriaGridList {...props} className={composeTailwindRenderProps(props.className, 'overflow-auto w-[200px] relative bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg font-sans empty:flex empty:items-center empty:justify-center empty:italic empty:text-sm')}>
      {children}
    </AriaGridList>
  );
}

const itemStyles = tv({
  extend: focusRing,
  base: 'relative flex gap-3 cursor-default select-none py-2 px-3 text-sm text-neutral-900 dark:text-neutral-200 border-t dark:border-t-neutral-700 border-transparent first:border-t-0 first:rounded-t-lg last:rounded-b-lg last:mb-0 -outline-offset-2',
  variants: {
    isSelected: {
      false: 'hover:bg-neutral-100 pressed:bg-neutral-100 dark:hover:bg-neutral-700/60 dark:pressed:bg-neutral-700/60',
      true: 'bg-blue-100 dark:bg-blue-700/30 hover:bg-blue-200 pressed:bg-blue-200 dark:hover:bg-blue-700/40 dark:pressed:bg-blue-700/40 border-y-blue-200 dark:border-y-blue-900 z-20'
    },
    isDisabled: {
      true: 'text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText] z-10'
    }
  }
});

export function GridListItem({ children, ...props }: GridListItemProps) {
  let textValue = typeof children === 'string' ? children : undefined;
  return (
    <AriaGridListItem textValue={textValue} {...props} className={itemStyles}>
      {composeRenderProps(children, (children, {selectionMode, selectionBehavior, allowsDragging}) => (
        <>
          {/* Add elements for drag and drop and selection. */}
          {allowsDragging && <Button slot="drag">≡</Button>}
          {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
            <Checkbox slot="selection" />
          )}
          {children}
        </>
      ))}
    </AriaGridListItem>
  );
}
