/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {ClassNameOrFunction, RenderProps, useRenderProps} from './utils';
import {Dialog, DialogProps} from './Dialog';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {GlobalDOMAttributes} from '@react-types/shared';
import {
  InternalModalContext,
  Modal,
  ModalOverlay,
  ModalOverlayProps,
  ModalRenderProps
} from './Modal';
import {isIOS, isSafari} from 'react-aria/private/utils/platform';
import {mergeRefs} from 'react-aria/mergeRefs';
import {OverlayTriggerStateContext} from './Dialog';
import React, {
  createContext,
  CSSProperties,
  ForwardedRef,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react';
import {useEffectEvent} from 'react-aria/private/utils/useEffectEvent';
import {useId} from 'react-aria/useId';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
import {useLocale} from 'react-aria/I18nProvider';
import {useObjectRef} from 'react-aria/useObjectRef';
import {useSyncExternalStore} from 'use-sync-external-store/shim/index.js';

type SheetPosition = 'bottom' | 'top' | 'left' | 'right' | 'center';
type SheetSwipeDirection = 'bottom' | 'top' | 'vertical' | 'left' | 'right' | 'horizontal';

export interface SheetRenderProps extends ModalRenderProps {
  /**
   * The placement of the sheet on the screen. `start` and `end` are resolved to `left` or `right`
   * based on the locale direction.
   *
   * @selector [data-position="bottom | top | left | right | center"]
   */
  position: SheetPosition;
  /**
   * The direction the sheet can be swiped. `start` and `end` are resolved to `left` or `right`
   * based on the locale direction.
   *
   * @selector [data-swipe-direction="bottom | top | vertical | left | right | horizontal"]
   */
  swipeDirection: SheetSwipeDirection;
  /**
   * The index of the sheet in the stack.
   *
   * @selector [data-stack-index="0 | 1 | 2 | ..."]
   */
  stackIndex: number;
  /**
   * Whether the sheet has descendants.
   *
   * @selector [data-has-descendants]
   */
  hasDescendants: boolean;
  /**
   * Whether the sheet is fully expanded to its last snap point.
   *
   * @selector [data-expanded]
   */
  isExpanded: boolean;
}

export interface SheetOverlayProps
  extends
    Omit<
      ModalOverlayProps,
      | 'className'
      | 'style'
      | 'children'
      | 'render'
      | 'onEnter'
      | 'onExit'
      | 'isEntering'
      | 'isExiting'
    >,
    RenderProps<SheetRenderProps> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-SheetOverlay'
   */
  className?: ClassNameOrFunction<SheetRenderProps>;
  /**
   * The placement of the sheet on the screen. `start` and `end` are mirrored in right-to-left
   * locales.
   *
   * @default 'bottom'
   */
  position?: 'bottom' | 'top' | 'left' | 'right' | 'start' | 'end' | 'center';
  /**
   * The direction the sheet can be swiped. `start` and `end` are mirrored in right-to-left locales.
   * Defaults to the same direction as `position`.
   */
  swipeDirection?:
    | 'bottom'
    | 'top'
    | 'vertical'
    | 'left'
    | 'right'
    | 'start'
    | 'end'
    | 'horizontal';
  /**
   * Snap points the sheet will stop at, expressed as the amount of the sheet that is visible.
   * Numbers are pixels, and percentages are relative to the size of the sheet. Sheets initially
   * open to the first snap point.
   */
  snapPoints?: Array<number | string>;
  /**
   * Whether to close the sheet when the user swipes or interacts outside it.
   *
   * @default true
   */
  isDismissable?: boolean;
}

type SheetValues = Omit<SheetRenderProps, keyof ModalRenderProps>;

interface InternalSheetContextValue extends Omit<SheetOverlayProps, 'position' | 'swipeDirection'> {
  position: SheetPosition;
  swipeDirection: SheetSwipeDirection;
  index: number;
  descendants: SheetStackEntry[];
  isEntering: boolean;
  isExiting: boolean;
  values: SheetValues;
}

const InternalSheetContext = createContext<InternalSheetContextValue | null>(null);

interface SheetStackEntry {
  id: string;
  range: string;
  direction: string;
  iterations: number;
}

let sheetStack: SheetStackEntry[] = [];
let stackListeners = new Set<() => void>();

function emitStackChange() {
  // Hoist every mounted sheet's timeline name to the root so a parent
  // can still resolve the child's timeline by name.
  // TODO: don't override existing timelines declared in CSS or inline styles.
  let names = Array.from({length: sheetStack.length})
    .map((_, i) => `--sheet-timeline-${i}`)
    .join(', ');
  document.documentElement.style.setProperty('timeline-scope', names);
  stackListeners.forEach(listener => listener());
}

function subscribeStack(listener: () => void) {
  stackListeners.add(listener);
  return () => {
    stackListeners.delete(listener);
  };
}

