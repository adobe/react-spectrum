'use client';
import {RouterProvider} from 'react-aria-components';
import React, {ReactNode, useState} from 'react';

export function RoutedSideNav(props: {children: ReactNode; defaultSelectedRoute?: string}) {
  let {children} = props;
  let [selectedRoute, setSelectedRoute] = useState<string | undefined>(props.defaultSelectedRoute);

  let updateSelection = (href: string) => {
    setSelectedRoute(href);
  };

  return (
    <RouterProvider navigate={updateSelection}>
      {/** Use cloneElement as an example only. */}
      {React.cloneElement(
        React.Children.toArray(children)[0] as React.ReactElement,
        {selectedRoute: selectedRoute} as any
      )}
    </RouterProvider>
  );
}
