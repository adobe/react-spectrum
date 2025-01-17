/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {calculatePosition, PositionResult} from './calculatePosition';
import {DOMAttributes, RefObject} from '@react-types/shared';
import {Placement, PlacementAxis, PositionProps} from '@react-types/overlays';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useCloseOnScroll} from './useCloseOnScroll';
import {useLayoutEffect, useResizeObserver} from '@react-aria/utils';
import {useLocale} from '@react-aria/i18n';

export interface AriaPositionProps extends PositionProps {
  /**
   * Cross size of the overlay arrow in pixels.
   * @default 0
   */
  arrowSize?: number,
  /**
   * Element that that serves as the positioning boundary.
   * @default document.body
   */
  boundaryElement?: Element,
  /**
   * The ref for the element which the overlay positions itself with respect to.
   */
  targetRef: RefObject<Element | null>,
  /**
   * The ref for the overlay element.
   */
  overlayRef: RefObject<Element | null>,
  /**
   * A ref for the scrollable region within the overlay.
   * @default overlayRef
   */
  scrollRef?: RefObject<Element | null>,
  /**
   * Whether the overlay should update its position automatically.
   * @default true
   */
  shouldUpdatePosition?: boolean,
  /** Handler that is called when the overlay should close. */
  onClose?: (() => void) | null,
  /**
   * The maxHeight specified for the overlay element.
   * By default, it will take all space up to the current viewport height.
   */
  maxHeight?: number,
  /**
   * The minimum distance the arrow's edge should be from the edge of the overlay element.
   * @default 0
   */
  arrowBoundaryOffset?: number
}

export interface PositionAria {
  /** Props for the overlay container element. */
  overlayProps: DOMAttributes,
  /** Props for the overlay tip arrow if any. */
  arrowProps: DOMAttributes,
  /** Placement of the overlay with respect to the overlay trigger. */
  placement: PlacementAxis | null,
  /** Updates the position of the overlay. */
  updatePosition(): void
}

interface ScrollAnchor {
  type: 'top' | 'bottom',
  offset: number
}

let visualViewport = typeof document !== 'undefined' ? window.visualViewport : null;

/**
 * Handles positioning overlays like popovers and menus relative to a trigger
 * element, and updating the position when the window resizes.
 */
