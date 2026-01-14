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
import React, {useContext, useRef} from 'react';
import {SSRContext} from './SSRContext';

// Moved this to a separate file to avoid the compiler bailing on the entire file, this is only used in React 16 and 17

let componentIds = new WeakMap();

export function useCounter(isDisabled = false) {
  let ctx = useContext(SSRContext);
  let ref = useRef<number | null>(null);
  if (ref.current === null && !isDisabled) {
    // In strict mode, React renders components twice, and the ref will be reset to null on the second render.
    // This means our id counter will be incremented twice instead of once. This is a problem because on the
    // server, components are only rendered once and so ids generated on the server won't match the client.
    // In React 18, useId was introduced to solve this, but it is not available in older versions. So to solve this
    // we need to use some React internals to access the underlying Fiber instance, which is stable between renders.
    // This is exposed as ReactCurrentOwner in development, which is all we need since StrictMode only runs in development.
    // To ensure that we only increment the global counter once, we store the starting id for this component in
    // a weak map associated with the Fiber. On the second render, we reset the global counter to this value.
    // Since React runs the second render immediately after the first, this is safe.
    // @ts-ignore
    let currentOwner = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentOwner?.current;
    if (currentOwner) {
      let prevComponentValue = componentIds.get(currentOwner);
      if (prevComponentValue == null) {
        // On the first render, and first call to useId, store the id and state in our weak map.
        componentIds.set(currentOwner, {
          id: ctx.current,
          state: currentOwner.memoizedState
        });
      } else if (currentOwner.memoizedState !== prevComponentValue.state) {
        // On the second render, the memoizedState gets reset by React.
        // Reset the counter, and remove from the weak map so we don't
        // do this for subsequent useId calls.
        // eslint-disable-next-line react-hooks/immutability
        ctx.current = prevComponentValue.id;
        componentIds.delete(currentOwner);
      }
    }

    // eslint-disable-next-line react-hooks/immutability
    ref.current = ++ctx.current;
  }

  return ref.current;
}
