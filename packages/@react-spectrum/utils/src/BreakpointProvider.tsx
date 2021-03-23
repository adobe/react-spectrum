import { useIsSSR } from '@react-aria/ssr';
import React, {ReactNode, useContext, useEffect, useState} from 'react';

interface Breakpoints {
  S?: number,
  M?: number,
  L?: number,
  [custom: string]: number
}

interface IBreakpointContext {
  breakpoint: string
}

export const BreakpointContext = React.createContext<IBreakpointContext>(null);
BreakpointContext.displayName = 'BreakpointContext';

interface BreakpointProviderProps {
  children?: ReactNode,
  breakpoint: string
}

export function BreakpointProvider(props: BreakpointProviderProps) {
  let {
    children,
    breakpoint,
  } = props;
  return (
    <BreakpointContext.Provider value={{
      breakpoint
    }}>
      {children}
    </BreakpointContext.Provider>
  )
}

export function useMatchedBreakpoint(breakpoints: Breakpoints) {
  // sort breakpoints in ascending order.
  let entries = Object.entries(breakpoints).sort(([, valueA], [, valueB]) => valueA - valueB);
  let breakpointQueries = entries.map(([, value], index) => {
    if (index === entries.length - 1) {
      return `(min-width: ${value}px)`;
    } else {
      return `(min-width: ${value}px) and (max-width: ${entries[index + 1][1]}px)`;
    }
  });

  let supportsMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
  let getBreakpointHandler = () => {
    let point = 'base';
    for (let i in breakpointQueries) {
      let query = breakpointQueries[i];
      if (window.matchMedia(query).matches) {
        point = entries[i][0];
        break;
      }
    }
    return point;
  };

  let [breakpoint, setBreakpoint] = useState(() =>
    supportsMatchMedia
      ? getBreakpointHandler()
      : 'base'
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
  return isSSR ? 'base' : breakpoint;
}

export function useBreakpoint(): IBreakpointContext {
  return useContext(BreakpointContext);
}
