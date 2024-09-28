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

import {createLeafComponent} from '@react-aria/collections';
import {ReactNode} from 'react';
import {Skeleton} from './Skeleton';

export interface SkeletonCollectionProps {
  children: () => ReactNode
}

let cache = new WeakMap();

/**
 * A SkeletonCollection generates placeholder content within a collection component such as CardView.
 */
export const SkeletonCollection = createLeafComponent('skeleton', (props: SkeletonCollectionProps, ref, node) => {
  // Cache rendering based on node object identity. This allows the children function to randomize
  // its content (e.g. heights) and preserve on re-renders.
  // TODO: do we need a `dependencies` prop here?
  let cached = cache.get(node);
  if (!cached) {
    cached = (
      <Skeleton isLoading>
        {props.children()}
      </Skeleton>
    );
    cache.set(node, cached);
  }
  return cached;
});
