'use client';
import {type DialogProps, Heading} from 'react-aria-components/Dialog';
import {
  Sheet as RACSheet,
  SheetBackdrop,
  SheetContent,
  SheetOverlay,
  type SheetOverlayProps,
  type SheetProps as AriaSheetProps
} from 'react-aria-components/Sheet';
import './Sheet.css';

export interface SheetProps
  extends
    Omit<SheetOverlayProps, 'children'>,
    Pick<AriaSheetProps, 'swipeAnimation' | 'swipeAnimationRange'> {
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
  let {snapPoints, preventDismissal} = props;
  return (
    <SheetOverlay {...props} style={undefined}>
      {/* The backdrop fades in as the sheet slides up. When snap points are used, it stays hidden
        until the sheet is dragged past the last snap point. */}
      <SheetBackdrop
        swipeAnimation="sheet-backdrop"
        swipeAnimationRange={snapPoints ? {start: snapPoints.length - 1} : undefined}
      />
      {/* overscrollPadding makes the sheet appear to continue past the edge of the screen when overscrolled.
        The scaleBack animation scales a parent sheet backward when a child sheet is opened on top of it. */}
      <RACSheet
        overscrollPadding={props.overscrollPadding ?? true}
        swipeAnimation={props.swipeAnimation}
        swipeAnimationRange={props.swipeAnimationRange}
        stackAnimation="sheet-scale-back"
        style={props.style}>
        {!preventDismissal && <div className="sheet-handle" />}
        <SheetContent>{children}</SheetContent>
      </RACSheet>
    </SheetOverlay>
  );
}

export {Heading};
