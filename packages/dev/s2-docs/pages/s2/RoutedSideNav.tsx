'use client';
import {RouterProvider} from 'react-aria-components';
import React, {ReactNode, useState} from 'react';

export function RoutedSideNav(props: {
  children: ({selectedRoute}: {selectedRoute: string | undefined}) => ReactNode;
  defaultSelectedRoute?: string;
}) {
  let {children} = props;
  let [selectedRoute, setSelectedRoute] = useState<string | undefined>(props.defaultSelectedRoute);

  let updateSelection = (href: string) => {
    setSelectedRoute(href);
  };

  return <RouterProvider navigate={updateSelection}>{children({selectedRoute})}</RouterProvider>;
}
