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

import {
  CollectionBranchProps,
  CollectionRenderer,
  CollectionRendererContext,
  CollectionRootProps,
  renderAfterDropIndicators
} from './Collection';
import {
  DropTargetDelegate,
  ItemDropTarget,
  Key,
  Node,
  RefObject,
  ScrollDelegate
} from '@react-types/shared';
import {flushSync} from 'react-dom';
import {
  Layout,
  ReusableView,
  useVirtualizerState,
  VirtualizerState
} from 'react-stately/useVirtualizerState';
import React, {
  createContext,
  JSX,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react';
import {scrollIntoView} from 'react-aria/private/utils/scrollIntoView';
import {useScrollView} from 'react-aria/private/virtualizer/ScrollView';
import {useSyncRef} from 'react-aria/private/utils/useSyncRef';
import {VirtualizerItem} from 'react-aria/private/virtualizer/VirtualizerItem';

type View = ReusableView<Node<unknown>, ReactNode>;

export interface LayoutOptionsDelegate<O> {
  useLayoutOptions?(): O;
}

interface ILayout<O>
  extends Layout<Node<unknown>, O>, Partial<DropTargetDelegate>, LayoutOptionsDelegate<O> {}

interface LayoutClass<O> {
  new (): ILayout<O>;
}

export interface VirtualizerProps<O> {
  /** The child collection to virtualize (e.g. ListBox, GridList, or Table). */
  children: ReactNode;
  /** The layout object that determines the position and size of the visible elements. */
  layout: LayoutClass<O> | ILayout<O>;
  /** Options for the layout. */
  layoutOptions?: O;
  /**
   * Whether to observe each item's size with a ResizeObserver and re-measure when it changes.
   */
  shouldObserveItemSize?: boolean;
}

interface VirtualizerOptionsContextValue {
  layout: ILayout<any>;
  layoutOptions?: any;
  shouldObserveItemSize?: boolean;
  ref: RefObject<HTMLElement | null>;
  rendered: Map<Key, Element>;
  persistedKeys: Set<Key>;
}

const VirtualizerContext = createContext<VirtualizerState<any, any> | null>(null);
const VirtualizerOptionsContext = createContext<VirtualizerOptionsContextValue | null>(null);

/**
 * A Virtualizer renders a scrollable collection of data using customizable layouts.
 * It supports very large collections by only rendering visible items to the DOM, reusing
 * them as the user scrolls.
 */
export function Virtualizer<O>(props: VirtualizerProps<O>): JSX.Element {
  let {children, layout: layoutProp, layoutOptions, shouldObserveItemSize} = props;
  let ref = useRef<HTMLElement | null>(null);
  let layout = useMemo(
    () => (typeof layoutProp === 'function' ? new layoutProp() : layoutProp),
    [layoutProp]
  );

  let [rendered] = useState<Map<Key, Element>>(() => new Map());
  let [persistedKeys, setPersistedKeys] = useState<Set<Key>>(() => new Set());

  let render = useCallback((type: string, node: Node<unknown>) => {
    setPersistedKeys(keys => keys.union(new Set([node.key])));
    return () => setPersistedKeys(keys => keys.difference(new Set([node.key])));
  }, []);

  // TODO(later): Unpersist after scroll once scrollIntoView is promisified.
  let scrollTarget = useRef<Function | null>(null);
  let scrollDelegate = useMemo<ScrollDelegate>(
    () => ({
      async scrollIntoView(key: Key, options?: ScrollIntoViewOptions) {
        let container = ref.current;
        let virtualizer = layout.virtualizer;

        let item = virtualizer?.collection.getItem(key);

        if (container == null || item == null) {
          return {interrupted: false};
        }

        scrollTarget.current?.();
        scrollTarget.current = flushSync(() => render(item.type, item));

        let target = rendered.get(key);
        if (target instanceof HTMLElement) {
          scrollIntoView(container, target, options);
        }

        return {interrupted: false};
      }
    }),
    [layout, render, rendered]
  );

  let renderer: CollectionRenderer = useMemo(
    () => ({
      isVirtualized: true,
      layoutDelegate: layout,
      scrollDelegate: scrollDelegate,
      dropTargetDelegate: layout.getDropTargetFromPoint
        ? (layout as DropTargetDelegate)
        : undefined,
      CollectionRoot,
      CollectionBranch
    }),
    [layout, scrollDelegate]
  );

  return (
    <CollectionRendererContext.Provider value={renderer}>
      <VirtualizerOptionsContext.Provider
        value={{layout, layoutOptions, shouldObserveItemSize, ref, persistedKeys, rendered}}>
        {children}
      </VirtualizerOptionsContext.Provider>
    </CollectionRendererContext.Provider>
  );
}

function CollectionRoot({
  collection,
  persistedKeys,
  scrollRef,
  renderDropIndicator
}: CollectionRootProps) {
  let {
    layout,
    layoutOptions,
    shouldObserveItemSize,
    persistedKeys: persistedKeys2,
    ref: ref,
    rendered
  } = useContext(VirtualizerOptionsContext)!;
  useSyncRef({ref}, scrollRef);
  // oxlint-disable-next-line react/react-compiler
  let layoutOptions2 = layout.useLayoutOptions?.();
  let state = useVirtualizerState({
    allowsWindowScrolling: true,
    layout,
    collection,
    renderView: (type, item) => {
      return item?.render?.(item, element => {
        if (element) {
          rendered.set(item.key, element);
        } else {
          rendered.delete(item.key);
        }
      });
    },
    onVisibleRectChange(rect) {
      let element = scrollRef?.current;
      if (element) {
        // oxlint-disable-next-line react/react-compiler
        element.scrollLeft = rect.x;
        element.scrollTop = rect.y;
      }
    },
    persistedKeys: useMemo(
      () =>
        persistedKeys && persistedKeys2
          ? persistedKeys.union(persistedKeys2)
          : persistedKeys || persistedKeys2,
      [persistedKeys, persistedKeys2]
    ),
    layoutOptions: useMemo(
      () =>
        layoutOptions && layoutOptions2
          ? {...layoutOptions, ...layoutOptions2}
          : layoutOptions || layoutOptions2,
      [layoutOptions, layoutOptions2]
    )
  });

  let {contentProps} = useScrollView(
    {
      onVisibleRectChange: state.setVisibleRect,
      onSizeChange: state.setSize,
      contentSize: state.contentSize,
      onScrollStart: state.startScrolling,
      onScrollEnd: state.endScrolling,
      allowsWindowScrolling: true
    },
    scrollRef!
  );

  return (
    <div {...contentProps}>
      <VirtualizerContext.Provider value={state}>
        {renderChildren(null, state.visibleViews, renderDropIndicator, shouldObserveItemSize)}
      </VirtualizerContext.Provider>
    </div>
  );
}

function CollectionBranch({parent, renderDropIndicator}: CollectionBranchProps) {
  let virtualizer = useContext(VirtualizerContext);
  let parentView = virtualizer!.virtualizer.getVisibleView(parent.key)!;
  let {shouldObserveItemSize} = useContext(VirtualizerOptionsContext)!;
  return renderChildren(
    parentView,
    Array.from(parentView.children),
    renderDropIndicator,
    shouldObserveItemSize
  );
}

function renderChildren(
  parent: View | null,
  children: View[],
  renderDropIndicator?: (target: ItemDropTarget) => ReactNode,
  shouldObserveItemSize?: boolean
) {
  return children.map(view =>
    renderWrapper(parent, view, renderDropIndicator, shouldObserveItemSize)
  );
}

function renderWrapper(
  parent: View | null,
  reusableView: View,
  renderDropIndicator?: (target: ItemDropTarget) => ReactNode,
  shouldObserveItemSize?: boolean
): ReactNode {
  let rendered = (
    <VirtualizerItem
      key={reusableView.key}
      layoutInfo={reusableView.layoutInfo!}
      virtualizer={reusableView.virtualizer}
      parent={parent?.layoutInfo}
      shouldObserveItemSize={shouldObserveItemSize}>
      {reusableView.rendered}
    </VirtualizerItem>
  );

  let {collection, layout} = reusableView.virtualizer;
  let node = reusableView.content;
  if (node?.type === 'item' && renderDropIndicator && layout.getDropTargetLayoutInfo) {
    rendered = (
      <React.Fragment key={reusableView.key}>
        {renderDropIndicatorWrapper(
          parent,
          reusableView,
          {type: 'item', key: reusableView.content!.key, dropPosition: 'before'},
          renderDropIndicator
        )}
        {rendered}
        {renderAfterDropIndicators(collection, node, target =>
          renderDropIndicatorWrapper(parent, reusableView, target, renderDropIndicator)
        )}
      </React.Fragment>
    );
  }

  return rendered;
}

function renderDropIndicatorWrapper(
  parent: View | null,
  reusableView: View,
  target: ItemDropTarget,
  renderDropIndicator: (target: ItemDropTarget) => ReactNode
) {
  let indicator = renderDropIndicator(target);
  if (indicator) {
    let layoutInfo = reusableView.virtualizer.layout.getDropTargetLayoutInfo!(target);
    indicator = (
      <VirtualizerItem
        layoutInfo={layoutInfo}
        virtualizer={reusableView.virtualizer}
        parent={parent?.layoutInfo}>
        {indicator}
      </VirtualizerItem>
    );
  }

  return indicator;
}
