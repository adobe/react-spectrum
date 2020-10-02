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
import {HTMLAttributes, useMemo, useRef} from 'react';

export interface BaseMoveEvent {
  pointerType: 'mouse' | 'pen' | 'touch' | 'keyboard'
}

export interface MoveStartEvent extends BaseMoveEvent{
  type: 'movestart'
}

export interface MoveMoveEvent extends BaseMoveEvent{
  type: 'move',
  deltaX: number,
  deltaY: number
}

export interface MoveEndEvent extends BaseMoveEvent{
  type: 'moveend'
}

export type MoveEvent = MoveStartEvent | MoveMoveEvent | MoveEndEvent;

export interface MoveProps {
  onMoveStart?: (e: MoveStartEvent) => void,
  onMove: (e: MoveMoveEvent) => void,
  onMoveEnd?: (e: MoveEndEvent) => void
}

export function useMove(props: MoveProps): HTMLAttributes<HTMLElement> {
  let {onMoveStart, onMove, onMoveEnd} = props;

  let state = useRef<{
    didMove: boolean,
    lastPosition: {pageX: number, pageY: number} | null,
    id: number | null
  }>({didMove: false, lastPosition: null, id: null});

  let moveProps = useMemo(() => {
    let moveProps: HTMLAttributes<HTMLElement> = {};

    let start = () => {
      disableTextSelection();
      state.current.didMove = false;
    };
    let move = (pointerType: BaseMoveEvent['pointerType'], deltaX: number, deltaY: number) => {
      if (!state.current.didMove) {
        state.current.didMove = true;
        onMoveStart?.({
          type: 'movestart',
          pointerType
        });
      }
      onMove({
        type: 'move',
        pointerType,
        deltaX: deltaX,
        deltaY: deltaY
      });
    };
    let end = (pointerType: BaseMoveEvent['pointerType']) => {
      restoreTextSelection();
      if (state.current.didMove) {
        onMoveEnd?.({
          type: 'moveend',
          pointerType
        });
      }
    };

    if (typeof PointerEvent === 'undefined') {
      let onMouseMove = (e: MouseEvent) => {
        if (e.button === 0) {
          move('mouse', e.pageX - state.current.lastPosition.pageX, e.pageY - state.current.lastPosition.pageY);
          state.current.lastPosition = {pageX: e.pageX, pageY: e.pageY};
        }
      };
      let onMouseUp = (e: MouseEvent) => {
        if (e.button === 0) {
          end('mouse');
          window.removeEventListener('mousemove', onMouseMove, false);
          window.removeEventListener('mouseup', onMouseUp, false);
        }
      };
      moveProps.onMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) {
          start();
          e.stopPropagation();
          e.preventDefault();
          state.current.lastPosition = {pageX: e.pageX, pageY: e.pageY};
          window.addEventListener('mousemove', onMouseMove, false);
          window.addEventListener('mouseup', onMouseUp, false);
        }
      };

      let onTouchMove = (e: TouchEvent) => {
        // @ts-ignore
        let touch = [...e.changedTouches].findIndex(({identifier}) => identifier === state.current.id);
        if (touch >= 0) {
          let {pageX, pageY} = e.changedTouches[touch];
          move('touch', pageX - state.current.lastPosition.pageX, pageY - state.current.lastPosition.pageY);
          state.current.lastPosition = {pageX, pageY};
        }
      };
      let onTouchEnd = (e: TouchEvent) => {
        // @ts-ignore
        let touch = [...e.changedTouches].findIndex(({identifier}) => identifier === state.current.id);
        if (touch >= 0) {
          end('touch');
          window.removeEventListener('touchmove', onTouchMove);
          window.removeEventListener('touchend', onTouchEnd);
          window.removeEventListener('touchcancel', onTouchEnd);
        }
      };
      moveProps.onTouchStart = (e: React.TouchEvent) => {
        if (e.targetTouches.length === 0) {
          return;
        }

        let {pageX, pageY, identifier} = e.targetTouches[0];
        start();
        e.stopPropagation();
        e.preventDefault();
        state.current.lastPosition = {pageX, pageY};
        state.current.id = identifier;
        window.addEventListener('touchmove', onTouchMove, false);
        window.addEventListener('touchend', onTouchEnd, false);
        window.addEventListener('touchcancel', onTouchEnd, false);
      };
    } else {
      let onPointerMove = (e: PointerEvent) => {
        if (e.pointerId === state.current.id) {
          // @ts-ignore
          let pointerType: BaseMoveEvent['pointerType'] = e.pointerType || 'mouse';

          // Problems with PointerEvent#movementX/movementY:
          // 1. it is always 0 on macOS Safari.
          // 2. On Chrome Android, it's scaled by devicePixelRatio, but not on Chrome macOS
          move(pointerType, e.pageX - state.current.lastPosition.pageX, e.pageY - state.current.lastPosition.pageY);
          state.current.lastPosition = {pageX: e.pageX, pageY: e.pageY};
        }
      };

      let onPointerUp = (e: PointerEvent) => {
        if (e.pointerId === state.current.id) {
            // @ts-ignore
          let pointerType: BaseMoveEvent['pointerType'] = e.pointerType || 'mouse';
          end(pointerType/* , e.target */);
          window.removeEventListener('pointermove', onPointerMove, false);
          window.removeEventListener('pointerup', onPointerUp, false);
          window.removeEventListener('pointercancel', onPointerUp, false);
        }
      };

      moveProps.onPointerDown = (e: React.PointerEvent) => {
        if (e.button === 0) {
          start();
          e.stopPropagation();
          e.preventDefault();
          state.current.lastPosition = {pageX: e.pageX, pageY: e.pageY};
          state.current.id = e.pointerId;
          window.addEventListener('pointermove', onPointerMove, false);
          window.addEventListener('pointerup', onPointerUp, false);
          window.addEventListener('pointercancel', onPointerUp, false);
        }
      };
    }

    let triggetKeyboardMove = (deltaX: number, deltaY: number) => {
      start();
      move('keyboard', deltaX, deltaY);
      end('keyboard');
    };

    moveProps.onKeyDown = (e) => {
      switch (e.key) {
        case 'Left':
        case 'ArrowLeft':
          e.preventDefault();
          e.stopPropagation();
          triggetKeyboardMove(-1, 0);
          break;
        case 'Right':
        case 'ArrowRight':
          e.preventDefault();
          e.stopPropagation();
          triggetKeyboardMove(1, 0);
          break;
        case 'Up':
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          triggetKeyboardMove(0, -1);
          break;
        case 'Down':
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          triggetKeyboardMove(0, 1);
          break;
      }
    };

    return moveProps;
  }, [state, onMoveStart, onMove, onMoveEnd]);

  return moveProps;
}
