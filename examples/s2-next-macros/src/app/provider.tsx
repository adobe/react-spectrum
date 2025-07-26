'use client';

import {useRouter} from 'next/navigation';
import {RouterProvider} from 'react-aria-components';

declare module 'react-aria-components' {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>['push']>[1]
    >;
  }
}

import { ReactNode } from 'react';

export function ClientProviders({ children }: { children: ReactNode }) {
  let router = useRouter();

  return (
    <RouterProvider navigate={router.push}>
      {children}
    </RouterProvider>
  );
}