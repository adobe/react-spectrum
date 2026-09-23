import {Dialog, DialogProps} from './Dialog';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {GlobalDOMAttributes} from '@react-types/shared';
import {isWebKit} from 'react-aria/private/utils/platform';
import {Modal, ModalOverlay, ModalOverlayProps} from './Modal';
import {OverlayTriggerStateContext} from './Dialog';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} from 'react';
import {RenderProps, useRenderProps} from './utils';
import {useEffectEvent} from 'react-aria/private/utils/useEffectEvent';

interface SheetOverlayProps extends ModalOverlayProps {
  children: ReactNode;
  position?: 'bottom' | 'top' | 'left' | 'right' | 'center';
  swipeDirection: 'bottom' | 'top' | 'vertical' | 'left' | 'right' | 'horizontal';
  /**
   * Additional resting positions ("detents") the sheet can snap to, expressed as the amount of the
   * sheet that is visible along the swipe axis. A number is viewport relative (in viewport
   * percent); a string is any CSS length (e.g. `'300px'`). The sheet opens at the first value. The
   * dismiss and fully-entered snap positions are always present in addition to these.
   *
   * @example
   *   [50]; // opens with half the viewport of sheet showing, expandable to full or swiped away
   *
   * @example
   *   ['300px']; // opens with 300px of the sheet showing
   */
  snapPoints?: Array<number | string>;
}

