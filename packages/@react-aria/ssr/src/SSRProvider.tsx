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

import {defaultContext, SSRContext, SSRContextValue} from './SSRContext';
// We must avoid a circular dependency with @react-aria/utils, and this useLayoutEffect is
// guarded by a check that it only runs on the client side.
// eslint-disable-next-line rulesdir/useLayoutEffectRule
import React, {JSX, ReactNode, useContext, useLayoutEffect, useMemo, useState} from 'react';
import {useCounter} from './useCounter';


const IsSSRContext = React.createContext(false);

export interface SSRProviderProps {
  /** Your application here. */
  children: ReactNode
}

// This is only used in React < 18.
function LegacySSRProvider(props: SSRProviderProps): JSX.Element {
  let cur = useContext(SSRContext);
  let counter = useCounter(cur === defaultContext);
  let [isSSR, setIsSSR] = useState(true);
  let value: SSRContextValue = useMemo(() => ({
    // If this is the first SSRProvider, start with an empty string prefix, otherwise
    // append and increment the counter.
    prefix: cur === defaultContext ? '' : `${cur.prefix}-${counter}`,
    current: 0
  }), [cur, counter]);

  // If on the client, and the component was initially server rendered,
  // then schedule a layout effect to update the component after hydration.
  if (typeof document !== 'undefined') {
    // This if statement technically breaks the rules of hooks, but is safe
    // because the condition never changes after mounting.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useLayoutEffect(() => {
      setIsSSR(false);
    }, []);
  }

  return (
    <SSRContext.Provider value={value}>
      <IsSSRContext.Provider value={isSSR}>
        {props.children}
      </IsSSRContext.Provider>
    </SSRContext.Provider>
  );
}

let warnedAboutSSRProvider = false;

/**
 * When using SSR with React Aria in React 16 or 17, applications must be wrapped in an SSRProvider.
 * This ensures that auto generated ids are consistent between the client and server.
 */
export function SSRProvider(props: SSRProviderProps): JSX.Element {
  if (typeof React['useId'] === 'function') {
    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production' && !warnedAboutSSRProvider) {
      console.warn('In React 18, SSRProvider is not necessary and is a noop. You can remove it from your app.');
      warnedAboutSSRProvider = true;
    }
    return <>{props.children}</>;
  }
  return <LegacySSRProvider {...props} />;
}

let canUseDOM = Boolean(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

function useLegacySSRSafeId(defaultId?: string): string {
  let ctx = useContext(SSRContext);

  // If we are rendering in a non-DOM environment, and there's no SSRProvider,
  // provide a warning to hint to the developer to add one.
  if (ctx === defaultContext && !canUseDOM && process.env.NODE_ENV !== 'production') {
    console.warn('When server rendering, you must wrap your application in an <SSRProvider> to ensure consistent ids are generated between the client and server.');
  }

  let counter = useCounter(!!defaultId);
  let prefix = ctx === defaultContext && process.env.NODE_ENV === 'test' ? 'react-aria' : `react-aria${ctx.prefix}`;
  return defaultId || `${prefix}-${counter}`;
}

function useModernSSRSafeId(defaultId?: string): string {
  let id = React.useId();
  let [didSSR] = useState(useIsSSR());
  let prefix = didSSR || process.env.NODE_ENV === 'test' ? 'react-aria' : `react-aria${defaultContext.prefix}`;
  return defaultId || `${prefix}-${id}`;
}

// Use React.useId in React 18 if available, otherwise fall back to our old implementation.
/** @private */
export const useSSRSafeId: typeof useModernSSRSafeId | typeof useLegacySSRSafeId = typeof React['useId'] === 'function' ? useModernSSRSafeId : useLegacySSRSafeId;

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

/**
 * Returns whether the component is currently being server side rendered or
 * hydrated on the client. Can be used to delay browser-specific rendering
 * until after hydration.
 */
export function useIsSSR(): boolean {
  // In React 18+, we can use useSyncExternalStore to detect if we're server rendering or hydrating.
  if (typeof React['useSyncExternalStore'] === 'function') {
    return React['useSyncExternalStore'](subscribe, getSnapshot, getServerSnapshot);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useContext(IsSSRContext);
}