function registerSheet(config: SheetStackEntry) {
  sheetStack = [...sheetStack, config];
  emitStackChange();
  return () => {
    sheetStack = sheetStack.filter(e => e.id !== config.id);
    emitStackChange();
  };
}

function getSheetStack() {
  return sheetStack;
}

const supportsViewTimeline =
  typeof CSS !== 'undefined' &&
  typeof CSS.supports === 'function' &&
  CSS.supports('animation-timeline: view()');

/**
 * A SheetOverlay is a container for a SheetBackdrop and a Sheet.
 */
export const SheetOverlay = forwardRef(function SheetOverlay(
  props: SheetOverlayProps,
  domRef: ForwardedRef<HTMLDivElement>
) {
  let {children, isDismissable = true} = props;
  let {direction} = useLocale();
  let position = resolveDirection(props.position ?? 'bottom', direction);
  let swipeDirection = props.swipeDirection
    ? resolveDirection(props.swipeDirection, direction)
    : position === 'center'
      ? 'vertical'
      : position;
  let contextState = useContext(OverlayTriggerStateContext);
  let onCloseEvent = useEffectEvent(() => {
    contextState!.close();
  });

  let {axis, before, after, maxScroll, enteredScroll, viewRange, viewDirection, viewIterations} =
    getSwipeConfig(swipeDirection);

  let id = useId();
  let stackItem = useMemo(
    () => ({
      id,
      range: viewRange,
      direction: viewDirection,
      iterations: viewIterations
    }),
    [id, viewRange, viewDirection, viewIterations]
  );

  let [isExpanded, setExpanded] = useState(false);
  let isVisible = useRef(false);
  let ref = useCallback(
    (element: HTMLDivElement) => {
      if (!element) {
        return;
      }

      // Sheets that rest at scroll 0 (top/left) mount already entered. Move them to the exit position
      // before observing, since onEnter may be deferred (e.g. while waiting for the software keyboard),
      // and the observer would otherwise see the sheet as entered and then close it once onEnter
      // jumps to the exit position.
      if (enteredScroll === 0) {
        let scroller = element.querySelector<HTMLElement>('[data-sheet-scroll]');
        if (scroller) {
          let vp = axis === 'y' ? window.innerHeight : window.innerWidth;
          scrollAlongAxis(scroller, axis, (maxScroll / 100) * vp);
        }
      }

      let hasEntered = false;
      let observer = new IntersectionObserver(
        entries => {
          let entry = entries[0];

          // Expose whether the sheet is resting at its fully-entered detent (all of it revealed). Apps
          // can use `[data-expanded]` to only make the sheet's inner content scrollable once expanded,
          // so that at a partial detent a swipe on the content expands the sheet instead (like iOS).
          setExpanded(entry.intersectionRatio >= 1);
          isVisible.current = entry.intersectionRatio > 0;

          hasEntered ||= entry.intersectionRatio > 0;
          if (hasEntered && entry.intersectionRatio <= 0) {
            // eslint-disable-next-line react/react-compiler
            onCloseEvent();
            element.dispatchEvent(new CustomEvent('react-aria-sheet-close'));
          }
        },
        {threshold: [0, 1]}
      );

      let el = element.querySelector('[data-sheet-content]');
      if (el) {
        observer.observe(el);
      }

      let removeSheet = registerSheet(stackItem);

      return () => {
        observer.disconnect();
        removeSheet();
      };
    },
    [stackItem, axis, maxScroll, enteredScroll]
  );

  let mergedRefs = useMemo(() => mergeRefs(ref, domRef), [ref, domRef]);

  let sheetStack = useSyncExternalStore(subscribeStack, getSheetStack, getSheetStack);
  let index = Math.max(
    0,
    sheetStack.findIndex(e => e.id === id)
  );
  let descendants = sheetStack.slice(index + 1);
  let values: SheetValues = {
    position,
    swipeDirection,
    isExpanded,
    stackIndex: index,
    hasDescendants: descendants.length > 0
  };
  let sheetProps = useSheetRenderProps(props, values, 'react-aria-SheetOverlay', {
    // absolute rather than fixed so the modal is not clipped by iOS Safari.
    position: 'absolute',
    top: 0,
    left: 0,
    width: 'max(var(--page-width), 100vw)',
    height: 'max(var(--page-height), 100dvh)',
    overflow: 'clip',
    // @ts-ignore
    '--sheet-scroll-padding-x': 'calc(100vw - var(--visual-viewport-width))',
    '--sheet-scroll-padding-y': 'calc(100dvh - var(--visual-viewport-height))'
  });

  return (
    <ModalOverlay
      {...props}
      ref={mergedRefs}
      isDismissable={isDismissable}
      // Moving the VoiceOver cursor into the sheet (via focus, or by making the content behind it
      // inert) scrolls, which interrupts the enter scroll animation on iOS. Wait until it has entered.
      UNSTABLE_deferUntilEntered
      UNSTABLE_overrideFocus
      {...sheetProps}
      onEnter={element => {
        // The overlay is the document-anchored wrapper; the swipe gesture scrolls the inner container.
        let scroller = element.querySelector<HTMLElement>('[data-sheet-scroll]')!;
        let vp = axis === 'y' ? window.innerHeight : window.innerWidth;
        // Open at the first custom detent when provided, otherwise the fully-entered position.
        let initial = element.querySelector<HTMLElement>('[data-sheet-initial]');
        let scrollToRest = (smooth: boolean) => {
          if (initial) {
            scrollDetentIntoView(scroller, initial, axis, after ? 'start' : 'end', smooth);
          } else {
            scrollAlongAxis(scroller, axis, (enteredScroll / 100) * vp, smooth);
          }
        };
        if (enteredScroll === 0) {
          // The rest position is at scroll 0, so the sheet mounts already entered. Jump to the exit
          // first, then animate back in on the next frame — doing both in the same task can leave
          // the browser stuck at the jumped-to position instead of running the smooth scroll.
          scrollAlongAxis(scroller, axis, (maxScroll / 100) * vp);
          requestAnimationFrame(() => scrollToRest(true));
        } else {
          scrollToRest(true);
        }

        return new Promise<void>(resolve => {
          // eslint-disable-next-line rsp-rules/no-non-composing-event-listener
          scroller.addEventListener('scrollend', () => resolve(), {once: true});
        });
      }}
      onExit={element => {
        let scroller = element.querySelector<HTMLElement>('[data-sheet-scroll]')!;
        if (!isVisible.current) {
          // Wait for the end of the scroll gesture in Safari to avoid momentum scrolling re-targeting to the sheet behind.
          if (isSafari() && !isIOS()) {
            return new Promise<void>(resolve => {
              // eslint-disable-next-line rsp-rules/no-non-composing-event-listener
              scroller.addEventListener(
                'scrollend',
                () => {
                  setTimeout(() => resolve(), 50);
                },
                {once: true}
              );
            });
          }
          return;
        }

        let vp = axis === 'y' ? window.innerHeight : window.innerWidth;
        let maxScrollPx = (maxScroll / 100) * vp;
        let current = axis === 'y' ? scroller.scrollTop : scroller.scrollLeft;
        let target: number;
        if (after && !before) {
          target = 0;
        } else if (before && !after) {
          target = maxScrollPx;
        } else {
          // Dual direction: exit toward whichever edge is nearest the current position.
          target = current > (enteredScroll / 100) * vp ? maxScrollPx : 0;
        }
        scrollAlongAxis(scroller, axis, target, true);

        // The close event is dispatched on the overlay wrapper by the IntersectionObserver below.
        return new Promise<void>(resolve => {
          element.addEventListener('react-aria-sheet-close', () => resolve(), {once: true});
        });
      }}>
      {renderProps => (
        <InternalSheetContext.Provider
          value={{
            ...props,
            position,
            swipeDirection,
            index,
            descendants,
            isEntering: renderProps.isEntering,
            isExiting: renderProps.isExiting,
            values
          }}>
          {typeof children === 'function' ? children({...renderProps, ...values}) : children}
        </InternalSheetContext.Provider>
      )}
    </ModalOverlay>
  );
});

