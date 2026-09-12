'use client';
import React, {ReactNode, useState, createContext, useContext} from 'react';
import {mergeProps} from 'react-aria/mergeProps';

// This is a fake router for documentation purposes. In a real app, you would
// use a routing library like React Router or a framework like Next.js.
const NavigateContext = createContext<(href: string) => void>(() => {});

export function Link(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  let navigate = useContext(NavigateContext);

  let onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (props.href) {
      e.preventDefault();
      navigate(props.href);
    }
  };

  let onKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === 'Enter' && props.href) {
      e.preventDefault();
      navigate(props.href);
    }
  };

  return <a {...mergeProps(props, {onClick, onKeyDown})} />;
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
