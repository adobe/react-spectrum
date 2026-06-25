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

// We must avoid a circular dependency with @react-aria/utils, and this useLayoutEffect is
// guarded by a check that it only runs on the client side.
// eslint-disable-next-line rsp-rules/use-layout-effect-rule
import React, {
  JSX,
  ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {useSyncExternalStore as useSyncExternalStoreShim} from 'use-sync-external-store/shim/index.js';

// To support SSR, the auto incrementing id counter is stored in a context. This allows
// it to be reset on every request to ensure the client and server are consistent.
// There is also a prefix string that is used to support async loading components
// Each async boundary must be wrapped in an SSR provider, which appends to the prefix
// and resets the current id counter. This ensures that async loaded components have
// consistent ids regardless of the loading order.
interface SSRContextValue {
  prefix: string;
  incrementCounter: () => number;
}

// Default context value to use in case there is no SSRProvider. This is fine for
// client-only apps. In order to support multiple copies of React Aria potentially
// being on the page at once, the prefix is set to a random number. SSRProvider
// will reset this to zero for consistency between server and client, so in the
// SSR case multiple copies of React Aria is not supported.
const defaultContext: SSRContextValue = {
  prefix: String(Math.round(Math.random() * 10000000000)),
  incrementCounter: () => {
    defaultCounter += 1;
    return defaultCounter;
  }
};

let defaultCounter = 0;

const SSRContext = React.createContext<SSRContextValue>(defaultContext);

export interface SSRProviderProps {
  /** Your application here. */
  children: ReactNode;
}

const supportsUseId = typeof React['useId'] === 'function';
const supportsUseSyncExternalStore = typeof React['useSyncExternalStore'] === 'function';

function LegacySSRProvider(props: SSRProviderProps): JSX.Element {
  let cur = useContext(SSRContext);
  let counter = useCounter(cur === defaultContext);
  let counterRef = useRef(0);
  let incrementCounter = useCallback(() => {
    // In strict mode, React renders components twice, and the ref will be reset to null on the second render.
    // This means our id counter will be incremented twice instead of once. This is a problem because on the
    // server, components are only rendered once and so ids generated on the server won't match the client.
    // In React 18, useId was introduced to solve this, but it is not available in older versions. So to solve this
    // we need to use some React internals to access the underlying Fiber instance, which is stable between renders.
    // This is exposed as ReactCurrentOwner in development, which is all we need since StrictMode only runs in development.
    // To ensure that we only increment the global counter once, we store the starting id for this component in
    // a weak map associated with the Fiber. On the second render, we reset the global counter to this value.
    // Since React runs the second render immediately after the first, this is safe.
    let currentOwner =
      // @ts-ignore
      React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentOwner?.current;
    if (currentOwner) {
      let prevComponentValue = componentIds.get(currentOwner);
      if (prevComponentValue == null) {
        // On the first render, and first call to useId, store the id and state in our weak map.
        componentIds.set(currentOwner, {
          id: counterRef.current,
          state: currentOwner.memoizedState
        });
      } else if (currentOwner.memoizedState !== prevComponentValue.state) {
        // On the second render, the memoizedState gets reset by React.
        // Reset the counter, and remove from the weak map so we don't
        // do this for subsequent useId calls.
        counterRef.current = prevComponentValue.id;
        componentIds.delete(currentOwner);
      }
    }

    counterRef.current += 1;
    return counterRef.current;
  }, []);
  let value: SSRContextValue = useMemo(
    () => ({
      // If this is the first SSRProvider, start with an empty string prefix, otherwise
      // append and increment the counter.
      prefix: cur === defaultContext ? '' : `${cur.prefix}-${counter}`,
      incrementCounter
    }),
    [cur, counter, incrementCounter]
  );

  return <SSRContext.Provider value={value}>{props.children}</SSRContext.Provider>;
}

function ModernSSRProvider(props: SSRProviderProps): JSX.Element {
  useLayoutEffect(() => {
    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production') {
      console.warn(
        'In React 18, SSRProvider is not necessary and is a noop. You can remove it from your app.'
      );
    }
  }, []);
  return <>{props.children}</>;
}

/**
 * When using SSR with React Aria in React 16 or 17, applications must be wrapped in an SSRProvider.
 * This ensures that auto generated ids are consistent between the client and server.
 */
export function SSRProvider(props: SSRProviderProps): JSX.Element {
  if (supportsUseId) {
    return <ModernSSRProvider {...props} />;
  }
  return <LegacySSRProvider {...props} />;
}

let canUseDOM = Boolean(
  typeof window !== 'undefined' && window.document && window.document.createElement
);

let componentIds = new WeakMap();

function useCounter(isDisabled = false) {
  let {incrementCounter} = useContext(SSRContext);
  let [counter] = useState<number | null>(() => (isDisabled ? null : incrementCounter()));
  return counter;
}

function useLegacySSRSafeId(defaultId?: string): string {
  let ctx = useContext(SSRContext);

  // If we are rendering in a non-DOM environment, and there's no SSRProvider,
  // provide a warning to hint to the developer to add one.
  if (ctx === defaultContext && !canUseDOM && process.env.NODE_ENV !== 'production') {
    console.warn(
      'When server rendering, you must wrap your application in an <SSRProvider> to ensure consistent ids are generated between the client and server.'
    );
  }

  let counter = useCounter(!!defaultId);
  let prefix =
    ctx === defaultContext && process.env.NODE_ENV === 'test'
      ? 'react-aria'
      : `react-aria${ctx.prefix}`;
  return defaultId || `${prefix}-${counter}`;
}

function useModernSSRSafeId(defaultId?: string): string {
  let id = React.useId();
  let [didSSR] = useState(useIsSSR());
  let prefix =
    didSSR || process.env.NODE_ENV === 'test' ? 'react-aria' : `react-aria${defaultContext.prefix}`;
  return defaultId || `${prefix}-${id}`;
}

// Use React.useId in React 18 if available, otherwise fall back to our old implementation.
/** @private */
export const useSSRSafeId: typeof useModernSSRSafeId | typeof useLegacySSRSafeId = supportsUseId
  ? useModernSSRSafeId
  : useLegacySSRSafeId;

function getSnapshot() {
  return false;
}

function getServerSnapshot() {
  return true;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function subscribe(onStoreChange: () => void): () => void {
  // noop
  return () => {};
}

function useModernIsSSR(): boolean {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function useIsSSRWithShim(): boolean {
  return useSyncExternalStoreShim(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Returns whether the component is currently being server side rendered or
 * hydrated on the client. Can be used to delay browser-specific rendering
 * until after hydration.
 */
export const useIsSSR: typeof useModernIsSSR | typeof useIsSSRWithShim =
  supportsUseSyncExternalStore ? useModernIsSSR : useIsSSRWithShim;