function getDataAttributes(values: SheetValues) {
  return {
    'data-position': values.position,
    'data-swipe-direction': values.swipeDirection,
    'data-expanded': values.isExpanded || undefined,
    'data-stack-index': values.stackIndex,
    'data-has-descendants': values.hasDescendants || undefined
  };
}

// Merges the sheet-specific values into the render props, className, and style of a Modal or ModalOverlay.
function useSheetRenderProps(
  props: RenderProps<SheetRenderProps>,
  values: SheetValues,
  defaultClassName: string,
  defaultStyle: CSSProperties,
  overrideStyle?: CSSProperties
) {
  return {
    ...getDataAttributes(values),
    render: props.render
      ? (domProps: React.JSX.IntrinsicElements['div'], renderProps: ModalRenderProps) =>
          props.render!(domProps, {...renderProps, ...values})
      : undefined,
    className: (renderProps: ModalRenderProps & {defaultClassName: string | undefined}) =>
      typeof props.className === 'function'
        ? props.className({...renderProps, ...values})
        : props.className || defaultClassName,
    style: (renderProps: ModalRenderProps & {defaultStyle: CSSProperties}) => ({
      ...defaultStyle,
      ...(typeof props.style === 'function'
        ? props.style({...renderProps, ...values})
        : props.style),
      ...overrideStyle
    })
  };
}

function resolveDirection<T extends string>(
  value: T | 'start' | 'end',
  direction: 'ltr' | 'rtl'
): T | 'left' | 'right' {
  if (value === 'start') {
    return direction === 'rtl' ? 'right' : 'left';
  }
  if (value === 'end') {
    return direction === 'rtl' ? 'left' : 'right';
  }
  return value as T;
}

