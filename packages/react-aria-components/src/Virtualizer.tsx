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

import {CollectionRenderer, CollectionRendererContext} from './Collection';
import {DropTargetDelegate, Node} from '@react-types/shared';
import {Layout, ReusableView, useVirtualizerState} from '@react-stately/virtualizer';
import React, {ReactNode, useContext, useMemo} from 'react';
import {useScrollView, VirtualizerContext, VirtualizerItem} from '@react-aria/virtualizer';

export interface LayoutOptionsDelegate<O> {
  useLayoutOptions?(): O
}

interface ILayout<O> extends Layout<Node<unknown>, O>, Partial<DropTargetDelegate>, LayoutOptionsDelegate<O> {}

export interface VirtualizerProps {
  children: ReactNode,
  layout: ILayout<any>
}

export function Virtualizer(props: VirtualizerProps) {
  let {children, layout} = props;
  let renderer: CollectionRenderer = useMemo(() => ({
    isVirtualized: true,
    layoutDelegate: layout,
    dropTargetDelegate: layout.getDropTargetFromPoint ? layout as DropTargetDelegate : undefined,
    CollectionRoot({collection, focusedKey, scrollRef}) {
      let layoutOptions = layout.useLayoutOptions?.();
      let state = useVirtualizerState({
        layout,
        collection,
        renderView: (type, item) => {
          return item?.render?.(item);
        },
        renderWrapper,
        onVisibleRectChange(rect) {
          scrollRef!.current!.scrollLeft = rect.x;
          scrollRef!.current!.scrollTop = rect.y;
        },
        persistedKeys: useMemo(() => focusedKey != null ? new Set([focusedKey]) : new Set(), [focusedKey]),
        layoutOptions
      });

      let {contentProps} = useScrollView({
        onVisibleRectChange: state.setVisibleRect,
        contentSize: state.contentSize,
        onScrollStart: state.startScrolling,
        onScrollEnd: state.endScrolling
      }, scrollRef!);

      if (state.contentSize.area === 0) {
        return null;
      }

      return (
        <div {...contentProps}>
          <VirtualizerContext.Provider value={state}>
            {state.visibleViews}
          </VirtualizerContext.Provider>
        </div>
      );
    },
    CollectionBranch({parent}) {
      let virtualizer = useContext(VirtualizerContext);
      return virtualizer!.virtualizer.getChildren(parent.key);
    }
  }), [layout]);  

  return (
    <CollectionRendererContext.Provider value={renderer}>
      {children}
    </CollectionRendererContext.Provider>
  );
}

function renderWrapper<T extends object, V extends ReactNode>(
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
