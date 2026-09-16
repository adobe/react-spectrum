import {flushSync} from 'react-dom';
import {Modal, ModalOverlay, ModalOverlayProps} from './Modal';
import {OverlayTriggerStateContext} from './Dialog';
import React, {createContext, ReactNode, useCallback, useContext, useRef} from 'react';
import {useEffectEvent} from 'react-aria/private/utils/useEffectEvent';

interface SheetProps extends ModalOverlayProps {
  children: ReactNode;
  position?: 'bottom' | 'top' | 'left' | 'right' | 'center';
  swipeDirection: 'bottom' | 'top' | 'vertical' | 'left' | 'right' | 'horizontal';
}

const SheetContext = createContext<SheetProps | null>(null);

export function Sheet(props: SheetProps) {
  let {
    children,
    isDismissable = true,
    position = 'bottom',
    swipeDirection = position === 'center' ? 'vertical' : position
  } = props;
  let contextState = useContext(OverlayTriggerStateContext);
  let onClose = useEffectEvent(() => {
    contextState!.close();
  });

  let ref = useCallback(
    (element: HTMLDivElement) => {
      if (!element) {
        return;
      }

      // Only dismiss once the sheet has actually been entered. Directions that rest at scroll 0
      // (top/left) animate in by first jumping to the exit position, which can surface a scrollend
      // there before the enter animation runs — without this guard that would close immediately.
      let hasEntered = false;
      let onScrollEnd = () => {
        if (!isExited(swipeDirection, element)) {
          hasEntered = true;
          return;
        }

        if (hasEntered) {
          flushSync(() => onClose());
        }
      };

      return addScrollEndListener(element, onScrollEnd);
    },
    [onClose, swipeDirection]
  );

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
  let alignment = getPositionAlignment(position);
  // The stage's main axis is the swipe axis (justify-content); the cross axis uses align-items.
  let justifyContent = axis === 'y' ? alignment.y : alignment.x;
  let alignItems = axis === 'y' ? alignment.x : alignment.y;

  return (
    <ModalOverlay
      ref={ref}
      isDismissable={isDismissable}
      data-swipe-direction={swipeDirection}
      className={props.className}
      style={{
        position: 'absolute',
        top: axis === 'y' ? `${containerOffset}dvh` : 0,
        left: axis === 'x' ? `${containerOffset}vw` : 0,
        // The container is 2 viewports along the swipe axis and 1 viewport on the cross axis.
        height: axis === 'y' ? '200dvh' : '100dvh',
        width: axis === 'x' ? '200vw' : '100vw',
        overflow: 'auto',
        scrollSnapType: `${axis} mandatory`,
        overscrollBehaviorY: axis === 'y' ? 'contain' : 'none',
        overscrollBehaviorX: axis === 'x' ? 'contain' : 'none',
        scrollbarWidth: 'none',
        // Hoist the sheet's view-timeline name into scope so the backdrop and overlay (which are not
        // descendants of the sheet element that defines it) can reference it too.
        // @ts-ignore
        timelineScope: '--sheet-animation-timeline',
        '--sheet-animation-range': viewRange,
        '--sheet-animation-direction': viewDirection,
        '--sheet-animation-iterations': viewIterations,
        '--sheet-scroll-padding-y': 'calc(100dvh - var(--visual-viewport-height))'
      }}
      onEnter={element => {
        let vp = axis === 'y' ? window.innerHeight : window.innerWidth;
        if (enteredScroll === 0) {
          // The rest position is at scroll 0, so the sheet mounts already entered. Jump to the exit
          // first, then animate back in on the next frame — doing both in the same task can leave
          // the browser stuck at the jumped-to position instead of running the smooth scroll.
          scrollAlongAxis(element, axis, (maxScroll / 100) * vp);
          requestAnimationFrame(() => scrollAlongAxis(element, axis, 0, true));
        } else {
          scrollAlongAxis(element, axis, (enteredScroll / 100) * vp, true);
        }
      }}
      onExit={element => {
        if (isExited(swipeDirection, element)) {
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
          addScrollEndListener(element, () => resolve(), {once: true});
        });
      }}>
      {/* Snap marker for the exit at scroll 0 (also the rest position for top/left). */}
      <SnapPoint point={0} align="start" axis={axis} />
      {/* When the sheet can exit both ways, add a center snap for the rest position. */}
      {before && after && <SnapPoint point={100} align="start" axis={axis} />}
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
        <SheetContext.Provider value={props}>{children}</SheetContext.Provider>
      </div>
      {/* Snap marker for the exit at the far end of the scroll content. */}
      <SnapPoint point={length - 100} align="end" axis={axis} />
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
function getSwipeConfig(swipeDirection: SheetProps['swipeDirection']): SwipeConfig {
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
function getPositionAlignment(position: NonNullable<SheetProps['position']>): {
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
  /** Offset along the swipe axis, in viewport percent. */
  point: number;
  align: 'start' | 'end';
  axis: Axis;
}

function SnapPoint({point, align, axis}: SnapPointProps) {
  let mainUnit = axis === 'y' ? 'dvh' : 'vw';
  return (
    <div
      style={{
        position: 'absolute',
        top: axis === 'y' ? `${point}${mainUnit}` : 0,
        left: axis === 'x' ? `${point}${mainUnit}` : 0,
        scrollSnapType: 'always',
        scrollSnapAlign: align,
        // A full viewport along the swipe axis so its start/end edge lands at the snap position.
        width: axis === 'x' ? `100${mainUnit}` : 1,
        height: axis === 'y' ? `100${mainUnit}` : 1
      }}
    />
  );
}

export function SheetUnderlay({...otherProps}) {
  return <div {...otherProps} />;
}

interface SheetContentProps extends ModalOverlayProps {}

export function SheetContent(props: SheetContentProps) {
  let ref = useRef(null);
  let {position = 'bottom', swipeDirection = position === 'center' ? 'vertical' : position} =
    useContext(SheetContext)!;

  let {axis, before, after} = getSwipeConfig(swipeDirection);
  // The animation is driven by a view-progress timeline on the sheet itself, so its range is scaled
  // to the sheet's own size and position. The scroll container is 2 viewports along the swipe axis,
  // so crop the timeline's scrollport with an inset to the visible half (the real viewport). The
  // off-screen half is the one opposite `containerOffset`: the start half is visible unless the
  // sheet rests at scroll 0 (top/left), where the end half is visible.
  let viewInset = before && !after ? '50% 0' : '0 50%';

  // Extra padding to allow overscrolling, and a negative margin to offset it.
  let padding, margin;
  switch (position) {
    case 'top':
      padding = '100vh 0 0 0';
      margin = '-100vh 0 0 0';
      break;
    case 'bottom':
      padding = '0 0 100vh 0';
      margin = '0 0 -100vh 0';
      break;
    case 'left':
      padding = '0 0 0 100vw';
      margin = '0 0 0 -100vw';
      break;
    case 'right':
      padding = '0 100vw 0 0';
      margin = '0 -100vw 0 0';
      break;
    case 'center':
    default:
      padding = '0';
      margin = '0';
  }

  return (
    <Modal
      {...props}
      ref={ref}
      data-swipe-direction={swipeDirection}
      style={{
        ...props.style,
        // The sheet is the subject of the view-progress timeline that drives all sheet animations.
        // The inset (set on the overlay) crops the oversized scroll container's scrollport down to
        // the visible viewport so progress tracks the sheet's real on-screen travel.
        // @ts-ignore
        viewTimelineName: '--sheet-animation-timeline',
        viewTimelineAxis: axis,
        viewTimelineInset: viewInset,
        // @ts-ignore
        '--sheet-overscroll-padding': padding,
        '--sheet-overscroll-margin': margin
      }}
    />
  );
}

function scrollAlongAxis(element: HTMLElement, axis: Axis, value: number, smooth = false) {
  let behavior: ScrollBehavior | undefined = smooth ? 'smooth' : undefined;
  element.scrollTo(axis === 'y' ? {top: value, behavior} : {left: value, behavior});
}

function addScrollEndListener(element: Element, cb: () => void, options?: {once?: boolean}) {
  if (!('onscrollend' in window)) {
    let timeout;
    let onScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        cb();
        if (options?.once) {
          element.removeEventListener('scroll', onScroll);
        }
      }, 300);
    };

    element.addEventListener('scroll', onScroll);
    return () => {
      element.removeEventListener('scroll', onScroll);
    };
  }

  element.addEventListener('scrollend', cb, options);
  return () => element.removeEventListener('scrollend', cb);
}

function isExited(swipeDirection: SheetProps['swipeDirection'], element: HTMLElement) {
  let {axis, before, after, maxScroll} = getSwipeConfig(swipeDirection);
  let vp = axis === 'y' ? window.innerHeight : window.innerWidth;
  let maxScrollPx = (maxScroll / 100) * vp;
  let current = axis === 'y' ? element.scrollTop : element.scrollLeft;
  // The sheet is dismissed once it reaches an exitable extreme: scroll 0 (bottom/right) or
  // maxScroll (top/left). Dual directions can exit at either end.
  return (after && current <= 0) || (before && current >= maxScrollPx);
}
