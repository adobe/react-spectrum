/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ariaHideOutside} from './ariaHideOutside';
import {AriaOverlayProps, useOverlay} from './useOverlay';
import {DOMAttributes, RefObject} from '@react-types/shared';
import {isElementVisible} from '../../utils/src/isElementVisible';
import {mergeProps} from '@react-aria/utils';
import {OverlayTriggerState} from '@react-stately/overlays';
import {useEffect} from 'react';
import {useOverlayFocusContain} from './Overlay';
import {usePreventScroll} from './usePreventScroll';

export interface AriaModalOverlayProps extends Pick<AriaOverlayProps, 'shouldCloseOnInteractOutside'> {
  /**
   * Whether to close the modal when the user interacts outside it.
   * @default false
   */
  isDismissable?: boolean,
  /**
   * Whether pressing the escape key to close the modal should be disabled.
   * @default false
   */
  isKeyboardDismissDisabled?: boolean
}

export interface ModalOverlayAria {
  /** Props for the modal element. */
  modalProps: DOMAttributes,
  /** Props for the underlay element. */
  underlayProps: DOMAttributes
}

/**
 * Provides the behavior and accessibility implementation for a modal component.
 * A modal is an overlay element which blocks interaction with elements outside it.
 */
export function useModalOverlay(props: AriaModalOverlayProps, state: OverlayTriggerState, ref: RefObject<HTMLElement | null>): ModalOverlayAria {
  let {overlayProps, underlayProps} = useOverlay({
    ...props,
    isOpen: state.isOpen,
    onClose: state.close
  }, ref);

  usePreventScroll({
    isDisabled: !state.isOpen
  });

  useOverlayFocusContain();

  useEffect(() => {
    if (state.isOpen && ref.current) {
      return hideElementsBehind(ref.current);
    }
  }, [state.isOpen, ref]);

  return {
    modalProps: mergeProps(overlayProps),
    underlayProps
  };
}

function hideElementsBehind(element: Element, root = document.body) {
  // TODO: automatically determine root based on parent stacking context of element?
  let roots = getStackingContextRoots(root);
  let rootStackingContext = roots.find(r => r.contains(element)) || document.documentElement;
  let elementZIndex = getZIndex(rootStackingContext);

  return ariaHideOutside([element], {
    shouldUseInert: true,
    getVisibleNodes: el => {
      let node: Element | null = el;
      let ancestors: Element[] = [];
      while (node && node !== root) {
        ancestors.unshift(node);
        node = node.parentElement;
      }
      
      // If an ancestor element of the added target is a stacking context root,
      // use that to determine if the element should be preserved.
      let stackingContext = ancestors.find(el => isStackingContext(el));
      if (stackingContext) {
        if (shouldPreserve(element, elementZIndex, stackingContext)) {
          return [el];
        }
        return [];
      } else {
        // Otherwise, find stacking context roots within the added element, and compare with the modal element.
        let roots = getStackingContextRoots(el);
        let preservedElements: Element[] = [];
        for (let root of roots) {
          if (shouldPreserve(element, elementZIndex, root)) {
            preservedElements.push(root);
          }
        }
        return preservedElements;
      }
    }
  });
}

function shouldPreserve(baseElement: Element, baseZIndex: number, element: Element) {
  if (baseElement.contains(element)) {
    return true;
  }

  let zIndex = getZIndex(element);
  if (zIndex === baseZIndex) {
    // If two elements have the same z-index, compare their document order.
    if (baseElement.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) {
      return true;
    }
  } else if (zIndex > baseZIndex) {
    return true;
  }

  return false;
}

function isStackingContext(el: Element) {
  let style = getComputedStyle(el);

  // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context#features_creating_stacking_contexts
  return (
    el === document.documentElement ||
    (style.position !== 'static' && style.zIndex !== 'auto') ||
    ('containerType' in style && style.containerType.includes('size')) ||
    (style.zIndex !== 'auto' && isFlexOrGridItem(el)) ||
    parseFloat(style.opacity) < 1 ||
    ('mixBlendMode' in style && style.mixBlendMode !== 'normal') ||
    ('transform' in style && style.transform !== 'none') ||
    ('webkitTransform' in style && style.webkitTransform !== 'none') ||
    ('scale' in style && style.scale !== 'none') ||
    ('rotate' in style && style.rotate !== 'none') ||
    ('translate' in style && style.translate !== 'none') ||
    ('filter' in style && style.filter !== 'none') ||
    ('webkitFilter' in style && style.webkitFilter !== 'none') ||
    ('backdropFilter' in style && style.backdropFilter !== 'none') ||
    ('perspective' in style && style.perspective !== 'none') ||
    ('clipPath' in style && style.clipPath !== 'none') ||
    ('mask' in style && style.mask !== 'none') ||
    ('maskImage' in style && style.maskImage !== 'none') ||
    ('maskBorder' in style && style.maskBorder !== 'none') ||
    style.isolation === 'isolate' ||
    /position|z-index|opacity|mix-blend-mode|transform|webkit-transform|scale|rotate|translate|filter|webkit-filter|backdrop-filter|perspective|clip-path|mask|mask-image|mask-border|isolation/.test(style.willChange) ||
    /layout|paint|strict|content/.test(style.contain)
  );
}

function getStackingContextRoots(root: Element = document.body) {
  let roots: Element[] = [];

  function walk(el: Element) {
    if (!isElementVisible(el)) {
      return;
    }

    if (isStackingContext(el)) {
      roots.push(el);
    } else {
      for (const child of el.children) {
        walk(child);
      }
    }
  }

  walk(root);
  return roots;
}

function getZIndex(element: Element) {
  return Number(getComputedStyle(element).zIndex) || 0;
}

function isFlexOrGridItem(element: Element) {
  let parent = element.parentElement;
  return parent && /flex|grid/.test(getComputedStyle(parent).display);
}
