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

const markerStyles = tv({
  base: 'flex items-center justify-center size-6 shrink-0 rounded-full border text-xs',
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
      className={composeTailwindRenderProps(
        props.className,
        // The ::before and ::after elements draw the connector lines on either side of the marker.
        'relative box-border flex w-24 flex-1 justify-center px-1 current:font-semibold before:absolute before:start-0 before:end-[calc(50%+--spacing(5))] before:top-3 before:border-t before:border-neutral-400 first:before:hidden current:before:border-blue-600 data-completed:before:border-blue-600 after:absolute after:start-[calc(50%+--spacing(5))] after:end-0 after:top-3 after:border-t after:border-neutral-400 data-completed:after:border-blue-600 last:after:hidden'
      )}>
      {({isCurrent, isCompleted, stepNumber}) => (
        <AriaProgressListItemContent className="flex flex-col items-center gap-2 text-center">
          <span className={markerStyles({isUpcoming: !isCurrent && !isCompleted})} aria-hidden>
            {isCompleted ? <Check className="size-3.5" /> : stepNumber}
          </span>
          {children}
        </AriaProgressListItemContent>
      )}
    </AriaProgressListItem>
  );
}
