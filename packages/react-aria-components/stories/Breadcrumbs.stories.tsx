/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Breadcrumb, Breadcrumbs, Link} from 'react-aria-components';
import React from 'react';

export default {
  title: 'React Aria Components',
  component: Breadcrumbs
};

export const BreadcrumbsExample = (args: any) => (
  <Breadcrumbs {...args}>
    <Breadcrumb>
      <Link href="/">Home</Link>
    </Breadcrumb>
    <Breadcrumb>
      <Link href="/react-aria">React Aria</Link>
    </Breadcrumb>
    <Breadcrumb>
      <Link href="/react-aria">Breadcrumbs</Link>
    </Breadcrumb>
  </Breadcrumbs>
);

interface ItemValue {
  id: string,
  url: string
}
let items: Array<ItemValue> = [
  {id: 'Home', url: '/'},
  {id: 'React Aria', url: '/react-aria'},
  {id: 'Breadcrumbs', url: '/react-aria/breadcrumbs'}
];

export const DynamicBreadcrumbsExample = (args: any) => (
  <Breadcrumbs {...args} items={items}>
    {(item: ItemValue) => (
      <Breadcrumb>
        <Link href={item.url}>{item.id}</Link>
      </Breadcrumb>
    )}
  </Breadcrumbs>
);
