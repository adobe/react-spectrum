'use client';
import {Check} from 'lucide-react';
import React from 'react';
import {
  ProgressList as AriaProgressList,
  ProgressListItem as AriaProgressListItem,
  ProgressListItemContent as AriaProgressListItemContent,
  type ProgressListItemProps as AriaProgressListItemProps,
  type ProgressListProps
} from 'react-aria-components/ProgressList';
import {twMerge} from 'tailwind-merge';
import {tv} from 'tailwind-variants';
import {composeTailwindRenderProps} from './utils';

export function ProgressList<T>(props: ProgressListProps<T>) {
  return (
    <AriaProgressList
      {...props}
      className={twMerge(
        'flex max-w-full m-0 p-0 list-none font-sans text-sm text-neutral-800 dark:text-neutral-200',
        props.className
      )}
    />
  );
}

export interface ProgressListItemProps extends Omit<AriaProgressListItemProps, 'children'> {
  children?: React.ReactNode;
}

const contentStyles = tv({
  base: [
    // The marker sits between two connector lines, with the label below.
    'grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center',
    // Each step draws its half of the line to each neighbor, so the lines connect the markers even when steps have different widths.
    'before:col-start-1 before:row-start-1 before:border-t before:border-neutral-400 forced-colors:before:border-[ButtonBorder] [:first-child>&]:before:hidden',
    'after:col-start-3 after:row-start-1 after:border-t after:border-neutral-400 forced-colors:after:border-[ButtonBorder] [:last-child>&]:after:hidden',
    // Highlight the line between two steps that are both completed or current.
    '[:is([data-current],[data-completed])+:is([data-current],[data-completed])>&]:before:border-blue-600 forced-colors:[:is([data-current],[data-completed])+:is([data-current],[data-completed])>&]:before:border-[Highlight]',
    '[:is([data-current],[data-completed]):has(+:is([data-current],[data-completed]))>&]:after:border-blue-600 forced-colors:[:is([data-current],[data-completed]):has(+:is([data-current],[data-completed]))>&]:after:border-[Highlight]'
  ].join(' ')
});

const markerStyles = tv({
  base: 'col-start-2 row-start-1 flex items-center justify-center size-6 box-border rounded-full border text-xs',
  variants: {
    isUpcoming: {
      true: 'border-neutral-400',
      false:
        'border-transparent bg-blue-600 text-white forced-color-adjust-none forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]'
    }
  }
});

export function ProgressListItem({children, ...props}: ProgressListItemProps) {
  return (
    <AriaProgressListItem
      {...props}
      className={composeTailwindRenderProps(props.className, 'w-24 flex-1 current:font-semibold')}>
      {({isCurrent, isCompleted, stepNumber}) => (
        <AriaProgressListItemContent className={contentStyles()}>
          <span className={markerStyles({isUpcoming: !isCurrent && !isCompleted})} aria-hidden>
            {isCompleted ? <Check className="size-3.5" /> : stepNumber}
          </span>
          <span className="col-span-full row-start-2 px-1">{children}</span>
        </AriaProgressListItemContent>
      )}
    </AriaProgressListItem>
  );
}
