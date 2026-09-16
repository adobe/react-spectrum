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
import {useEffectEvent} from './useEffectEvent';
import {useLayoutEffect} from './useLayoutEffect';

export function useEnterAnimation(
  ref: RefObject<HTMLElement | null>,
  isReady: boolean = true,
  onEnter?: (element: HTMLElement) => void | Promise<void>
): boolean {
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

  useAnimation(
    ref,
    isAnimationReady,
    onEnter,
    useCallback(() => setEntering(false), [])
  );
  return isAnimationReady;
}

export function useExitAnimation(
  ref: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onExit?: (element: HTMLElement) => void | Promise<void>
): boolean {
  let [exitState, setExitState] = useState<'closed' | 'open' | 'exiting'>(
    isOpen ? 'open' : 'closed'
  );

  switch (exitState) {
    case 'open':
      // If isOpen becomes false, set the state to exiting.
      if (!isOpen) {
        setExitState('exiting');
      }
      break;
    case 'closed':
    case 'exiting':
      // If we are exiting and isOpen becomes true, the animation was interrupted.
      // Reset the state to open.
      if (isOpen) {
        setExitState('open');
      }
      break;
  }

  let isExiting = exitState === 'exiting';
  useAnimation(
    ref,
    isExiting,
    onExit,
    useCallback(() => {
      // Set the state to closed, which will cause the element to be unmounted.
      setExitState(state => (state === 'exiting' ? 'closed' : state));
    }, [])
  );

  return isExiting;
}

function useAnimation(
  ref: RefObject<HTMLElement | null>,
  isActive: boolean,
  onStart: ((element: HTMLElement) => void | Promise<void>) | undefined,
  onEnd: () => void
): void {
  let isActiveRef = useRef<boolean | null>(null);
  let start = useEffectEvent(onStart);
  useLayoutEffect(() => {
    if (isActive && ref.current && isActiveRef.current !== isActive) {
      isActiveRef.current = isActive;
      if (!('getAnimations' in ref.current)) {
        // JSDOM
        onEnd();
        return;
      }

      let startPromise = start?.(ref.current);

      let animations = ref.current
        .getAnimations()
        .filter(a => a.timeline instanceof DocumentTimeline && a.playState === 'running');
      if (animations.length === 0 && !startPromise) {
        onEnd();
        return;
      }

      Promise.all([startPromise, ...animations.map(a => a.finished)])
        .then(() => {
          flushSync(() => {
            onEnd();
          });
        })
        .catch(() => {});
    }

    isActiveRef.current = isActive;
  }, [ref, isActive, onEnd]);
}
