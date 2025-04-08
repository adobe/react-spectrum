/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RegisteredRouter,
  RouterProvider as TanstackRouterProvider,
  useRouter,
  ValidateNavigateOptions
} from '@tanstack/react-router';
import {Link, RouterProvider} from 'react-aria-components';
import React from 'react';

export default {
  title: 'React Aria Components'
};

const history = createMemoryHistory();
const rootRoute = createRootRoute({
  component: () => <LinkTanstackRouterAriaProvider />
});
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => 'Index'
});
const dynamicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$dynamic',
  component: () => 'Dynamic'
});
const routeTree = rootRoute.addChildren([indexRoute, dynamicRoute]);
const router = createRouter({
  routeTree,
  history
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

declare module '@adobe/react-spectrum' {
  interface RouterConfig {
    href: ValidateNavigateOptions<RegisteredRouter, unknown>['to'],
    routerOptions: Omit<
      ValidateNavigateOptions<RegisteredRouter, unknown>,
      'to'
    >
  }
}

const LinkTanstackRouterAriaProvider = () => {
  const router = useRouter();

  return (
    <RouterProvider
      navigate={(to, options) => router.navigate({to, ...options})}
      useHref={(to, options) => router.buildLocation({to, ...options}).href}>
      <nav>
        <Link href="/">Index Link</Link> |
        <Link href="/$dynamic" routerOptions={{params: {dynamic: 'test'}}}>
          Dynamic Link
        </Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </RouterProvider>
  );
};

export const LinkTanstackRouterInternal = () => {
  return <TanstackRouterProvider router={router} />;
};
