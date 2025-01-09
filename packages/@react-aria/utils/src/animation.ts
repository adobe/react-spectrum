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
import {RefObject, useCallback, useState} from 'react';
import {useLayoutEffect} from './useLayoutEffect';

export function useEnterAnimation(ref: RefObject<HTMLElement | null>, isReady: boolean = true) {
  let [isEntering, setEntering] = useState(true);
  let isAnimationReady = isEntering && isReady;
  
  // There are two cases for entry animations:
  // 1. CSS @keyframes. The `animation` property is set during the isEntering state, and it is removed after the animation finishes.
  // 2. CSS transitions. The initial styles are applied during the isEntering state, and removed immediately, causing the transition to occur.
  //
  // In the second case, cancel any transitions that were triggered prior to the isEntering = false state (when the transition is supposed to start).
  // This can happen when isReady starts as false (e.g. popovers prior to placement calculation).
  useLayoutEffect(() => {
    if (isAnimationReady && ref.current && 'getAnimations' in ref.current) {
      for (let animation of ref.current.getAnimations()) {
        if (animation instanceof CSSTransition) {
          animation.cancel();
        }
      }
    }
  }, [ref, isAnimationReady]);

  useAnimation(ref, isAnimationReady, useCallback(() => setEntering(false), []));
  return isAnimationReady;
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
  useLayoutEffect(() => {
    if (isActive && ref.current) {
      if (!('getAnimations' in ref.current)) {
        // JSDOM
        onEnd();
        return;
      }
      
      let animations = ref.current.getAnimations();
      if (animations.length === 0) {
        onEnd();
        return;
      }

      let canceled = false;
      Promise.all(animations.map(a => a.finished)).then(() => {
        if (!canceled) {
          flushSync(() => {
            onEnd();
          });
        }
      }).catch(() => {});
      
      return () => {
        canceled = true;
      };
    }
  }, [ref, isActive, onEnd]);
}