type Axis = 'x' | 'y';

interface SwipeConfig {
  /** Scroll axis: 'y' for top/bottom/vertical, 'x' for left/right/horizontal. */
  axis: Axis;
  /** Whether the sheet may be swiped off the start edge (top/left). */
  before: boolean;
  /** Whether the sheet may be swiped off the end edge (bottom/right). */
  after: boolean;
  /** Distance in viewport percent between the two extreme scroll positions. */
  maxScroll: number;
  /** Scroll position (viewport percent) at which the sheet is fully entered. */
  enteredScroll: number;
  /** Offset of the scroll container along the swipe axis, in viewport percent. */
  containerOffset: number;
  /** CSS animation range. */
  viewRange: 'cover' | 'exit' | 'entry';
  /** CSS animation direction. */
  viewDirection: 'normal' | 'reverse' | 'alternate';
  /** CSS animation iteration count. */
  viewIterations: number;
}

// The sheet lives inside an oversized scroll container. Scrolling slides a viewport-sized "stage"
// (which holds the sheet) on and off screen along the swipe axis, so the browser drives the swipe
// gesture natively. The container is always 2 viewports along the axis; a fixed 1-viewport window
// (the actual browser viewport) looks onto it. The stage always sits 1 viewport into the content,
// and snap markers at the content extremes define the entered/exited resting positions.
function getSwipeConfig(swipeDirection: SheetSwipeDirection): SwipeConfig {
  let axis: Axis =
    swipeDirection === 'top' || swipeDirection === 'bottom' || swipeDirection === 'vertical'
      ? 'y'
      : 'x';
  let before =
    swipeDirection === 'top' ||
    swipeDirection === 'left' ||
    swipeDirection === 'vertical' ||
    swipeDirection === 'horizontal';
  let after =
    swipeDirection === 'bottom' ||
    swipeDirection === 'right' ||
    swipeDirection === 'vertical' ||
    swipeDirection === 'horizontal';
  // Each exitable side adds a viewport of scroll travel.
  let maxScroll = (Number(before) + Number(after)) * 100;
  // When the sheet can only exit toward the start edge (top/left), it rests at scroll 0 and is
  // swiped toward maxScroll to dismiss. Otherwise it rests 1 viewport in.
  let enteredScroll = before && !after ? 0 : 100;
  // Position the container so the rest position lands in the real viewport.
  let containerOffset = before && !after ? -100 : 0;

  // The sheet crosses a single viewport edge (the swipe edge), so map the animation to just that
  // crossing. In view-timeline terms `entry` is the scrollport's end edge (bottom/right, where the
  // sheet appears from) and `exit` is the start edge (top/left). Direction is chosen so progress 0
  // is the exited state and 1 is entered, matching keyframes authored from exited -> entered:
  // `entry` already runs gone -> entered, while `exit` runs entered -> gone and is reversed.
  //
  // Dual directions cross both edges, so run the same keyframe over the full `cover` range twice
  // (iteration count 2) with `alternate`: the view timeline splits its progress across the two
  // iterations, so it plays exited -> entered -> exited around the centered rest position. This
  // reuses a single exited -> entered keyframe rather than requiring an author to also write a
  // symmetric (0%/50%/100%) variant.
  const viewRange = before && after ? 'cover' : before ? 'exit' : 'entry';
  const viewDirection = before && after ? 'alternate' : before ? 'reverse' : 'normal';
  const viewIterations = before && after ? 2 : 1;

  return {
    axis,
    before,
    after,
    maxScroll,
    enteredScroll,
    containerOffset,
    viewRange,
    viewDirection,
    viewIterations
  };
}

// The resting [x, y] flex alignment for each sheet position, independent of the swipe direction.
const POSITION_ALIGNMENT: Record<SheetPosition, [string, string]> = {
  top: ['center', 'flex-start'],
  bottom: ['center', 'flex-end'],
  left: ['flex-start', 'center'],
  right: ['flex-end', 'center'],
  center: ['center', 'center']
};

interface SnapPointProps {
  point: number | string;
  align: 'start' | 'end' | 'none';
  axis: Axis;
}

// Converts a snap point value to a CSS length: numbers are pixels.
function toLength(point: number | string): string {
  return typeof point === 'number' ? `${point}px` : point;
}

function SnapPoint({point, align, axis}: SnapPointProps) {
  let mainUnit = axis === 'y' ? 'dvh' : 'dvw';
  let offset = toLength(point);
  return (
    <div
      style={{
        position: 'absolute',
        top: axis === 'y' ? offset : 0,
        left: axis === 'x' ? offset : 0,
        scrollSnapAlign: align,
        // A full viewport along the swipe axis so its start/end edge lands at the snap position.
        width: axis === 'x' ? `100${mainUnit}` : 1,
        height: axis === 'y' ? `100${mainUnit}` : 1
      }}
    />
  );
}

