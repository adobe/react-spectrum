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

import {disableTextSelection, restoreTextSelection}  from './textSelection';
import {DOMAttributes, MoveEvents, PointerType} from '@react-types/shared';
import React, {useMemo, useRef} from 'react';
import {useEffectEvent, useGlobalListeners} from '@react-aria/utils';

export interface MoveResult {
  /** Props to spread on the target element. */
  moveProps: DOMAttributes
}

interface EventBase {
  shiftKey: boolean,
  ctrlKey: boolean,
  metaKey: boolean,
  altKey: boolean
}

/**
 * Handles move interactions across mouse, touch, and keyboard, including dragging with
 * the mouse or touch, and using the arrow keys. Normalizes behavior across browsers and
 * platforms, and ignores emulated mouse events on touch devices.
 */
export function useMove(props: MoveEvents): MoveResult {
  let {onMoveStart, onMove, onMoveEnd} = props;

  let state = useRef<{
    didMove: boolean,
    lastPosition: {pageX: number, pageY: number} | null,
    id: number | null
  }>({didMove: false, lastPosition: null, id: null});

  let {addGlobalListener, removeGlobalListener} = useGlobalListeners();

  let move = useEffectEvent((originalEvent: EventBase, pointerType: PointerType, deltaX: number, deltaY: number) => {
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
  });

  let end = useEffectEvent((originalEvent: EventBase, pointerType: PointerType) => {
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
  });

  let moveProps = useMemo(() => {
    let moveProps: DOMAttributes = {};

    let start = () => {
      disableTextSelection();
      state.current.didMove = false;
    };

    if (typeof PointerEvent === 'undefined') {
      let onMouseMove = (e: MouseEvent) => {
        if (e.button === 0) {
          move(e, 'mouse', e.pageX - (state.current.lastPosition?.pageX ?? 0), e.pageY - (state.current.lastPosition?.pageY ?? 0));
          state.current.lastPosition = {pageX: e.pageX, pageY: e.pageY};
        }
      };
      let onMouseUp = (e: MouseEvent) => {
        if (e.button === 0) {
          end(e, 'mouse');
          removeGlobalListener(window, 'mousemove', onMouseMove, false);
          removeGlobalListener(window, 'mouseup', onMouseUp, false);
        }
      };
      moveProps.onMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) {
          start();
          e.stopPropagation();
          e.preventDefault();
          state.current.lastPosition = {pageX: e.pageX, pageY: e.pageY};
          addGlobalListener(window, 'mousemove', onMouseMove, false);
          addGlobalListener(window, 'mouseup', onMouseUp, false);
        }
      };

      let onTouchMove = (e: TouchEvent) => {
        let touch = [...e.changedTouches].findIndex(({identifier}) => identifier === state.current.id);
        if (touch >= 0) {
          let {pageX, pageY} = e.changedTouches[touch];
          move(e, 'touch', pageX - (state.current.lastPosition?.pageX ?? 0), pageY - (state.current.lastPosition?.pageY ?? 0));
          state.current.lastPosition = {pageX, pageY};
        }
      };
      let onTouchEnd = (e: TouchEvent) => {
        let touch = [...e.changedTouches].findIndex(({identifier}) => identifier === state.current.id);
        if (touch >= 0) {
          end(e, 'touch');
          state.current.id = null;
          removeGlobalListener(window, 'touchmove', onTouchMove);
          removeGlobalListener(window, 'touchend', onTouchEnd);
          removeGlobalListener(window, 'touchcancel', onTouchEnd);
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
        addGlobalListener(window, 'touchmove', onTouchMove, false);
        addGlobalListener(window, 'touchend', onTouchEnd, false);
        addGlobalListener(window, 'touchcancel', onTouchEnd, false);
      };
    } else {
      let onPointerMove = (e: PointerEvent) => {
        if (e.pointerId === state.current.id) {
          let pointerType = (e.pointerType || 'mouse') as PointerType;

          // Problems with PointerEvent#movementX/movementY:
          // 1. it is always 0 on macOS Safari.
          // 2. On Chrome Android, it's scaled by devicePixelRatio, but not on Chrome macOS
          move(e, pointerType, e.pageX - (state.current.lastPosition?.pageX ?? 0), e.pageY - (state.current.lastPosition?.pageY ?? 0));
          state.current.lastPosition = {pageX: e.pageX, pageY: e.pageY};
        }
      };

      let onPointerUp = (e: PointerEvent) => {
        if (e.pointerId === state.current.id) {
          let pointerType = (e.pointerType || 'mouse') as PointerType;
          end(e, pointerType);
          state.current.id = null;
          removeGlobalListener(window, 'pointermove', onPointerMove, false);
          removeGlobalListener(window, 'pointerup', onPointerUp, false);
          removeGlobalListener(window, 'pointercancel', onPointerUp, false);
        }
      };

      moveProps.onPointerDown = (e: React.PointerEvent) => {
        if (e.button === 0 && state.current.id == null) {
          start();
          e.stopPropagation();
          e.preventDefault();
          state.current.lastPosition = {pageX: e.pageX, pageY: e.pageY};
          state.current.id = e.pointerId;
          addGlobalListener(window, 'pointermove', onPointerMove, false);
          addGlobalListener(window, 'pointerup', onPointerUp, false);
          addGlobalListener(window, 'pointercancel', onPointerUp, false);
        }
      };
    }

    let triggerKeyboardMove = (e: EventBase, deltaX: number, deltaY: number) => {
      start();
      move(e, 'keyboard', deltaX, deltaY);
      end(e, 'keyboard');
    };

    moveProps.onKeyDown = (e) => {
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
  }, [state, addGlobalListener, removeGlobalListener, move, end]);

  return {moveProps};
}
