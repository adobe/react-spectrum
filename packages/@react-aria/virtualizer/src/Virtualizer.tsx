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

import {Collection, Key, RefObject} from '@react-types/shared';
import {Layout, Rect, ReusableView, useVirtualizerState} from '@react-stately/virtualizer';
import {mergeProps, useLoadMore, useObjectRef} from '@react-aria/utils';
import React, {ForwardedRef, HTMLAttributes, ReactElement, ReactNode, useCallback} from 'react';
import {ScrollView} from './ScrollView';
import {VirtualizerItem} from './VirtualizerItem';

type RenderWrapper<T extends object, V> = (
  parent: ReusableView<T, V> | null,
  reusableView: ReusableView<T, V>,
  children: ReusableView<T, V>[],
  renderChildren: (views: ReusableView<T, V>[]) => ReactElement[]
) => ReactElement | null;

interface VirtualizerProps<T extends object, V, O> extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  children: (type: string, content: T) => V,
  renderWrapper?: RenderWrapper<T, V>,
  layout: Layout<T, O>,
  collection: Collection<T>,
  persistedKeys?: Set<Key> | null,
  scrollDirection?: 'horizontal' | 'vertical' | 'both',
  isLoading?: boolean,
  onLoadMore?: () => void,
  layoutOptions?: O
}

// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref
export const Virtualizer = React.forwardRef(function Virtualizer<T extends object, V extends ReactNode, O>(props: VirtualizerProps<T, V, O>, forwardedRef: ForwardedRef<HTMLDivElement | null>) {
  let {
    children: renderView,
    renderWrapper,
    layout,
    collection,
    scrollDirection,
    isLoading,
    onLoadMore,
    persistedKeys,
    layoutOptions,
    ...otherProps
  } = props;

  let ref = useObjectRef(forwardedRef);

  let state = useVirtualizerState({
    layout,
    collection,
    renderView,
    onVisibleRectChange(rect) {
      if (ref.current) {
        ref.current.scrollLeft = rect.x;
        ref.current.scrollTop = rect.y;
      }
    },
    persistedKeys,
    layoutOptions
  });

  useLoadMore({isLoading, onLoadMore, scrollOffset: 1}, ref);
  let onVisibleRectChange = useCallback((rect: Rect) => {
    state.setVisibleRect(rect);
  }, [state]);

  return (
    <ScrollView
      {...mergeProps(otherProps, {onVisibleRectChange})}
      ref={ref}
      contentSize={state.contentSize}
      onScrollStart={state.startScrolling}
      onScrollEnd={state.endScrolling}
      scrollDirection={scrollDirection}>
      {renderChildren(null, state.visibleViews, renderWrapper || defaultRenderWrapper)}
    </ScrollView>
  );
}) as <T extends object, V, O>(props: VirtualizerProps<T, V, O> & {ref?: RefObject<HTMLDivElement | null>}) => ReactElement;

function renderChildren<T extends object, V>(parent: ReusableView<T, V> | null, views: ReusableView<T, V>[], renderWrapper: RenderWrapper<T, V>) {
  return views.map(view => {
    return renderWrapper(
      parent,
      view,
      view.children ? Array.from(view.children) : [],
      childViews => renderChildren(view, childViews, renderWrapper)
    );
  });
}

function defaultRenderWrapper<T extends object, V extends ReactNode>(
  parent: ReusableView<T, V> | null,
  reusableView: ReusableView<T, V>
) {
  return (
    <VirtualizerItem
      key={reusableView.key}
      layoutInfo={reusableView.layoutInfo!}
      virtualizer={reusableView.virtualizer}
      parent={parent?.layoutInfo}>
      {reusableView.rendered}
    </VirtualizerItem>
  );
}