interface DetentPointProps {
  point: number | string;
  axis: Axis;
  after: boolean;
  isInitial?: boolean;
}

// A snap marker placed inside the sheet, `point` in from its leading edge. Because it moves with
// the sheet, snapping it with a `scroll-margin` of one viewport rests the marker at the edge of the
// visible viewport, leaving exactly `point` of the sheet on screen. Since `point` is an inset rather
// than part of the margin, percentages resolve relative to the sheet's size.
function DetentPoint({point, axis, after, isInitial}: DetentPointProps) {
  let viewport = axis === 'y' ? '100dvh' : '100dvw';
  let offset = toLength(point);
  let common: React.CSSProperties = {
    position: 'absolute',
    width: 1,
    height: 1,
    scrollSnapAlign: after ? 'start' : 'end'
  };
  let edge: React.CSSProperties =
    axis === 'y'
      ? after
        ? {top: offset, left: 0, scrollMarginTop: viewport}
        : {bottom: offset, left: 0, scrollMarginBottom: viewport}
      : after
        ? {top: 0, left: offset, scrollMarginLeft: viewport}
        : {top: 0, right: offset, scrollMarginRight: viewport};
  return (
    <div
      data-sheet-detent
      data-sheet-initial={isInitial || undefined}
      style={{...common, ...edge}}
    />
  );
}

export interface SheetProps
  extends
    Omit<
      ModalOverlayProps,
      | 'className'
      | 'style'
      | 'children'
      | 'render'
      | 'onEnter'
      | 'onExit'
      | 'isEntering'
      | 'isExiting'
      | 'isDismissable'
      | 'isOpen'
      | 'defaultOpen'
      | 'onOpenChange'
      | 'isKeyboardDismissDisabled'
      | 'shouldCloseOnInteractOutside'
    >,
    RenderProps<SheetRenderProps> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-Sheet'
   */
  className?: ClassNameOrFunction<SheetRenderProps>;
  /** CSS `@keyframes` name for the animation that occurs while the user swipes. */
  swipeAnimation?: string;
  /**
   * The snap point indices between which the swipe animation occurs. If omitted, the animation will
   * occur over the full range of the sheet's movement.
   */
  swipeAnimationRange?: {start?: number; end?: number};
  /** CSS `@keyframes` name for the animation that occurs when a sheet has descendants. */
  stackAnimation?: string;
  /** Whether to add padding to the sheet so that it appears to continue outside the viewport. */
  overscrollPadding?: boolean;
}

/**
 * A Sheet is a swipeable overlay that slides in from the edge of the viewport.
 */
