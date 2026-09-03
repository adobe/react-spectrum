'use client';
import React, {ReactNode, useState, createContext, useContext} from 'react';

// This is a fake router for documentation purposes. In a real app, you would
// use a routing library like React Router or a framework like Next.js.
const NavigateContext = createContext<(href: string) => void>(() => {});

export function Link(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  let navigate = useContext(NavigateContext);

  return (
    <a
      {...props}
      onClick={e => {
        props.onClick?.(e);
        if (props.href) {
          e.preventDefault();
          navigate(props.href);
        }
      }}
      onKeyDown={e => {
        props.onKeyDown?.(e);
        if (e.key === 'Enter' && props.href) {
          e.preventDefault();
          navigate(props.href);
        }
      }}
    />
  );
}

export function Router(props: {
  children: ({selectedRoute}: {selectedRoute: string}) => ReactNode;
  defaultSelectedRoute: string;
}) {
  let [selectedRoute, setSelectedRoute] = useState(props.defaultSelectedRoute);
  return (
    <NavigateContext.Provider value={setSelectedRoute}>
      {props.children({selectedRoute})}
    </NavigateContext.Provider>
  );
}
