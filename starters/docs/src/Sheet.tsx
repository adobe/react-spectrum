'use client';
import {type DialogProps, Heading} from 'react-aria-components/Dialog';
import {
  Sheet as RACSheet,
  SheetBackdrop,
  SheetContent,
  SheetOverlay,
  type SheetOverlayProps
} from 'react-aria-components/Sheet';
import './Sheet.css';

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
    <SheetOverlay {...props}>
      {/* The backdrop fades in as the sheet slides up. When snap points are used, it stays hidden
        until the sheet is dragged past the last detent. */}
      <SheetBackdrop
        swipeAnimation="sheet-backdrop"
        swipeAnimationRange={snapPoints ? {start: snapPoints.length - 1} : undefined}
      />
      {/* overscrollPadding makes the sheet appear to continue past the edge of the screen when
        overscrolled. The radius animation rounds the corners as it enters, and scaleBack scales a
        parent sheet backward when a child sheet is opened on top of it. */}
      <RACSheet
        overscrollPadding={props.overscrollPadding ?? true}
        swipeAnimation="sheet-radius"
        swipeAnimationRange={snapPoints ? {end: 0} : undefined}
        stackAnimation="sheet-scale-back">
        <SheetContent>{children}</SheetContent>
      </RACSheet>
    </SheetOverlay>
  );
}

export {Heading};