export const Sheet = forwardRef(function Sheet(
  props: SheetProps,
  domRef: ForwardedRef<HTMLDivElement>
) {
  let ref = useObjectRef(domRef);
  let scrollRef = useRef<HTMLDivElement>(null);
  let stageRef = useRef<HTMLDivElement>(null);
  let {
    position,
    swipeDirection,
    snapPoints,
    index,
    descendants,
    isEntering,
    isExiting,
    isDismissable = true,
    values
  } = useContext(InternalSheetContext)!;
  // The ModalOverlay may defer its enter animation (e.g. until the software keyboard opens), during
  // which isEntering is false. The sheet is not settled until it has opened, so treat it as entering.
  let isOpen = useContext(InternalModalContext)?.isOpen ?? true;
  let isTransitioning = !isOpen || isEntering || isExiting;
  let {direction} = useLocale();
  let {axis, after, before, containerOffset} = getSwipeConfig(swipeDirection);
  let viewport = axis === 'y' ? '100dvh' : '100dvw';

  // A non-dismissable sheet can still be swiped between its snap points, but not past the smallest
  // one. Enter/exit animations still need the exit space, so only clamp while settled.
  let hasSnapPoints = !!snapPoints?.length && before !== after;
  let isClamped = !isDismissable && !isTransitioning;
  let snapTravel = useSnapPointTravel(
    stageRef,
    ref,
    axis,
    after,
    !isDismissable && hasSnapPoints ? snapPoints!.join(' ') : null
  );

  // Scroll travel between the smallest snap point and the fully revealed sheet. It is at least 1px
  // so the scroll container remains scrollable, which lets the browser show its native overscroll
  // bounce even when there is nowhere to snap to.
  let clampedTravel = `${hasSnapPoints ? Math.max(1, snapTravel) : 1}px`;

  // The stage normally sits 1 viewport in so the sheet can scroll fully off screen toward the start
  // edge. When clamped, sheets exiting toward the end edge move it so scroll 0 rests at the smallest
  // snap point. Sheets exiting toward the start edge rest at scroll 0 already, so only the end of
  // the scroll content (the smallest snap point) moves. Dual direction sheets get 1px either side.
  let stageStart = isClamped && after ? clampedTravel : viewport;
  let endMarker: string;
  if (isClamped && before && after) {
    endMarker = `calc(${stageStart} + ${viewport} + 1px)`;
  } else if (isClamped && before) {
    endMarker = `calc(${clampedTravel} + ${viewport})`;
  } else {
    endMarker = `calc(${stageStart} + ${viewport}${before && after ? ` + ${viewport}` : ''})`;
  }

  // Keep the sheet visually in place when switching between the clamped and unclamped geometry.
  // Scroll snapping is disabled while a non-dismissable sheet enters and exits so the browser
  // doesn't re-snap when the geometry changes, which would otherwise differ between browsers.
  let prevStageOffset = useRef<number | null>(null);
  let prevClamped = useRef(isClamped);
  useLayoutEffect(() => {
    let stage = stageRef.current;
    let scroller = scrollRef.current;
    if (!stage || !scroller) {
      return;
    }
    let offset = axis === 'y' ? stage.offsetTop : stage.offsetLeft;
    if (prevClamped.current !== isClamped && prevStageOffset.current != null) {
      let delta = offset - prevStageOffset.current;
      if (delta !== 0) {
        if (axis === 'y') {
          scroller.scrollTop += delta;
        } else {
          scroller.scrollLeft += delta;
        }
      }
    }
    prevClamped.current = isClamped;
    prevStageOffset.current = offset;
  });

  let swipeAnimation = useSwipeAnimation(props);
  let style: Record<string, string | number | undefined> = {
    // Positioned so the detent markers below anchor to the sheet's own box.
    position: 'relative',
    ...swipeAnimation
  };

  let overscrollInset: string | undefined;
  if (props.overscrollPadding && position === swipeDirection) {
    overscrollInset = axis === 'y' ? '100vh' : '100vw';
    // Extra padding to allow overscrolling, and a negative margin to offset it.
    switch (position) {
      case 'top':
        style.paddingTop = '100vh';
        style.marginTop = '-100vh';
        break;
      case 'bottom':
        style.paddingBottom = '100vh';
        style.marginBottom = '-100vh';
        break;
      case 'left':
        style.paddingLeft = '100vw';
        style.marginLeft = '-100vw';
        break;
      case 'right':
        style.paddingRight = '100vw';
        style.marginRight = '-100vw';
        break;
    }
  }

  if (props.stackAnimation && descendants.length > 0 && supportsViewTimeline) {
    // Append one animation per descendant sheet, driven by that descendant's view timeline.
    let stackStyle: Record<string, (d: SheetStackEntry, i: number) => string> = {
      animationName: () => props.stackAnimation!,
      animationTimeline: (_, i) => `--sheet-timeline-${index + 1 + i}`,
      animationDirection: d => d.direction,
      animationIterationCount: d => String(d.iterations),
      animationFillMode: () => 'both',
      animationRange: d => d.range,
      animationComposition: () => 'accumulate',
      animationTimingFunction: () => 'linear'
    };
    for (let [key, value] of Object.entries(stackStyle)) {
      style[key] = [style[key], ...descendants.map(value)].filter(Boolean).join(', ');
    }
  }

  let sheetProps = useSheetRenderProps(props, values, 'react-aria-Sheet', {direction}, style);
  let [x, y] = POSITION_ALIGNMENT[position];
  let justifyContent = axis === 'y' ? y : x;
  let alignItems = axis === 'y' ? x : y;
  let {scrollX, scrollY} = typeof window !== 'undefined' ? window : {scrollX: 0, scrollY: 0};

  return (
    <div
      ref={scrollRef}
      data-sheet-scroll
      style={{
        position: 'absolute',
        top: axis === 'y' ? `calc(${scrollY}px + ${containerOffset}dvh)` : scrollY,
        left: axis === 'x' ? `calc(${scrollX}px + ${containerOffset}dvw)` : scrollX,
        // The container is 2 viewports along the swipe axis and 1 viewport on the cross axis.
        height: axis === 'y' ? '200dvh' : '100dvh',
        width: axis === 'x' ? '200dvw' : '100dvw',
        overflowX: axis === 'x' ? 'auto' : 'hidden',
        overflowY: axis === 'y' ? 'auto' : 'hidden',
        // Snapping is only disabled when the geometry changes. Changing it during a swipe to dismiss
        // cancels the momentum scroll in Safari without firing scrollend, which onExit waits for.
        scrollSnapType: !isDismissable && isTransitioning ? 'none' : `${axis} mandatory`,
        overscrollBehaviorY: axis === 'y' ? 'contain' : 'none',
        overscrollBehaviorX: axis === 'x' ? 'contain' : 'none',
        scrollbarWidth: 'none',
        // The scroll geometry is physical, so keep the scroll origin and flex alignment
        // left-to-right regardless of the document direction.
        direction: 'ltr'
      }}>
      {/* Snap marker for the exit at scroll 0 (also the rest position for top/left).
        When clamped, the exit positions are unreachable so they are not snap targets. */}
      <SnapPoint point={0} align={isClamped && after ? 'none' : 'start'} axis={axis} />
      {/* When the sheet can exit both ways, add a center snap for the rest position. */}
      {before && after && <SnapPoint point={stageStart} align="start" axis={axis} />}
      <div
        ref={stageRef}
        style={{
          position: 'absolute',
          // The stage normally sits 1 viewport into the content along the swipe axis.
          top: axis === 'y' ? stageStart : 0,
          left: axis === 'x' ? stageStart : 0,
          height: '100dvh',
          width: '100dvw',
          display: 'flex',
          flexDirection: axis === 'y' ? 'column' : 'row',
          alignItems,
          justifyContent
        }}>
        <Modal {...props} ref={ref} {...sheetProps}>
          {renderProps => (
            <>
              {snapPoints && (
                // Excludes the overscroll padding so percentages are relative to the visible sheet.
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    ...(overscrollInset ? {[position]: overscrollInset} : null),
                    pointerEvents: 'none'
                  }}>
                  {snapPoints.map((point, i) => (
                    <DetentPoint
                      key={i}
                      point={point}
                      axis={axis}
                      after={after}
                      isInitial={i === 0}
                    />
                  ))}
                </div>
              )}
              {typeof props.children === 'function'
                ? props.children({...renderProps, ...values})
                : props.children}
            </>
          )}
        </Modal>
      </div>
      {/* Snap marker for the exit at the far end of the scroll content. */}
      <SnapPoint point={endMarker} align={isClamped && before ? 'none' : 'end'} axis={axis} />
    </div>
  );
});

