import {ClassNameOrFunction, RenderProps, useRenderProps} from './utils';
import {Dialog, DialogProps} from './Dialog';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {GlobalDOMAttributes} from '@react-types/shared';
import {isIOS, isSafari} from 'react-aria/private/utils/platform';
import {Modal, ModalOverlay, ModalOverlayProps, ModalRenderProps} from './Modal';
import {OverlayTriggerStateContext} from './Dialog';
import React, {
  createContext,
  CSSProperties,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} from 'react';
import {useEffectEvent} from 'react-aria/private/utils/useEffectEvent';
import {useId} from 'react-aria/useId';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
import {useLocale} from 'react-aria/I18nProvider';

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
    Omit<ModalOverlayProps, 'className' | 'style' | 'children' | 'render'>,
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
   * Sheets initially open to the first snap point.
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

interface SheetContextValue extends Omit<SheetOverlayProps, 'position' | 'swipeDirection'> {
  position: SheetPosition;
  swipeDirection: SheetSwipeDirection;
  index: number;
  descendants: SheetStackEntry[];
  isEntering: boolean;
  isExiting: boolean;
  values: SheetValues;
}

const SheetContext = createContext<SheetContextValue | null>(null);

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
  // 1 extra because Safari needs timelines declared before the sheet mounts.
  // TODO: don't override existing timelines declared in CSS or inline styles.
  let names = Array.from({length: sheetStack.length + 1})
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
export function SheetOverlay(props: SheetOverlayProps) {
  let {children, isDismissable = true} = props;
  let {direction} = useLocale();
  let position = resolveDirection(props.position ?? 'bottom', direction);
  let swipeDirection = props.swipeDirection
    ? resolveDirection(props.swipeDirection, direction)
    : position === 'center'
      ? 'vertical'
      : position;
  let contextState = useContext(OverlayTriggerStateContext);
  let onClose = useEffectEvent(() => {
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
            onClose();
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
    [stackItem]
  );

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
      ref={ref}
      isDismissable={isDismissable}
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
        <SheetContext.Provider
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
        </SheetContext.Provider>
      )}
    </ModalOverlay>
  );
}

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

// Converts a snap point value to a CSS length along the swipe axis: numbers are viewport relative.
function toLength(point: number | string, axis: Axis): string {
  return typeof point === 'number' ? `${point}${axis === 'y' ? 'dvh' : 'vw'}` : point;
}

