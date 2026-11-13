'use client';
import {Check} from 'lucide-react';
import React, {createContext, useContext} from 'react';
import {
  StepList as AriaStepList,
  StepListItem as AriaStepListItem,
  StepListItemContent as AriaStepListItemContent,
  type StepListItemContentProps,
  type StepListItemProps as AriaStepListItemProps,
  type StepListProps
} from 'react-aria-components/StepList';
import {twMerge} from 'tailwind-merge';
import {tv} from 'tailwind-variants';
import {composeTailwindRenderProps} from './utils';

const RenderLinkContext = createContext<StepListItemContentProps['render']>(undefined);

export function StepList<T>({
  renderLink,
  ...props
}: StepListProps<T> & {renderLink?: StepListItemContentProps['render']}) {
  return (
    <RenderLinkContext.Provider value={renderLink}>
      <AriaStepList
        {...props}
        className={twMerge(
          'flex max-w-full m-0 p-0 list-none font-sans text-sm text-neutral-800 dark:text-neutral-200',
          props.className
        )}
      />
    </RenderLinkContext.Provider>
  );
}

export interface StepListItemProps extends Omit<AriaStepListItemProps, 'children'> {
  children?: React.ReactNode;
  href?: string;
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

export function StepListItem({children, href, ...props}: StepListItemProps) {
  let renderLink = useContext(RenderLinkContext);
  return (
    <AriaStepListItem
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        // The ::before and ::after elements draw the connector lines on either side of the marker.
        'relative box-border flex w-24 flex-1 justify-center px-1 current:font-semibold before:absolute before:start-0 before:end-[calc(50%+--spacing(5))] before:top-3 before:border-t before:border-neutral-400 first:before:hidden current:before:border-blue-600 data-completed:before:border-blue-600 after:absolute after:start-[calc(50%+--spacing(5))] after:end-0 after:top-3 after:border-t after:border-neutral-400 data-completed:after:border-blue-600 last:after:hidden'
      )}>
      {({isCurrent, isCompleted, stepNumber}) => {
        // Only completed steps are links, so users can go back but not skip ahead.
        let isLink = isCompleted && href != null;
        return (
          <AriaStepListItemContent
            href={isLink ? href : undefined}
            render={isLink ? renderLink : undefined}
            className="flex flex-col items-center gap-2 text-center rounded-xs text-current no-underline outline-0 outline-offset-2 outline-blue-600 dark:outline-blue-500 forced-colors:outline-[Highlight] data-hovered:underline data-focus-visible:outline-2 [-webkit-tap-highlight-color:transparent]">
            <span className={markerStyles({isUpcoming: !isCurrent && !isCompleted})} aria-hidden>
              {isCompleted ? <Check className="size-3.5" /> : stepNumber}
            </span>
            {children}
          </AriaStepListItemContent>
        );
      }}
    </AriaStepListItem>
  );
}