// Measures how far the sheet must scroll from its smallest snap point to be fully revealed, i.e. the
// distance from that snap point's marker to the stage's exit edge. Measuring the rendered markers
// means snap points can use any CSS length, including percentages of the sheet. Uses layout offsets
// rather than bounding rects so swipe/stack animation transforms don't affect it.
function useSnapPointTravel(
  stageRef: React.RefObject<HTMLDivElement | null>,
  sheetRef: React.RefObject<HTMLDivElement | null>,
  axis: Axis,
  after: boolean,
  // Space-separated snap points, so markers are re-measured when they change. Null to disable.
  snapPointsKey: string | null
): number {
  let [travel, setTravel] = useState(0);
  useLayoutEffect(() => {
    let stage = stageRef.current;
    let sheet = sheetRef.current;
    if (snapPointsKey == null || !stage || !sheet) {
      return;
    }

    let measure = () => {
      let stageSize = axis === 'y' ? stage.clientHeight : stage.clientWidth;
      let max = 0;
      for (let marker of sheet.querySelectorAll<HTMLElement>('[data-sheet-detent]')) {
        let offset = 0;
        let el: HTMLElement | null = marker;
        while (el && el !== stage) {
          offset += axis === 'y' ? el.offsetTop : el.offsetLeft;
          el = el.offsetParent as HTMLElement | null;
        }
        // Markers sit at the snap point's start edge for sheets exiting toward the end edge, and at
        // its end edge for sheets exiting toward the start edge. The smallest snap point travels most.
        let size = axis === 'y' ? marker.offsetHeight : marker.offsetWidth;
        max = Math.max(max, after ? stageSize - offset : offset + size);
      }
      setTravel(max);
    };

    measure();
    let observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, [stageRef, sheetRef, axis, after, snapPointsKey]);

  return travel;
}

export interface SheetBackdropProps
  extends RenderProps<SheetRenderProps>, GlobalDOMAttributes<HTMLDivElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for
   * the element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-SheetBackdrop'
   */
  className?: ClassNameOrFunction<SheetRenderProps>;
  /** CSS `@keyframes` name for the animation that occurs while the user swipes. */
  swipeAnimation?: string;
  /**
   * The snap point indices between which the swipe animation occurs. If omitted, the animation will
   * occur over the full range of the sheet's movement.
   */
  swipeAnimationRange?: {start?: number; end?: number};
}

/**
 * The backdrop behind a sheet.
 */
export const SheetBackdrop = forwardRef(function SheetBackdrop(
  props: SheetBackdropProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  let style = useSwipeAnimation(props);
  let {values, isEntering, isExiting} = useContext(InternalSheetContext)!;
  let state = useContext(OverlayTriggerStateContext)!;
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-SheetBackdrop',
    defaultStyle: {...style, position: 'absolute', inset: 0},
    values: {...values, isEntering, isExiting, state}
  });

  return (
    <div
      ref={ref}
      {...filterDOMProps(props, {global: true})}
      {...renderProps}
      {...getDataAttributes(values)}
      data-entering={isEntering || undefined}
      data-exiting={isExiting || undefined}
    />
  );
});

