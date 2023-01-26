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
// eslint-disable-next-line rulesdir/useLayoutEffectRule
import React, {ReactNode, useContext, useLayoutEffect, useMemo, useState} from 'react';

// To support SSR, the auto incrementing id counter is stored in a context. This allows
// it to be reset on every request to ensure the client and server are consistent.
// There is also a prefix string that is used to support async loading components
// Each async boundary must be wrapped in an SSR provider, which appends to the prefix
// and resets the current id counter. This ensures that async loaded components have
// consistent ids regardless of the loading order.
interface SSRContextValue {
  prefix: string,
  current: number
}

// Default context value to use in case there is no SSRProvider. This is fine for
// client-only apps. In order to support multiple copies of React Aria potentially
// being on the page at once, the prefix is set to a random number. SSRProvider
// will reset this to zero for consistency between server and client, so in the
// SSR case multiple copies of React Aria is not supported.
const defaultContext: SSRContextValue = {
  prefix: String(Math.round(Math.random() * 10000000000)),
  current: 0
};

const SSRContext = React.createContext<SSRContextValue>(defaultContext);

/**
 * A set of options for generating IDs.
 * You cannot change the mode at runtime.
 */
export type SSRIdOptions =
  | {
      /**
       * In 'counter' mode (the default), the auto incrementing counter stored in a context is used to generate IDs.
       * If you are using React 18 or later, use the 'useId' mode instead.
       */
      mode?: 'counter',
      /**
       * Whether or not React strict mode is enabled in this context. This value should be invariant at runtime.
       * When set to `true`, the `current` counter is incremented by two on the server side to avoid hydration errors.
       * Normally you should pass `process.env.NODE_ENV !== 'production'`.
       */
      strictMode?: boolean,

      useId?: never
    }
  | {
      /**
       * In 'useId' mode, the provided `useId` function is used to generate IDs.
       * If you are using React 16 or 17, use the 'counter' mode instead.
       */
      mode: 'useId',
      /**
       * A React hook to generate IDs. This value must be invariant at runtime.
       * Normally you should pass `React.useId`.
       */
      useId: () => string,

      strictMode?: never
    };

const SSRIdOptionContext = React.createContext<SSRIdOptions>({mode: 'counter'});

const canUseDOM = Boolean(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

export type SSRProviderProps = SSRIdOptions & {
  /** Your application here. */
  children: ReactNode
}

/**
 * When using SSR with React Aria, applications must be wrapped in an SSRProvider.
 * This ensures that auto generated ids are consistent between the client and server.
 */
export function SSRProvider({children, ...idOption}: SSRProviderProps): JSX.Element {
  let cur = useContext(SSRContext);
  let value: SSRContextValue = useMemo(() => {
    // If React strict mode is enabled, the function passed to `useMemo` will be called twice on the client.
    // As a result, `cur.current` will increase by two on the client side, causing hydration errors.
    // To avoid the error, we increase the counter to mimic this behavior on the server side.
    if (idOption.strictMode && !canUseDOM) {
      cur.current++;
    }

    return {
      // If this is the first SSRProvider, start with an empty string prefix, otherwise
      // append and increment the counter.
      prefix: cur === defaultContext ? '' : `${cur.prefix}-${++cur.current}`,
      current: 0
    };
  }, [idOption.strictMode, cur]);

  return (
    <SSRContext.Provider value={value}>
      <SSRIdOptionContext.Provider value={idOption}>
        {children}
      </SSRIdOptionContext.Provider>
    </SSRContext.Provider>
  );
}

/** @private */
export function useSSRSafeId(defaultId?: string): string {
  let ctx = useContext(SSRContext);

  // If we are rendering in a non-DOM environment, and there's no SSRProvider,
  // provide a warning to hint to the developer to add one.
  if (ctx === defaultContext && !canUseDOM) {
    console.warn('When server rendering, you must wrap your application in an <SSRProvider> to ensure consistent ids are generated between the client and server.');
  }

  const idOption = useContext(SSRIdOptionContext);

  // We assume that `idOption.mode` is invariant at runtime.
  if (idOption.mode === 'useId') {
    return idOption.useId();
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMemo(() => {
      // If React strict mode is enabled, the function passed to `useMemo` will be called twice on the client.
      // As a result, `ctx.current` will increase by two on the client side, causing hydration errors.
      // To avoid the error, we increase the counter to mimic this behavior on the server side.
      if (idOption.strictMode && !canUseDOM) {
        ctx.current++;
      }

      return defaultId || `react-aria${ctx.prefix}-${++ctx.current}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idOption.strictMode, defaultId]);
  }
}

/**
 * Returns whether the component is currently being server side rendered or
 * hydrated on the client. Can be used to delay browser-specific rendering
 * until after hydration.
 */
export function useIsSSR(): boolean {
  let cur = useContext(SSRContext);
  let isInSSRContext = cur !== defaultContext;
  let [isSSR, setIsSSR] = useState(isInSSRContext);

  // If on the client, and the component was initially server rendered,
  // then schedule a layout effect to update the component after hydration.
  if (typeof window !== 'undefined' && isInSSRContext) {
    // This if statement technically breaks the rules of hooks, but is safe
    // because the condition never changes after mounting.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useLayoutEffect(() => {
      setIsSSR(false);
    }, []);
  }

  return isSSR;
}
