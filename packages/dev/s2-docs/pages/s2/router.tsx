'use client';
import React, {createContext, ReactNode, useContext, useState} from 'react';

// A tiny in-memory router that mirrors the parts of the `react-router` API used
// to integrate with React Aria. In a real app, `MemoryRouter`, `useNavigate`, and
// `useLocation` would come from the `react-router` package — the wiring above is
// identical.

interface Location {
  pathname: string;
}

interface RouterContextValue {
  location: Location;
  navigate: (pathname: string) => void;
}

const RouterContext = createContext<RouterContextValue>({
  location: {pathname: '/'},
  navigate: () => {}
});

export function MemoryRouter(props: {initialEntries?: string[]; children: ReactNode}) {
  let {initialEntries = ['/'], children} = props;
  let [location, setLocation] = useState<Location>({pathname: initialEntries[0]});
  let navigate = (pathname: string) => setLocation({pathname});

  return <RouterContext.Provider value={{location, navigate}}>{children}</RouterContext.Provider>;
}

export function useLocation(): Location {
  return useContext(RouterContext).location;
}

export function useNavigate(): (pathname: string) => void {
  return useContext(RouterContext).navigate;
}