function useSwipeAnimation(props: SheetBackdropProps) {
  let {swipeDirection, snapPoints, index, isEntering, isExiting} =
    useContext(InternalSheetContext)!;
  let {viewRange, viewDirection, viewIterations} = getSwipeConfig(swipeDirection);

  if (props.swipeAnimation) {
    let rangeStart =
      props.swipeAnimationRange?.start != null
        ? toLength(snapPoints?.[props.swipeAnimationRange.start] ?? '0%')
        : '0%';
    let rangeEnd =
      props.swipeAnimationRange?.end != null
        ? toLength(snapPoints?.[props.swipeAnimationRange.end] ?? '100%')
        : '100%';
    if (swipeDirection === 'top' || swipeDirection === 'left') {
      rangeStart = `calc(100% - ${rangeStart})`;
      rangeEnd = `calc(100% - ${rangeEnd})`;
      [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
    }

    // TODO: fix cover with range

    if (supportsViewTimeline) {
      return {
        animationName: props.swipeAnimation,
        animationTimeline: `--sheet-timeline-${index}`,
        animationDirection: viewDirection,
        animationIterationCount: viewIterations,
        animationFillMode: 'both',
        animationRange: `${viewRange} ${rangeStart} ${viewRange} ${rangeEnd}`,
        animationTimingFunction: 'linear',
        animationComposition: 'replace'
      };
    } else if (isEntering || isExiting) {
      // Fallback for Firefox, which doesn't support view timelines.
      return {
        animationName: props.swipeAnimation,
        animationDirection: isExiting ? 'reverse' : 'normal',
        animationDuration: '300ms',
        animationIterationCount: '1',
        animationFillMode: 'both',
        animationTimingFunction: 'linear',
        animationComposition: 'replace'
      };
    }
  }

  return {};
}

export interface SheetContentProps extends Omit<DialogProps, 'className' | 'isEntering'> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element.
   *
   * @default 'react-aria-SheetContent'
   */
  className?: string;
}

/**
 * The scrollable content area of a sheet.
 */
export const SheetContent = forwardRef(function SheetContent(
  props: SheetContentProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  let {swipeDirection, index} = useContext(InternalSheetContext)!;
  let {axis, before, after} = getSwipeConfig(swipeDirection);
  let viewportLength = axis === 'y' ? '100dvh' : '100dvw';

  return (
    <Dialog
      {...props}
      ref={ref}
      className={props.className || 'react-aria-SheetContent'}
      data-sheet-content
      style={{
        ...props.style,
        width: '100%',
        height: '100%',
        // The dialog is the subject of the view-progress timeline that drives all sheet animations.
        // It is _not_ the Modal because that may have additional padding for overscroll and therefore never be entirely visible.
        // The inset crops the scroll container's scrollport down to the visible viewport.
        // @ts-ignore
        viewTimelineName: `--sheet-timeline-${index}`,
        viewTimelineAxis: axis,
        viewTimelineInset: before && !after ? `${viewportLength} 0` : `0 ${viewportLength}`
      }}
    />
  );
});

function reduceMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function scrollAlongAxis(element: HTMLElement, axis: Axis, value: number, smooth = false) {
  let behavior: ScrollBehavior | undefined = smooth && !reduceMotion() ? 'smooth' : undefined;
  element.scrollTo(axis === 'y' ? {top: value, behavior} : {left: value, behavior});
}

function scrollDetentIntoView(
  scroller: HTMLElement,
  marker: HTMLElement,
  axis: Axis,
  align: 'start' | 'end',
  smooth = false
) {
  let behavior: ScrollBehavior = smooth && !reduceMotion() ? 'smooth' : 'auto';
  let markerRect = marker.getBoundingClientRect();
  let scrollerRect = scroller.getBoundingClientRect();
  let style = getComputedStyle(marker);
  if (axis === 'y') {
    if (align === 'start') {
      let margin = parseFloat(style.scrollMarginTop) || 0;
      // Rest the marker's start edge (less its scroll-margin) at the scrollport's start.
      let top = markerRect.top - scrollerRect.top + scroller.scrollTop - margin;
      scroller.scrollTo({top, behavior});
    } else {
      let margin = parseFloat(style.scrollMarginBottom) || 0;
      // Rest the marker's end edge (plus its scroll-margin) at the scrollport's end.
      let top =
        markerRect.bottom - scrollerRect.top + scroller.scrollTop + margin - scroller.clientHeight;
      scroller.scrollTo({top, behavior});
    }
  } else {
    if (align === 'start') {
      let margin = parseFloat(style.scrollMarginLeft) || 0;
      let left = markerRect.left - scrollerRect.left + scroller.scrollLeft - margin;
      scroller.scrollTo({left, behavior});
    } else {
      let margin = parseFloat(style.scrollMarginRight) || 0;
      let left =
        markerRect.right - scrollerRect.left + scroller.scrollLeft + margin - scroller.clientWidth;
      scroller.scrollTo({left, behavior});
    }
  }
}