interface SheetContextValue extends SheetOverlayProps {
  /** This sheet's depth in the stack (0 = root). */
  index: number;
  descendants: SheetStackEntry[];
  isEntering: boolean;
  isExiting: boolean;
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
  // Hoist every mounted sheet's timeline name to the root so a parent (a portal sibling of its
  // child, not an ancestor) can still resolve the child's timeline by name.
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
  typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()');

export function SheetOverlay(props: SheetOverlayProps) {
  let {
    children,
    isDismissable = true,
    position = 'bottom',
    swipeDirection = position === 'center' ? 'vertical' : position,
    style
  } = props;
  let contextState = useContext(OverlayTriggerStateContext);
  let onClose = useEffectEvent(() => {
    contextState!.close();
  });

  let {axis, before, after, maxScroll, enteredScroll, containerOffset, length} =
    getSwipeConfig(swipeDirection);

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
  let viewRange = before && after ? 'cover' : before ? 'exit' : 'entry';
  let viewDirection = before && after ? 'alternate' : before ? 'reverse' : 'normal';
  let viewIterations = before && after ? 2 : 1;

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

  let alignment = getPositionAlignment(position);
  let justifyContent = axis === 'y' ? alignment.y : alignment.x;
  let alignItems = axis === 'y' ? alignment.x : alignment.y;

  let sheetStack = useSyncExternalStore(subscribeStack, getSheetStack, getSheetStack);
  let index = Math.max(
    0,
    sheetStack.findIndex(e => e.id === id)
  );
  let descendants = sheetStack.slice(index + 1);

  return (
    <ModalOverlay
      ref={ref}
      isDismissable={isDismissable}
      data-position={position}
      data-swipe-direction={swipeDirection}
      data-expanded={isExpanded || undefined}
      data-stack-index={index}
      data-stack-descendants={descendants.length > 0 ? descendants.length : undefined}
      className={props.className || 'react-aria-SheetOverlay'}
      style={renderProps => ({
        position: 'absolute',
        top: axis === 'y' ? `${containerOffset}dvh` : 0,
        left: axis === 'x' ? `${containerOffset}vw` : 0,
        // The container is 2 viewports along the swipe axis and 1 viewport on the cross axis.
        height: axis === 'y' ? '200dvh' : '100dvh',
        width: axis === 'x' ? '200vw' : '100vw',
        overflow: isDismissable ? 'auto' : 'hidden',
        scrollSnapType: `${axis} mandatory`,
        overscrollBehaviorY: axis === 'y' ? 'contain' : 'none',
        overscrollBehaviorX: axis === 'x' ? 'contain' : 'none',
        scrollbarWidth: 'none',
        // @ts-ignore
        '--sheet-scroll-padding-x': 'calc(100vw - var(--visual-viewport-width))',
        '--sheet-scroll-padding-y': 'calc(100dvh - var(--visual-viewport-height))',
        '--sheet-stack-index': index,
        ...(typeof style === 'function' ? style(renderProps) : style)
      })}
      onEnter={element => {
        let vp = axis === 'y' ? window.innerHeight : window.innerWidth;
        // Open at the first custom detent when provided, otherwise the fully-entered position. The
        // detent marker snaps via scroll-margin, so scrollIntoView (which honors scroll-margin) lands
        // exactly on its snap position — no manual math. Its start/end alignment matches the edge the
        // sheet exits toward.
        let initial = element.querySelector<HTMLElement>('[data-sheet-initial]');
        let scrollToRest = (smooth: boolean) => {
          if (initial) {
            let behavior: ScrollBehavior = smooth ? 'smooth' : 'auto';
            initial.scrollIntoView(
              axis === 'y'
                ? {behavior, block: after ? 'start' : 'end'}
                : {behavior, inline: after ? 'start' : 'end', block: 'nearest'}
            );
          } else {
            scrollAlongAxis(element, axis, (enteredScroll / 100) * vp, smooth);
          }
        };
        if (enteredScroll === 0) {
          // The rest position is at scroll 0, so the sheet mounts already entered. Jump to the exit
          // first, then animate back in on the next frame — doing both in the same task can leave
          // the browser stuck at the jumped-to position instead of running the smooth scroll.
          scrollAlongAxis(element, axis, (maxScroll / 100) * vp);
          requestAnimationFrame(() => scrollToRest(true));
        } else {
          scrollToRest(true);
        }

        return new Promise<void>(resolve => {
          // eslint-disable-next-line rsp-rules/no-non-composing-event-listener
          element.addEventListener('scrollend', () => resolve(), {once: true});
        });
      }}
      onExit={element => {
        if (!isVisible.current) {
          // Wait for the end of the scroll gesture in Safari to avoid re-targeting to the sheet behind.
          if (isWebKit()) {
            return new Promise<void>(resolve => {
              // eslint-disable-next-line rsp-rules/no-non-composing-event-listener
              element.addEventListener(
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
        let current = axis === 'y' ? element.scrollTop : element.scrollLeft;
        let target: number;
        if (after && !before) {
          target = 0;
        } else if (before && !after) {
          target = maxScrollPx;
        } else {
          // Dual direction: exit toward whichever edge is nearest the current position.
          target = current > (enteredScroll / 100) * vp ? maxScrollPx : 0;
        }
        scrollAlongAxis(element, axis, target, true);

        return new Promise<void>(resolve => {
          element.addEventListener('react-aria-sheet-close', () => resolve(), {once: true});
        });
      }}>
      {({isEntering, isExiting}) => (
        <>
          {/* Snap marker for the exit at scroll 0 (also the rest position for top/left). */}
          <SnapPoint point={0} align="start" axis={axis} />
          {/* When the sheet can exit both ways, add a center snap for the rest position. */}
          {before && after && <SnapPoint point={100} align="start" axis={axis} />}
          {/* Custom "amount visible" detents are rendered inside the sheet (see SheetContent), so their
              snap position tracks the sheet's leading edge regardless of its size. */}
          <div
            style={{
              position: 'absolute',
              // The stage sits 1 viewport into the content along the swipe axis.
              top: axis === 'y' ? '100dvh' : 0,
              left: axis === 'x' ? '100vw' : 0,
              height: '100dvh',
              width: '100vw',
              display: 'flex',
              flexDirection: axis === 'y' ? 'column' : 'row',
              alignItems,
              justifyContent
            }}>
            <SheetContext.Provider value={{...props, index, descendants, isEntering, isExiting}}>
              {children}
            </SheetContext.Provider>
          </div>
          {/* Snap marker for the exit at the far end of the scroll content. */}
          <SnapPoint point={length - 100} align="end" axis={axis} />
        </>
      )}
    </ModalOverlay>
  );
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
  /** Total length of the scroll content along the swipe axis, in viewport percent. */
  length: number;
}

// The sheet lives inside an oversized scroll container. Scrolling slides a viewport-sized "stage"
// (which holds the sheet) on and off screen along the swipe axis, so the browser drives the swipe
// gesture natively. The container is always 2 viewports along the axis; a fixed 1-viewport window
// (the actual browser viewport) looks onto it. The stage always sits 1 viewport into the content,
// and snap markers at the content extremes define the entered/exited resting positions.
function getSwipeConfig(swipeDirection: SheetOverlayProps['swipeDirection']): SwipeConfig {
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
  // Content spans the stage plus a viewport of exit space on each exitable side.
  let length = (2 + Number(before) + Number(after)) * 100;
  return {axis, before, after, maxScroll, enteredScroll, containerOffset, length};
}

// Maps a sheet position to its resting alignment on each axis, independent of the swipe direction.
function getPositionAlignment(position: NonNullable<SheetOverlayProps['position']>): {
  x: string;
  y: string;
} {
  switch (position) {
    case 'top':
      return {x: 'center', y: 'flex-start'};
    case 'bottom':
      return {x: 'center', y: 'flex-end'};
    case 'left':
      return {x: 'flex-start', y: 'center'};
    case 'right':
      return {x: 'flex-end', y: 'center'};
    case 'center':
    default:
      return {x: 'center', y: 'center'};
  }
}

interface SnapPointProps {
  /** Offset along the swipe axis: a number is viewport percent, a string is any CSS length. */
  point: number | string;
  align: 'start' | 'end';
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
  /**
   * Amount of the sheet that is visible at this detent: a number is viewport percent, a string any
   * CSS length.
   */
  point: number | string;
  axis: Axis;
  /**
   * Whether the sheet exits toward the end edge (bottom/right); it is anchored to the opposite
   * edge.
   */
  after: boolean;
  /** Marks the detent the sheet opens at, so `onEnter` can resolve its scroll position. */
  isInitial?: boolean;
}

// A snap marker anchored to the sheet's leading edge. Because it moves with the sheet, snapping it
// with a `scroll-margin` of `viewport - visibleAmount` rests the sheet with exactly `visibleAmount`
// of it on screen — the sheet's own size cancels out, so no measurement is needed. `after`
// directions (bottom/right) anchor to the start edge and align start; `before` directions to the end.
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

interface SheetProps extends ModalOverlayProps {
  swipeAnimation?: string;
  swipeAnimationRange?: {start?: number; end?: number};
  stackAnimation?: string;
  overscrollPadding?: boolean;
}

export function Sheet(props: SheetProps) {
  let ref = useRef(null);
  let {
    position = 'bottom',
    swipeDirection = position === 'center' ? 'vertical' : position,
    snapPoints,
    index,
    descendants
  } = useContext(SheetContext)!;
  let {axis, after} = getSwipeConfig(swipeDirection);

  let style: Record<string, string> = {
    // Positioned so the detent markers below anchor to the sheet's own box.
    position: 'relative'
  };

  if (props.overscrollPadding) {
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
    let append = (a: string | undefined, b: string) => (a ? `${a}, ${b}` : b);
    style.animationName = append(
      style.animationName,
      descendants.map(() => props.stackAnimation).join(', ')
    );
    // @ts-ignore
    style.animationTimeline = append(
      style.animationTimeline,
      descendants.map((_, i) => `--sheet-timeline-${index + 1 + i}`).join(', ')
    );
    style.animationDirection = append(
      style.animationDirection,
      descendants.map(d => `${d.direction}`).join(', ')
    );
    style.animationIterationCount = append(
      style.animationIterationCount,
      descendants.map(d => `${d.iterations}`).join(', ')
    );
    style.animationFillMode = append(
      style.animationFillMode,
      descendants.map(() => 'both').join(', ')
    );
    style.animationRange = append(
      style.animationRange,
      descendants.map(d => `${d.range}`).join(', ')
    );
    style.animationComposition = append(
      style.animationComposition,
      descendants.map(() => 'accumulate').join(', ')
    );
  }

  return (
    <Modal
      {...props}
      ref={ref}
      data-position={position}
      data-swipe-direction={swipeDirection}
      className={props.className || 'react-aria-Sheet'}
      style={renderProps => ({
        ...(typeof props.style === 'function' ? props.style(renderProps) : props.style),
        ...style
      })}>
      {renderProps => (
        <>
          {/* Detents that rest the sheet with a given amount visible. Anchored here (inside the
              sheet) so their snap position tracks the sheet's leading edge without measuring it. */}
          {snapPoints?.map((point, i) => (
            <DetentPoint key={i} point={point} axis={axis} after={after} isInitial={i === 0} />
          ))}
          {typeof props.children === 'function' ? props.children(renderProps) : props.children}
        </>
      )}
    </Modal>
  );
}

interface SheetUnderlayRenderProps {
  position?: 'bottom' | 'top' | 'left' | 'right' | 'center';
  swipeDirection: 'bottom' | 'top' | 'vertical' | 'left' | 'right' | 'horizontal';
  stackIndex: number;
}

interface SheetUnderlayProps
  extends RenderProps<SheetUnderlayRenderProps>, GlobalDOMAttributes<HTMLDivElement> {
  swipeAnimation?: string;
  swipeAnimationRange?: {start?: number; end?: number};
}

export function SheetUnderlay(props: SheetUnderlayProps) {
  let style = useSwipeAnimation(props);
  let {
    position = 'bottom',
    swipeDirection = position === 'center' ? 'vertical' : position,
    index
  } = useContext(SheetContext)!;
  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-SheetUnderlay',
    defaultStyle: {...style, position: 'fixed', inset: 0},
    values: {
      position,
      swipeDirection,
      stackIndex: index
    }
  });

  return (
    <div
      {...filterDOMProps(props, {global: true})}
      {...renderProps}
      data-position={position}
      data-swipe-direction={swipeDirection}
      data-stack-index={index}
    />
  );
}

function useSwipeAnimation(props) {
  let {
    position = 'bottom',
    swipeDirection = position === 'center' ? 'vertical' : position,
    snapPoints,
    index,
    isEntering,
    isExiting
  } = useContext(SheetContext)!;
  let {after, before, axis} = getSwipeConfig(swipeDirection);

  if (props.swipeAnimation) {
    let range = before && after ? 'cover' : before ? 'exit' : 'entry';
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
        animationDirection: before && after ? 'alternate' : before ? 'reverse' : 'normal',
        animationIterationCount: before && after ? '2' : '1',
        animationFillMode: 'both',
        animationRange: `${range} ${rangeStart} ${range} ${rangeEnd}`,
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

export function SheetContent(props: DialogProps) {
  let {
    position = 'bottom',
    swipeDirection = position === 'center' ? 'vertical' : position,
    index
  } = useContext(SheetContext)!;
  let {axis, before, after} = getSwipeConfig(swipeDirection);
  // The animation is driven by a view-progress timeline on the sheet itself, so its range is scaled
  // to the sheet's own size and position. The scroll container is 2 viewports along the swipe axis,
  // so crop the timeline's scrollport by one viewport down to the visible viewport. The off-screen
  // half is the one opposite `containerOffset`: the start half is visible unless the sheet rests at
  // scroll 0 (top/left), where the end half is visible. Use an explicit viewport length rather than
  // `50%`, since a percentage inset resolves against the block axis and would be wrong for the
  // horizontal (x) timeline.
  let viewportLength = axis === 'y' ? '100dvh' : '100vw';
  let viewInset = before && !after ? `${viewportLength} 0` : `0 ${viewportLength}`;

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
        // The inset (set on the overlay) crops the oversized scroll container's scrollport down to
        // the visible viewport so progress tracks the sheet's real on-screen travel. The name is
        // indexed by stack depth and hoisted to the document root (see `useSheetStack`) so a parent
        // sheet can bind its scale-back animation to this (its child's) timeline.
        // @ts-ignore
        viewTimelineName: `--sheet-timeline-${index}`,
        viewTimelineAxis: axis,
        viewTimelineInset: viewInset
      }}
    />
  );
}

function scrollAlongAxis(element: HTMLElement, axis: Axis, value: number, smooth = false) {
  let behavior: ScrollBehavior | undefined = smooth ? 'smooth' : undefined;
  element.scrollTo(axis === 'y' ? {top: value, behavior} : {left: value, behavior});
}
