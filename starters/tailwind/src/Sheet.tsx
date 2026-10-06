'use client';
import React from 'react';
import {type DialogProps} from 'react-aria-components/Dialog';
import {
  Sheet as RACSheet,
  SheetBackdrop,
  SheetContent,
  SheetOverlay,
  type SheetOverlayProps
} from 'react-aria-components/Sheet';
import {tv} from 'tailwind-variants';
import {composeTailwindRenderProps} from './utils';
import './Sheet.css';

// Only the bottom-most sheet in a stack dims the page behind it.
const backdropStyles = tv({
  base: "data-[stack-index='0']:bg-black/40"
});

const sheetStyles = tv({
  // Establish a 3D space (perspective) so stacked sheets can scale backward along the z-axis.
  base: 'font-sans text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 forced-colors:bg-[Canvas] outline-hidden overflow-clip rounded-4xl shadow-2xl border border-black/10 dark:border-white/10 z-[1] will-change-transform [transform:perspective(1000px)]',
  variants: {
    position: {
      bottom: 'w-[calc(100%-1rem)] max-w-[800px] max-h-[calc(100%_-_32px)] origin-[center_-150px]',
      top: 'w-[calc(100%-1rem)] max-w-[800px] max-h-[calc(100%_-_32px)] origin-[center_150px]',
      center: 'w-[calc(100%-1rem)] max-w-[800px] max-h-[calc(100%_-_32px)] origin-[center_-150px]',
      left: 'w-[300px] h-[calc(100%-1rem)] origin-[150px_center]',
      right: 'w-[300px] h-[calc(100%-1rem)] origin-[-150px_center]'
    }
  },
  defaultVariants: {
    position: 'bottom'
  }
});

// Only scroll the inner content once the sheet is fully expanded. At a partial detent a swipe on the
// content chains out to the sheet's scroll container instead, expanding the sheet (like iOS).
const contentStyles = tv({
  base: 'p-6 pb-[calc(var(--spacing-6) + var(--sheet-scroll-padding-y))] box-border h-full outline-hidden overscroll-auto scrollbar-gutter-stable overflow-hidden group-data-[expanded]/sheet:overflow-auto'
});

export interface SheetProps extends Omit<SheetOverlayProps, 'children'> {
  /** The contents of the sheet. Rendered inside a Dialog. */
  children?: DialogProps['children'];
  /**
   * Whether to add padding to the sheet so that it appears to continue outside the viewport.
   *
   * @default true
   */
  overscrollPadding?: boolean;
}

export function Sheet({children, ...props}: SheetProps) {
  let {snapPoints} = props;
  return (
    <SheetOverlay {...props} className={composeTailwindRenderProps(props.className, 'group/sheet')}>
      {/* The backdrop fades in as the sheet slides up. When snap points are used, it stays hidden
        until the sheet is dragged past the last snap point. */}
      <SheetBackdrop
        className={backdropStyles()}
        swipeAnimation="sheet-backdrop"
        swipeAnimationRange={snapPoints ? {start: snapPoints.length - 1} : undefined}
      />
      {/* overscrollPadding makes the sheet appear to continue past the edge of the screen when overscrolled.
        The scaleBack animation scales a parent sheet backward when a child sheet is opened on top of it. */}
      <RACSheet
        overscrollPadding={props.overscrollPadding ?? true}
        stackAnimation="sheet-scale-back"
        className={({position}) => sheetStyles({position})}>
        <SheetContent className={contentStyles()}>{children}</SheetContent>
      </RACSheet>
    </SheetOverlay>
  );
}
