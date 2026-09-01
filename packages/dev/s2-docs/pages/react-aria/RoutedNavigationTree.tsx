'use client';
import React, {ReactNode, useState, createContext, useContext} from 'react';

let NavigateContext = createContext<(href: string) => void>(() => {});

export function Link(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  let navigate = useContext(NavigateContext);
  return (
    <a
      {...props}
      onClick={e => {
        e.preventDefault();
        props.onClick?.(e);
        if (props.href) {
          navigate(props.href);
        }
      }}
    />
  );
}

export function RoutedNavigationTree(props: {
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
