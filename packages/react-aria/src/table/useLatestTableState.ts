/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {gridIds} from './utils';
import {gridMap} from '../grid/utils';
import {RefObject, useMemo, useRef} from 'react';
import {TableState} from 'react-stately/useTableState';
import {useLayoutEffect} from '../utils/useLayoutEffect';

/**
 * Creates an object that forwards all property access to the value returned by `getTarget`.
 * Getters and methods run with the proxy as `this`, so class instances such as a SelectionManager
 * read the target's internal state too.
 */
function createForwardingProxy<T extends object>(
  getTarget: () => T,
  overrides: Partial<Record<PropertyKey, unknown>> = {}
): T {
  return new Proxy({} as T, {
    get(_, key, receiver) {
      if (Object.prototype.hasOwnProperty.call(overrides, key)) {
        return overrides[key as string];
      }
      return Reflect.get(getTarget(), key, receiver);
    },
    set(_, key, value) {
      return Reflect.set(getTarget(), key, value);
    },
    has(_, key) {
      return Reflect.has(getTarget(), key);
    },
    ownKeys() {
      return Reflect.ownKeys(getTarget());
    },
    getOwnPropertyDescriptor(_, key) {
      let descriptor = Reflect.getOwnPropertyDescriptor(getTarget(), key);
      return descriptor ? {...descriptor, configurable: true} : undefined;
    },
    getPrototypeOf() {
      return Reflect.getPrototypeOf(getTarget());
    }
  });
}

// The table state for one render, which reads the latest committed state once that render commits.
class LatestTableState {
  state: TableState<unknown>;
  private renderState: TableState<unknown>;
  private committedState: RefObject<TableState<unknown>> | null = null;

  constructor(renderState: TableState<unknown>) {
    this.renderState = renderState;
    let getState = () => this.getState();
    let getGrid = () => gridMap.get(getState())!;
    let selectionManager = createForwardingProxy(() => getState().selectionManager);
    this.state = createForwardingProxy(getState, {selectionManager});
    gridMap.set(
      this.state,
      createForwardingProxy(getGrid, {
        keyboardDelegate: createForwardingProxy(() => getGrid().keyboardDelegate),
        actions: createForwardingProxy(() => getGrid().actions)
      })
    );
    gridIds.set(this.state, gridIds.get(renderState)!);
  }

  private getState() {
    return this.committedState ? this.committedState.current : this.renderState;
  }

  commit(committedState: RefObject<TableState<unknown>>) {
    this.committedState = committedState;
  }
}

/**
 * Returns a table state object that rows and cells can keep using after they skip re-rendering.
 * Until this render commits, it reads the state passed in, so rendering only sees this render's
 * state. Once committed, it reads the latest committed state instead, so event handlers from rows
 * that skipped later renders never act on an outdated collection, selection, or callbacks. The
 * state passed in must already have been registered with `useTable`.
 *
 * @private
 */
export function useLatestTableState<T>(state: TableState<T>): TableState<T> {
  let committedState = useRef<TableState<unknown>>(state as TableState<unknown>);
  let latest = useMemo(() => new LatestTableState(state as TableState<unknown>), [state]);
  useLayoutEffect(() => {
    committedState.current = state as TableState<unknown>;
    latest.commit(committedState);
  }, [state, latest]);

  return latest.state as TableState<T>;
}
