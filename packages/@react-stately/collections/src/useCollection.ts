/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Collection, CollectionBase, Node} from '@react-types/shared';
import {CollectionBuilder} from './CollectionBuilder';
import {useMemo} from 'react';

type CollectionFactory<T, C extends Collection<Node<T>>> = (node: Iterable<Node<T>>) => C;

export function useCollection<T extends object, C extends Collection<Node<T>> = Collection<Node<T>>>(props: CollectionBase<T>, factory: CollectionFactory<T, C>, context?: unknown, invalidators: Array<any> = []): C {
  let builder = useMemo(() => new CollectionBuilder<T>(), []);
  let {children, items} = props;
  let nodes = useMemo(() => builder.build({children, items}, context), [builder, children, items, context, ...invalidators]);
  let collection = useMemo(() => factory(nodes), [nodes, factory]);
  return collection;
}
