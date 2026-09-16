import {flushSync} from 'react-dom';
import {Modal, ModalOverlay, ModalOverlayProps} from './Modal';
import {OverlayTriggerStateContext} from './Dialog';
import React, {
  createContext,
  CSSProperties,
  ReactNode,
  useCallback,
  useContext,
  useRef
} from 'react';
import {useEffectEvent} from 'react-aria/private/utils/useEffectEvent';

interface SheetProps extends ModalOverlayProps {
  children: ReactNode;
  position?: 'bottom' | 'top' | 'left' | 'right' | 'center';
  swipeDirection: 'bottom' | 'top' | 'vertical' | 'left' | 'right' | 'horizontal';
  scrollAnimation?: string;
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

      let onScrollEnd = () => {
        if (isExited(swipeDirection, element)) {
          flushSync(() => onClose());
        }
      };

      return addScrollEndListener(element, onScrollEnd);
    },
    [onClose, swipeDirection]
  );

  let direction =
    swipeDirection === 'top' || swipeDirection === 'bottom' || swipeDirection === 'vertical'
      ? 'y'
      : 'x';
  let animation = useScrollAnimation(props.scrollAnimation);

  return (
    <ModalOverlay
      ref={ref}
      isDismissable={isDismissable}
      data-sheet
      className={props.className}
      style={{
        ...animation,
        position: 'absolute',
        top: swipeDirection === 'top' || swipeDirection === 'vertical' ? '-100dvh' : 0,
        left: swipeDirection === 'left' || swipeDirection === 'horizontal' ? '-100vw' : 0,
        height: direction === 'y' ? '200dvh' : '100dvh',
        width: direction === 'x' ? '200vw' : '100vw',
        overflow: 'auto',
        scrollSnapType: `${direction} mandatory`,
        overscrollBehaviorY: direction === 'y' ? 'contain' : 'none',
        overscrollBehaviorX: direction === 'x' ? 'contain' : 'none',
        scrollbarWidth: 'none',
        // @ts-ignore
        scrollTimelineName: '--sheet-animation-timeline',
        scrollTimelineAxis: direction,
        '--sheet-animation-range': direction === 'x' ? '0vw 200vw' : '0vh 200dvh',
        '--sheet-animation-direction':
          swipeDirection === 'left' || swipeDirection === 'top' ? 'reverse' : 'forward'
      }}
      onEnter={element => {
        if (swipeDirection === 'bottom' || swipeDirection === 'vertical') {
          element.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          });
        } else if (swipeDirection === 'top') {
          element.scrollTo({top: window.innerHeight});
          element.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        } else if (swipeDirection === 'right' || swipeDirection === 'horizontal') {
          element.scrollTo({
            left: window.innerWidth,
            behavior: 'smooth'
          });
        } else if (swipeDirection === 'left') {
          element.scrollTo({left: window.innerWidth});
          element.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        }
      }}
      onExit={element => {
        if (isExited(swipeDirection, element)) {
          return;
        }

        if (swipeDirection === 'bottom' || swipeDirection === 'vertical') {
          element.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        } else if (swipeDirection === 'top') {
          element.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          });
        } else if (swipeDirection === 'right' || swipeDirection === 'horizontal') {
          element.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else if (swipeDirection === 'left') {
          element.scrollTo({
            left: window.innerWidth,
            behavior: 'smooth'
          });
        }

        return new Promise<void>(resolve => {
          addScrollEndListener(element, () => resolve(), {once: true});
        });
      }}>
      <SnapPoint
        point={0}
        align={swipeDirection === 'bottom' || swipeDirection === 'right' ? 'start' : 'end'}
        direction={direction}
      />
      <div
        style={{
          position: 'absolute',
          top: direction === 'y' ? '100dvh' : 0,
          left: direction === 'x' ? '100vw' : 0,
          height: '100dvh',
          width: '100vw',
          display: 'flex',
          flexDirection: direction === 'y' ? 'column' : 'row',
          alignItems: 'center',
          justifyContent:
            position === 'center'
              ? 'center'
              : position === 'bottom' || position === 'right'
                ? 'end'
                : 'start'
        }}>
        <SheetContext.Provider value={props}>{children}</SheetContext.Provider>
      </div>
      <SnapPoint
        point={200}
        align={swipeDirection === 'bottom' || swipeDirection === 'right' ? 'end' : 'start'}
        direction={direction}
      />
    </ModalOverlay>
  );
}

function SnapPoint({point, align, direction}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: direction === 'y' ? point + 'dvh' : 0,
        left: direction === 'x' ? point + 'vw' : 0,
        scrollSnapType: 'always',
        scrollSnapAlign: align,
        width: direction === 'x' ? '100vw' : 1,
        height: direction === 'y' ? '100dvh' : 1
      }}
    />
  );
}

export function SheetUnderlay({scrollAnimation, ...otherProps}) {
  let animation = useScrollAnimation(scrollAnimation);
  return <div {...otherProps} style={animation} />;
}

const supportsScrollAnimation =
  typeof CSS !== 'undefined' && CSS.supports('(animation-timeline: scroll())');

interface SheetContentProps extends ModalOverlayProps {
  scrollAnimation?: string;
}

export function SheetContent(props: SheetContentProps) {
  let ref = useRef(null);
  let {scrollAnimation} = props;
  let {position = 'bottom'} = useContext(SheetContext)!;
  let prop = position[0].toUpperCase() + position.slice(1);
  let value = position === 'top' || position === 'bottom' ? '100vh' : '100vw';
  // let value = `calc(100lvh - 100svh + 58px)`;

  let animation = useScrollAnimation(scrollAnimation);

  return (
    <Modal
      {...props}
      ref={ref}
      style={{
        ...props.style,
        ...animation,
        // maxHeight: '100%',
        // ['margin' + prop]: `calc(-1 * ${value})`,
        // ['padding' + prop]: value,
        // height: `calc(50% + ${value})`,
        '--sheet-padding': value
      }}
    />
  );
}

function useScrollAnimation(scrollAnimation: string | null | undefined): CSSProperties {
  let animation: CSSProperties = {};
  if (scrollAnimation) {
    if (supportsScrollAnimation) {
      animation = {
        animationName: scrollAnimation,
        // @ts-ignore
        animationTimeline: '--sheet-animation-timeline',
        animationDirection: 'var(--sheet-animation-direction)',
        animationRange: 'var(--sheet-animation-range)',
        animationFillMode: 'both'
      };
    } else {
      animation = {};
    }
  }

  return animation;
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

function isExited(position: string, element: HTMLElement) {
  return (
    ((position === 'bottom' || position === 'vertical') && element.scrollTop <= 0) ||
    ((position === 'top' || position === 'vertical') && element.scrollTop >= window.innerHeight) ||
    ((position === 'right' || position === 'horizontal') && element.scrollLeft <= 0) ||
    ((position === 'left' || position === 'horizontal') && element.scrollLeft >= window.innerWidth)
  );
}
