/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {flushSync} from 'react-dom';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes, ReactNode, RefObject, useContext, useRef, useState} from 'react';
import {RenderProps, useRenderProps} from './utils';
import {useLayoutEffect} from '@react-aria/utils';
import {useObjectRef} from 'react-aria';

interface Snapshot {
  rect: DOMRect,
  style: [string, string][]
}

const SharedElementContext = createContext<RefObject<{[name: string]: Snapshot}> | null>(null);

export interface SharedElementTransitionProps {
  children: ReactNode
}

/**
 * A scope for SharedElements, which animate between parents.
 */
export function SharedElementTransition(props: SharedElementTransitionProps) {
  let ref = useRef({});
  return (
    <SharedElementContext.Provider value={ref}>
      {props.children}
    </SharedElementContext.Provider>
  );
}

export interface SharedElementRenderProps {
  /**
   * Whether the element is currently entering.
   * @selector [data-entering]
   */
  isEntering: boolean,
  /**
   * Whether the element is currently exiting.
   * @selector [data-exiting]
   */
  isExiting: boolean
}

export interface SharedElementPropsBase extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style'>, RenderProps<SharedElementRenderProps> {}

export interface SharedElementProps extends SharedElementPropsBase {
  name: string,
  isVisible?: boolean
}

/**
 * An element that animates between its old and new position when moving between parents.
 */
export const SharedElement = forwardRef(function SharedElement(props: SharedElementProps, ref: ForwardedRef<HTMLDivElement>) {
  let {name, isVisible = true, children, className, style, ...divProps} = props;
  let [state, setState] = useState(isVisible ? 'visible' : 'hidden');
  let scopeRef = useContext(SharedElementContext);
  if (!scopeRef) {
    throw new Error('<SharedElement> must be rendered inside a <SharedElementTransition>');
  }

  if (isVisible && state === 'hidden') {
    setState('visible');
  }

  ref = useObjectRef(ref);
  useLayoutEffect(() => {
    let element = ref.current;
    let scope = scopeRef.current;
    let prevSnapshot = scope[name];
    let frame: number | null = null;

    if (element && isVisible && prevSnapshot) {
      // Element is transitioning from a previous instance.
      setState('visible');
      let animations = element.getAnimations();

      // Set properties to animate from.
      let values = prevSnapshot.style.map(([property, prevValue]) => {
        let value = element.style[property];
        if (property === 'translate') {
          let prevRect = prevSnapshot.rect;
          let currentItem = element.getBoundingClientRect();
          let deltaX = prevRect.left - currentItem?.left;
          let deltaY = prevRect.top - currentItem?.top;
          element.style.translate = `${deltaX}px ${deltaY}px`;
        } else {
          element.style[property] = prevValue;
        }
        return [property, value];
      });

      // Cancel any new animations triggered by these properties.
      for (let a of element.getAnimations()) {
        if (!animations.includes(a)) {
          a.cancel();
        }
      }

      // Remove overrides after one frame to animate to the current values.
      frame = requestAnimationFrame(() => {
        frame = null;
        for (let [property, value] of values) {
          element.style[property] = value;
        }
      });

      delete scope[name];
    } else if (element && isVisible && !prevSnapshot) {
      // No previous instance exists, apply the entering state.
      queueMicrotask(() => flushSync(() => setState('entering')));
      frame = requestAnimationFrame(() => {
        frame = null;
        setState('visible');
      });
    } else if (element && !isVisible) {
      // Wait until layout effects finish, and check if a snapshot still exists.
      // If so, no new SharedElement consumed it, so enter the exiting state.
      queueMicrotask(() => {
        if (scope[name]) {
          delete scope[name];
          flushSync(() => setState('exiting'));
          Promise.all(element.getAnimations().map(a => a.finished))
            .then(() => setState('hidden'))
            .catch(() => {});
        } else {
          // Snapshot was consumed by another instance, unmount.
          setState('hidden');
        }
      });
    }

    return () => {
      if (frame != null) {
        cancelAnimationFrame(frame);
      }

      if (element && element.isConnected && !element.hasAttribute('data-exiting')) {
        // On unmount, store a snapshot of the rectangle and computed style for transitioning properties.
        let style = window.getComputedStyle(element);
        if (style.transitionProperty !== 'none') {
          let transitionProperty = style.transitionProperty.split(/\s*,\s*/);
          scope[name] = {
            rect: element.getBoundingClientRect(),
            style: transitionProperty.map(p => [p, style[p]])
          };
        }
      }
    };
  }, [ref, scopeRef, name, isVisible]);

  let renderProps = useRenderProps({
    children,
    className,
    style,
    values: {
      isEntering: state === 'entering',
      isExiting: state === 'exiting'
    }
  });

  if (state === 'hidden') {
    return null;
  }

  return (
    <div
      {...divProps}
      {...renderProps}
      ref={ref}
      data-entering={state === 'entering' || undefined}
      data-exiting={state === 'exiting' || undefined} />
  );
});