export function useOverlayPosition(props: AriaPositionProps): PositionAria {
  let {direction} = useLocale();
  let {
    arrowSize = 0,
    targetRef,
    overlayRef,
    scrollRef = overlayRef,
    placement = 'bottom' as Placement,
    containerPadding = 12,
    shouldFlip = true,
    boundaryElement = typeof document !== 'undefined' ? document.body : null,
    offset = 0,
    crossOffset = 0,
    shouldUpdatePosition = true,
    isOpen = true,
    onClose,
    maxHeight,
    arrowBoundaryOffset = 0
  } = props;
  let [position, setPosition] = useState<PositionResult | null>(null);

  let deps = [
    shouldUpdatePosition,
    placement,
    overlayRef.current,
    targetRef.current,
    scrollRef.current,
    containerPadding,
    shouldFlip,
    boundaryElement,
    offset,
    crossOffset,
    isOpen,
    direction,
    maxHeight,
    arrowBoundaryOffset,
    arrowSize
  ];

  // Note, the position freezing breaks if body sizes itself dynamicly with the visual viewport but that might
  // just be a non-realistic use case
  // Upon opening a overlay, record the current visual viewport scale so we can freeze the overlay styles
  let lastScale = useRef(visualViewport?.scale);
  useEffect(() => {
    if (isOpen) {
      lastScale.current = visualViewport?.scale;
    }
  }, [isOpen]);

  let updatePosition = useCallback(() => {
    if (shouldUpdatePosition === false || !isOpen || !overlayRef.current || !targetRef.current || !boundaryElement) {
      return;
    }

    if (visualViewport?.scale !== lastScale.current) {
      return;
    }

    // Determine a scroll anchor based on the focused element.
    // This stores the offset of the anchor element from the scroll container
    // so it can be restored after repositioning. This way if the overlay height
    // changes, the focused element appears to stay in the same position.
    let anchor: ScrollAnchor | null = null;
    if (scrollRef.current && scrollRef.current.contains(document.activeElement)) {
      let anchorRect = document.activeElement?.getBoundingClientRect();
      let scrollRect = scrollRef.current.getBoundingClientRect();
      // Anchor from the top if the offset is in the top half of the scrollable element,
      // otherwise anchor from the bottom.
      anchor = {
        type: 'top',
        offset: (anchorRect?.top ?? 0) - scrollRect.top
      };
      if (anchor.offset > scrollRect.height / 2) {
        anchor.type = 'bottom';
        anchor.offset = (anchorRect?.bottom ?? 0) - scrollRect.bottom;
      }
    }

    // Always reset the overlay's previous max height if not defined by the user so that we can compensate for
    // RAC collections populating after a second render and properly set a correct max height + positioning when it populates.
    let overlay = (overlayRef.current as HTMLElement);
    if (!maxHeight && overlayRef.current) {
      overlay.style.top = '0px';
      overlay.style.bottom = '';
      overlay.style.maxHeight = (window.visualViewport?.height ?? window.innerHeight) + 'px';
    }

    let position = calculatePosition({
      placement: translateRTL(placement, direction),
      overlayNode: overlayRef.current,
      targetNode: targetRef.current,
      scrollNode: scrollRef.current || overlayRef.current,
      padding: containerPadding,
      shouldFlip,
      boundaryElement,
      offset,
      crossOffset,
      maxHeight,
      arrowSize,
      arrowBoundaryOffset
    });

    if (!position.position) {
      return;
    }

    // Modify overlay styles directly so positioning happens immediately without the need of a second render
    // This is so we don't have to delay autoFocus scrolling or delay applying preventScroll for popovers
    overlay.style.top = '';
    overlay.style.bottom = '';
    overlay.style.left = '';
    overlay.style.right = '';

    Object.keys(position.position).forEach(key => overlay.style[key] = (position.position!)[key] + 'px');
    overlay.style.maxHeight = position.maxHeight != null ?  position.maxHeight + 'px' : '';

    // Restore scroll position relative to anchor element.
    if (anchor && document.activeElement && scrollRef.current) {
      let anchorRect = document.activeElement.getBoundingClientRect();
      let scrollRect = scrollRef.current.getBoundingClientRect();
      let newOffset = anchorRect[anchor.type] - scrollRect[anchor.type];
      scrollRef.current.scrollTop += newOffset - anchor.offset;
    }

    // Trigger a set state for a second render anyway for arrow positioning
    setPosition(position);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Update position when anything changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(updatePosition, deps);

  // Update position on window resize
  useResize(updatePosition);

  // Update position when the overlay changes size (might need to flip).
  useResizeObserver({
    ref: overlayRef,
    onResize: updatePosition
  });

  // Update position when the target changes size (might need to flip).
  useResizeObserver({
    ref: targetRef,
    onResize: updatePosition
  });

  // Reposition the overlay and do not close on scroll while the visual viewport is resizing.
  // This will ensure that overlays adjust their positioning when the iOS virtual keyboard appears.
  let isResizing = useRef(false);
  useLayoutEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let onResize = () => {
      isResizing.current = true;
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        isResizing.current = false;
      }, 500);

      updatePosition();
    };

    // Only reposition the overlay if a scroll event happens immediately as a result of resize (aka the virtual keyboard has appears)
    // We don't want to reposition the overlay if the user has pinch zoomed in and is scrolling the viewport around.
    let onScroll = () => {
      if (isResizing.current) {
        onResize();
      }
    };

    visualViewport?.addEventListener('resize', onResize);
    visualViewport?.addEventListener('scroll', onScroll);
    return () => {
      visualViewport?.removeEventListener('resize', onResize);
      visualViewport?.removeEventListener('scroll', onScroll);
    };
  }, [updatePosition]);

  let close = useCallback(() => {
    if (!isResizing.current) {
      onClose?.();
    }
  }, [onClose, isResizing]);

  // When scrolling a parent scrollable region of the trigger (other than the body),
  // we hide the popover. Otherwise, its position would be incorrect.
  useCloseOnScroll({
    triggerRef: targetRef,
    isOpen,
    onClose: onClose && close
  });

  return {
    overlayProps: {
      style: {
        position: 'absolute',
        zIndex: 100000, // should match the z-index in ModalTrigger
        ...position?.position,
        maxHeight: position?.maxHeight ?? '100vh'
      }
    },
    placement: position?.placement ?? null,
    arrowProps: {
      'aria-hidden': 'true',
      role: 'presentation',
      style: {
        left: position?.arrowOffsetLeft,
        top: position?.arrowOffsetTop
      }
    },
    updatePosition
  };
}

function useResize(onResize) {
  useLayoutEffect(() => {
    window.addEventListener('resize', onResize, false);
    return () => {
      window.removeEventListener('resize', onResize, false);
    };
  }, [onResize]);
}

function translateRTL(position, direction) {
  if (direction === 'rtl') {
    return position.replace('start', 'right').replace('end', 'left');
  }
  return position.replace('start', 'left').replace('end', 'right');
}
