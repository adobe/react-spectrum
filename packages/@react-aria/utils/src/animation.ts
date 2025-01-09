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

import {flushSync} from 'react-dom';
import {RefObject, useCallback, useRef, useState} from 'react';
import {useLayoutEffect} from './useLayoutEffect';

export function useEnterAnimation(ref: RefObject<HTMLElement | null>, isReady: boolean = true) {
  let [isEntering, setEntering] = useState(true);
  useAnimation(ref, isEntering && isReady, useCallback(() => setEntering(false), []));
  return isEntering && isReady;
}

export function useExitAnimation(ref: RefObject<HTMLElement | null>, isOpen: boolean) {
  // State to trigger a re-render after animation is complete, which causes the element to be removed from the DOM.
  // Ref to track the state we're in, so we don't immediately reset isExiting to true after the animation.
  let [isExiting, setExiting] = useState(false);
  let [exitState, setExitState] = useState('idle');

  // If isOpen becomes false, set isExiting to true.
  if (!isOpen && ref.current && exitState === 'idle') {
    isExiting = true;
    setExiting(true);
    setExitState('exiting');
  }

  // If we exited, and the element has been removed, reset exit state to idle.
  if (!ref.current && exitState === 'exited') {
    setExitState('idle');
  }

  useAnimation(
    ref,
    isExiting,
    useCallback(() => {
      setExitState('exited');
      setExiting(false);
    }, [])
  );

  return isExiting;
}

function useAnimation(ref: RefObject<HTMLElement | null>, isActive: boolean, onEnd: () => void) {
  let prevAnimation = useRef<string | null>(null);
  if (isActive && ref.current) {
    // This is ok because we only read it in the layout effect below, immediately after the commit phase.
    // We could move this to another effect that runs every render, but this would be unnecessarily slow.
    // We only need the computed style right before the animation becomes active.
    // eslint-disable-next-line rulesdir/pure-render
    prevAnimation.current = window.getComputedStyle(ref.current).animation;
  }

  useLayoutEffect(() => {
    if (isActive && ref.current) {
      // Make sure there's actually an animation, and it wasn't there before we triggered the update.
      let computedStyle = window.getComputedStyle(ref.current);
      if (computedStyle.animationName && computedStyle.animationName !== 'none' && computedStyle.animation !== prevAnimation.current) {
        let onAnimationEnd = (e: AnimationEvent) => {
          if (e.target === ref.current) {
            element.removeEventListener('animationend', onAnimationEnd);
            flushSync(() => {onEnd();});
          }
        };

        let element = ref.current;
        element.addEventListener('animationend', onAnimationEnd);
        return () => {
          element.removeEventListener('animationend', onAnimationEnd);
        };
      } else {
        onEnd();
      }
    }
  }, [ref, isActive, onEnd]);
}