function SnapPoint({point, align, axis}: SnapPointProps) {
  let mainUnit = axis === 'y' ? 'dvh' : 'vw';
  let offset = toLength(point, axis);
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

// A snap marker anchored to the sheet's leading edge. Because it moves with the sheet, snapping it
// with a `scroll-margin` of `viewport - visibleAmount` rests the sheet with exactly `visibleAmount`
// of it on screen.
function DetentPoint({point, axis, after, isInitial}: DetentPointProps) {
  let viewport = axis === 'y' ? '100dvh' : '100vw';
  let margin = `calc(${viewport} - ${toLength(point, axis)})`;
  let common: React.CSSProperties = {
    position: 'absolute',
    width: 1,
    height: 1,
    scrollSnapAlign: after ? 'start' : 'end'
  };
  let edge: React.CSSProperties =
    axis === 'y'
      ? after
        ? {top: 0, left: 0, scrollMarginTop: margin}
        : {bottom: 0, left: 0, scrollMarginBottom: margin}
      : after
        ? {top: 0, left: 0, scrollMarginLeft: margin}
        : {top: 0, right: 0, scrollMarginRight: margin};
  return <div data-sheet-initial={isInitial || undefined} style={{...common, ...edge}} />;
}

export interface SheetProps
  extends
    Omit<ModalOverlayProps, 'className' | 'style' | 'children' | 'render'>,
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
export function Sheet(props: SheetProps) {
  let ref = useRef<HTMLDivElement>(null);
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
  } = useContext(SheetContext)!;
  let {direction} = useLocale();
  let {axis, after, before, containerOffset} = getSwipeConfig(swipeDirection);
  let viewport = axis === 'y' ? '100dvh' : '100vw';

  // A non-dismissable sheet can still be swiped between its snap points, but not past the smallest
  // one. Enter/exit animations still need the exit space, so only clamp while settled.
  let hasSnapPoints = !!snapPoints?.length && before !== after;
  let isClamped = !isDismissable && !isEntering && !isExiting;
  let sheetExtent = useSheetExtent(stageRef, ref, axis, before, !isDismissable && hasSnapPoints);

  // Scroll travel between the smallest snap point and the fully revealed sheet. It is at least 1px
  // so the scroll container remains scrollable, which lets the browser show its native overscroll
  // bounce even when there is nowhere to snap to.
  let clampedTravel = '1px';
  if (hasSnapPoints) {
    let points = snapPoints!.map(p => toLength(p, axis));
    let minPoint = points.length > 1 ? `min(${points.join(', ')})` : points[0];
    clampedTravel = `max(1px, calc(${sheetExtent}px - ${minPoint}))`;
  }

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

  let style: Record<string, string> = {
    // Positioned so the detent markers below anchor to the sheet's own box.
    position: 'relative'
  };

  if (props.overscrollPadding && position === swipeDirection) {
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

  let swipeAnimation = useSwipeAnimation(props);
  Object.assign(style, swipeAnimation);

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

  return (
    <div
      ref={scrollRef}
      data-sheet-scroll
      style={{
        position: 'absolute',
        top: axis === 'y' ? `calc(${window.scrollY}px + ${containerOffset}dvh)` : window.scrollY,
        left: axis === 'x' ? `${containerOffset}vw` : 0,
        // The container is 2 viewports along the swipe axis and 1 viewport on the cross axis.
        height: axis === 'y' ? '200dvh' : '100dvh',
        width: axis === 'x' ? '200vw' : '100vw',
        overflowX: axis === 'x' ? 'auto' : 'hidden',
        overflowY: axis === 'y' ? 'auto' : 'hidden',
        // Snapping is only disabled when the geometry changes. Changing it during a swipe to dismiss
        // cancels the momentum scroll in Safari without firing scrollend, which onExit waits for.
        scrollSnapType: !isDismissable && (isEntering || isExiting) ? 'none' : `${axis} mandatory`,
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
          width: '100vw',
          display: 'flex',
          flexDirection: axis === 'y' ? 'column' : 'row',
          alignItems,
          justifyContent
        }}>
        <Modal {...props} ref={ref} {...sheetProps}>
          {renderProps => (
            <>
              {snapPoints?.map((point, i) => (
                <DetentPoint key={i} point={point} axis={axis} after={after} isInitial={i === 0} />
              ))}
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
}

// Measures the distance from the sheet's leading edge to the stage's exit edge along the swipe axis,
// i.e. how much of the sheet is visible when fully entered. Uses layout offsets rather than
// bounding rects so swipe/stack animation transforms don't affect it.
function useSheetExtent(
  stageRef: React.RefObject<HTMLDivElement | null>,
  sheetRef: React.RefObject<HTMLDivElement | null>,
  axis: Axis,
  before: boolean,
  isEnabled: boolean
): number {
  let [extent, setExtent] = useState(0);
  useLayoutEffect(() => {
    let stage = stageRef.current;
    let sheet = sheetRef.current;
    if (!isEnabled || !stage || !sheet) {
      return;
    }

    let measure = () => {
      let offset = 0;
      let el: HTMLElement | null = sheet;
      while (el && el !== stage) {
        offset += axis === 'y' ? el.offsetTop : el.offsetLeft;
        el = el.offsetParent as HTMLElement | null;
      }
      let size = axis === 'y' ? sheet.offsetHeight : sheet.offsetWidth;
      let stageSize = axis === 'y' ? stage.clientHeight : stage.clientWidth;
      setExtent(before ? offset + size : stageSize - offset);
    };

    measure();
    let observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, [stageRef, sheetRef, axis, before, isEnabled]);

  return extent;
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
export function SheetBackdrop(props: SheetBackdropProps) {
  let style = useSwipeAnimation(props);
  let {values, isEntering, isExiting} = useContext(SheetContext)!;
  let state = useContext(OverlayTriggerStateContext)!;
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-SheetBackdrop',
    defaultStyle: {...style, position: 'absolute', inset: 0},
    values: {...values, isEntering, isExiting, state}
  });

  return (
    <div
      {...filterDOMProps(props, {global: true})}
      {...renderProps}
      {...getDataAttributes(values)}
      data-entering={isEntering || undefined}
      data-exiting={isExiting || undefined}
    />
  );
}

function useSwipeAnimation(props: SheetBackdropProps) {
  let {swipeDirection, snapPoints, index, isEntering, isExiting} = useContext(SheetContext)!;
  let {axis, viewRange, viewDirection, viewIterations} = getSwipeConfig(swipeDirection);

  if (props.swipeAnimation) {
    let rangeStart =
      props.swipeAnimationRange?.start != null
        ? toLength(snapPoints?.[props.swipeAnimationRange.start] || '0%', axis)
        : '0%';
    let rangeEnd =
      props.swipeAnimationRange?.end != null
        ? toLength(snapPoints?.[props.swipeAnimationRange.end] || '100%', axis)
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

export interface SheetContentProps extends DialogProps {}

/**
 * The scrollable content area of a sheet.
 */
export function SheetContent(props: SheetContentProps) {
  let {swipeDirection, index} = useContext(SheetContext)!;
  let {axis, before, after} = getSwipeConfig(swipeDirection);
  let viewportLength = axis === 'y' ? '100dvh' : '100vw';

  return (
    <Dialog
      {...props}
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
}

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
