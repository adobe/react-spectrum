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

import {disableTextSelection, restoreTextSelection} from './textSelection';
import {DOMAttributes, MoveEvents, PointerType} from '@react-types/shared';
import {getEventTarget} from '../utils/shadowdom/DOMFunctions';
import {getOwnerWindow} from '../utils/domHelpers';
import React, {useCallback, useMemo, useRef} from 'react';
import {useEffectEvent} from '../utils/useEffectEvent';
import {useGlobalListeners} from '../utils/useGlobalListeners';

export interface MoveResult {
  /** Props to spread on the target element. */
  moveProps: DOMAttributes;
}

interface EventBase {
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

/**
 * Handles move interactions across mouse, touch, and keyboard, including dragging with
 * the mouse or touch, and using the arrow keys. Normalizes behavior across browsers and
 * platforms, and ignores emulated mouse events on touch devices.
 */
export function useMove(props: MoveEvents): MoveResult {
  let {onMoveStart, onMove, onMoveEnd} = props;

  let state = useRef<{
    didMove: boolean;
    lastPosition: {pageX: number; pageY: number} | null;
    id: number | null;
  }>({didMove: false, lastPosition: null, id: null});

  let {addGlobalListener, removeGlobalListener} = useGlobalListeners();

  let move = useCallback(
    (originalEvent: EventBase, pointerType: PointerType, deltaX: number, deltaY: number) => {
      if (deltaX === 0 && deltaY === 0) {
        return;
      }

      if (!state.current.didMove) {
        state.current.didMove = true;
        onMoveStart?.({
          type: 'movestart',
          pointerType,
          shiftKey: originalEvent.shiftKey,
          metaKey: originalEvent.metaKey,
          ctrlKey: originalEvent.ctrlKey,
          altKey: originalEvent.altKey
        });
      }
      onMove?.({
        type: 'move',
        pointerType,
        deltaX: deltaX,
        deltaY: deltaY,
        shiftKey: originalEvent.shiftKey,
        metaKey: originalEvent.metaKey,
        ctrlKey: originalEvent.ctrlKey,
        altKey: originalEvent.altKey
      });
    },
    [onMoveStart, onMove, state]
  );
  let moveEvent = useEffectEvent(move);

  let end = useCallback(
    (originalEvent: EventBase, pointerType: PointerType) => {
      restoreTextSelection();
      if (state.current.didMove) {
        onMoveEnd?.({
          type: 'moveend',
          pointerType,
          shiftKey: originalEvent.shiftKey,
          metaKey: originalEvent.metaKey,
          ctrlKey: originalEvent.ctrlKey,
          altKey: originalEvent.altKey
        });
      }
    },
    [onMoveEnd, state]
  );
  let endEvent = useEffectEvent(end);

  let moveProps = useMemo(() => {
    let moveProps: DOMAttributes = {};

    let start = () => {
      disableTextSelection();
      state.current.didMove = false;
    };

    if (typeof PointerEvent === 'undefined' && process.env.NODE_ENV === 'test') {
      let onMouseMove = (e: MouseEvent) => {
        if (e.button === 0) {
          // Should be safe to use the useEffectEvent because these are equivalent https://github.com/reactjs/react.dev/issues/8075#issuecomment-3400179389
          // However, the compiler is not smart enough to know that. As such, this whole file must be manually optimised as the compiler will bail.
          //
          // eslint-disable-next-line react-hooks/rules-of-hooks
          moveEvent(
            e,
            'mouse',
            e.pageX - (state.current.lastPosition?.pageX ?? 0),
            e.pageY - (state.current.lastPosition?.pageY ?? 0)
          );
          state.current.lastPosition = {pageX: e.pageX, pageY: e.pageY};
        }
      };
      let onMouseUp = (e: MouseEvent) => {
        if (e.button === 0) {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          endEvent(e, 'mouse');
          let ownerWindow = getOwnerWindow(getEventTarget(e) as Element);
          removeGlobalListener(ownerWindow, 'mousemove', onMouseMove, false);
          removeGlobalListener(ownerWindow, 'mouseup', onMouseUp, false);
        }
      };
      moveProps.onMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) {
          start();
          e.stopPropagation();
          e.preventDefault();
          state.current.lastPosition = {pageX: e.pageX, pageY: e.pageY};
          let ownerWindow = getOwnerWindow(getEventTarget(e) as Element);
          addGlobalListener(ownerWindow, 'mousemove', onMouseMove, false);
          addGlobalListener(ownerWindow, 'mouseup', onMouseUp, false);
        }
      };

      let onTouchMove = (e: TouchEvent) => {
        let touch = [...e.changedTouches].findIndex(
          ({identifier}) => identifier === state.current.id
        );
        if (touch >= 0) {
          let {pageX, pageY} = e.changedTouches[touch];
          // eslint-disable-next-line react-hooks/rules-of-hooks
          moveEvent(
            e,
            'touch',
            pageX - (state.current.lastPosition?.pageX ?? 0),
            pageY - (state.current.lastPosition?.pageY ?? 0)
          );
          state.current.lastPosition = {pageX, pageY};
        }
      };
      let onTouchEnd = (e: TouchEvent) => {
        let touch = [...e.changedTouches].findIndex(
          ({identifier}) => identifier === state.current.id
        );
        if (touch >= 0) {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          endEvent(e, 'touch');
          state.current.id = null;
          let ownerWindow = getOwnerWindow(getEventTarget(e) as Element);
          removeGlobalListener(ownerWindow, 'touchmove', onTouchMove);
          removeGlobalListener(ownerWindow, 'touchend', onTouchEnd);
          removeGlobalListener(ownerWindow, 'touchcancel', onTouchEnd);
        }
      };
      moveProps.onTouchStart = (e: React.TouchEvent) => {
        if (e.changedTouches.length === 0 || state.current.id != null) {
          return;
        }

        let {pageX, pageY, identifier} = e.changedTouches[0];
        start();
        e.stopPropagation();
        e.preventDefault();
        state.current.lastPosition = {pageX, pageY};
        state.current.id = identifier;
        let ownerWindow = getOwnerWindow(getEventTarget(e) as Element);
        addGlobalListener(ownerWindow, 'touchmove', onTouchMove, false);
        addGlobalListener(ownerWindow, 'touchend', onTouchEnd, false);
        addGlobalListener(ownerWindow, 'touchcancel', onTouchEnd, false);
      };
    } else {
      let onPointerMove = (e: PointerEvent) => {
        if (e.pointerId === state.current.id) {
          let pointerType = (e.pointerType || 'mouse') as PointerType;

          // Problems with PointerEvent#movementX/movementY:
          // 1. it is always 0 on macOS Safari.
          // 2. On Chrome Android, it's scaled by devicePixelRatio, but not on Chrome macOS
          // eslint-disable-next-line react-hooks/rules-of-hooks
          moveEvent(
            e,
            pointerType,
            e.pageX - (state.current.lastPosition?.pageX ?? 0),
            e.pageY - (state.current.lastPosition?.pageY ?? 0)
          );
          state.current.lastPosition = {pageX: e.pageX, pageY: e.pageY};
        }
      };

      let onPointerUp = (e: PointerEvent) => {
        if (e.pointerId === state.current.id) {
          let pointerType = (e.pointerType || 'mouse') as PointerType;
          // eslint-disable-next-line react-hooks/rules-of-hooks
          endEvent(e, pointerType);
          state.current.id = null;
          let ownerWindow = getOwnerWindow(getEventTarget(e) as Element);
          removeGlobalListener(ownerWindow, 'pointermove', onPointerMove, false);
          removeGlobalListener(ownerWindow, 'pointerup', onPointerUp, false);
          removeGlobalListener(ownerWindow, 'pointercancel', onPointerUp, false);
        }
      };

      moveProps.onPointerDown = (e: React.PointerEvent) => {
        if (e.button === 0 && state.current.id == null) {
          start();
          e.stopPropagation();
          e.preventDefault();
          state.current.lastPosition = {pageX: e.pageX, pageY: e.pageY};
          state.current.id = e.pointerId;
          let ownerWindow = getOwnerWindow(getEventTarget(e) as Element);
          addGlobalListener(ownerWindow, 'pointermove', onPointerMove, false);
          addGlobalListener(ownerWindow, 'pointerup', onPointerUp, false);
          addGlobalListener(ownerWindow, 'pointercancel', onPointerUp, false);
        }
      };
    }

    let triggerKeyboardMove = (e: EventBase, deltaX: number, deltaY: number) => {
      start();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      moveEvent(e, 'keyboard', deltaX, deltaY);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      endEvent(e, 'keyboard');
    };

    moveProps.onKeyDown = e => {
      switch (e.key) {
        case 'Left':
        case 'ArrowLeft':
          e.preventDefault();
          e.stopPropagation();
          triggerKeyboardMove(e, -1, 0);
          break;
        case 'Right':
        case 'ArrowRight':
          e.preventDefault();
          e.stopPropagation();
          triggerKeyboardMove(e, 1, 0);
          break;
        case 'Up':
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          triggerKeyboardMove(e, 0, -1);
          break;
        case 'Down':
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          triggerKeyboardMove(e, 0, 1);
          break;
      }
    };

    return moveProps;
  }, [addGlobalListener, removeGlobalListener, state]);

  return {moveProps};
}
