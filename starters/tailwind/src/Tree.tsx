'use client';
import React from 'react';
import {
  Tree as AriaTree,
  TreeItem as AriaTreeItem,
  TreeItemContent as AriaTreeItemContent,
  Button,
  TreeItemProps as AriaTreeItemProps,
  TreeProps
} from 'react-aria-components';
import { ChevronRight } from "lucide-react";
import { tv } from 'tailwind-variants';
import { Checkbox } from './Checkbox';
import { composeTailwindRenderProps, focusRing } from './utils';

const itemStyles = tv({
  extend: focusRing,
  base: 'relative font-sans flex group gap-3 cursor-default select-none py-1 px-3 text-sm text-neutral-900 dark:text-neutral-200 bg-white dark:bg-neutral-900 border-t dark:border-t-neutral-700 border-transparent first:border-t-0 -outline-offset-2 first:rounded-t-lg last:rounded-b-lg',
  variants: {
    isSelected: {
      false: 'hover:bg-neutral-100 pressed:bg-neutral-100 dark:hover:bg-neutral-800 dark:pressed:bg-neutral-800',
      true: 'bg-blue-100 dark:bg-blue-700/30 hover:bg-blue-200 pressed:bg-blue-200 dark:hover:bg-blue-700/40 dark:pressed:bg-blue-700/40 border-y-blue-200 dark:border-y-blue-900 z-20'
    },
    isDisabled: {
      true: 'text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText] z-10'
    }
  }
});

export function Tree<T extends object>(
  { children, ...props }: TreeProps<T>
) {
  return (
    <AriaTree {...props} className={composeTailwindRenderProps(props.className, 'w-48 max-w-full overflow-auto relative border border-neutral-200 dark:border-neutral-700 rounded-lg')}>
      {children}
    </AriaTree>
  );
}

const expandButton = tv({
  extend: focusRing,
  base: "border-0 p-0 bg-transparent shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-start cursor-default [-webkit-tap-highlight-color:transparent]",
  variants: {
    isDisabled: {
      true: 'text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText]'
    }
  }
});

const chevron = tv({
  base: "w-4.5 h-4.5 text-neutral-500 dark:text-neutral-400 transition-transform duration-200 ease-in-out",
  variants: {
    isExpanded: {
      true: "transform rotate-90",
    },
    isDisabled: {
      true: 'text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText]'
    }
  }
});

export interface TreeItemProps extends Partial<AriaTreeItemProps> {
  title: string;
}

export function TreeItem(props: TreeItemProps) {
  return (
    <AriaTreeItem className={itemStyles}  textValue={props.title} {...props}>
      <AriaTreeItemContent {...props}>
        {({ selectionMode, selectionBehavior, hasChildItems, isExpanded, isDisabled }) => (
          <div className={`flex items-center`}>
            {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
              <Checkbox slot="selection" />
            )}
            <div className='shrink-0 w-[calc(calc(var(--tree-item-level)_-_1)_*_calc(var(--spacing)_*_3))]' />
            {hasChildItems ? (
              <Button slot="chevron" className={expandButton({ isDisabled })}>
              <ChevronRight aria-hidden className={chevron({ isExpanded, isDisabled })} />
            </Button>
            ) : <div className='shrink-0 w-8 h-8' />}
            {props.title}
          </div>
        )}
      </AriaTreeItemContent>
      {props.children}
    </AriaTreeItem>
  )
}
