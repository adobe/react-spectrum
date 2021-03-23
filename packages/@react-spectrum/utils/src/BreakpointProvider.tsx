import React, {ReactNode, useContext, useEffect, useState} from 'react';
import {useIsSSR} from '@react-aria/ssr';

interface Breakpoints {
  S?: number,
  M?: number,
  L?: number,
  [custom: string]: number
}

interface IBreakpointContext {
  matchedBreakpoints: string[]
}

export const BreakpointContext = React.createContext<IBreakpointContext>(null);
BreakpointContext.displayName = 'BreakpointContext';

// This is temporary values.
export const DEFAULT_BREAKPOINTS = {S: 380, M: 768, L: 1024};

interface BreakpointProviderProps {
  children?: ReactNode,
  matchedBreakpoints: string[]
}

export function BreakpointProvider(props: BreakpointProviderProps) {
  let {
    children,
    matchedBreakpoints
  } = props;
  return (
    <BreakpointContext.Provider
      value={{matchedBreakpoints}} >
      {children}
    </BreakpointContext.Provider>
  );
}

export function useMatchedBreakpoints(breakpoints: Breakpoints, mobileFirst: boolean): string[] {
  // sort breakpoints
  let entries = Object.entries(breakpoints).sort(([, valueA], [, valueB]) => mobileFirst ? valueB - valueA : valueA - valueB);
  let breakpointQueries = entries.map(([, value]) => mobileFirst ?  `(min-width: ${value}px)` : `(max-width: ${value}px)`);

  let supportsMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
  let getBreakpointHandler = () => {
    let matched = [];
    for (let i in breakpointQueries) {
      let query = breakpointQueries[i];
      if (window.matchMedia(query).matches) {
        matched.push(entries[i][0]);
      }
    }
    matched.push('base');
    return matched;
  };

  let [breakpoint, setBreakpoint] = useState(() =>
    supportsMatchMedia
      ? getBreakpointHandler()
      : ['base']
  );

  useEffect(() => {
    if (!supportsMatchMedia) {
      return;
    }

    let onResize = () => {
      setBreakpoint(getBreakpointHandler());
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [supportsMatchMedia]);

  // If in SSR, the media query should never match. Once the page hydrates,
  // this will update and the real value will be returned.
  let isSSR = useIsSSR();
  return isSSR ? ['base'] : breakpoint;
}

export function useBreakpoint(): IBreakpointContext {
  return useContext(BreakpointContext);
}
