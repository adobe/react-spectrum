'use client';

import {useRouter} from 'next/navigation';
import {RouterProvider} from 'react-aria-components';
import { ReactNode } from 'react';
import { Provider } from '@react-spectrum/s2';
declare module 'react-aria-components' {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>['push']>[1]
    >;
  }
}

export function ClientProviders({ children }: { children: ReactNode }) {
  let router = useRouter();

  return (
    <Provider elementType="html" locale="en-US">
      <body>
        <RouterProvider navigate={router.push}>
          {children}
        </RouterProvider>
      </body>
    </Provider>
  );
}