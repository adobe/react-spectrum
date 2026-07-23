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
import {DropTargetDelegate, ItemDropTarget, Key, Node} from '@react-types/shared';
import {
  Layout,
  LayoutInfo,
  ReusableView,
  useVirtualizerState,
  VirtualizerState
} from 'react-stately/useVirtualizerState';
import React, {createContext, JSX, ReactNode, useContext, useMemo} from 'react';
import {useScrollView} from 'react-aria/private/virtualizer/ScrollView';
import {VirtualizerItem} from 'react-aria/private/virtualizer/VirtualizerItem';

type View = ReusableView<Node<unknown>, ReactNode>;

export interface LayoutOptionsDelegate<O> {
  useLayoutOptions?(): O;
}

interface ILayout<O>
  extends Layout<Node<unknown>, O>, Partial<DropTargetDelegate>, LayoutOptionsDelegate<O> {
  /**
   * A default item renderer supplied by the layout itself. Used when the `renderItem`
   * prop is not provided, so layouts with special item requirements (e.g. tables that
   * position cells via CSS variables) work correctly without callers wiring it up.
   */
  renderItem?: (props: VirtualizerItemRenderProps) => ReactNode;
}

interface LayoutClass<O> {
  new (): ILayout<O>;
}

export interface VirtualizerItemRenderProps {
  viewKey: Key;
  layoutInfo: LayoutInfo;
  virtualizer: ReusableView<Node<unknown>, ReactNode>['virtualizer'];
  parent: LayoutInfo | null;
  children: ReactNode;
  content: Node<unknown> | null;
}

export interface VirtualizerProps<O> {
  /** The child collection to virtualize (e.g. ListBox, GridList, or Table). */
  children: ReactNode;
  /** The layout object that determines the position and size of the visible elements. */
  layout: LayoutClass<O> | ILayout<O>;
  /** Options for the layout. */
  layoutOptions?: O;
  /**
   * A custom renderer for virtualizer items. When not provided, items are wrapped in
   * the default `VirtualizerItem` component.
   */
  renderItem?: (props: VirtualizerItemRenderProps) => ReactNode;
}

interface LayoutContextValue {
  layout: ILayout<any>;
  layoutOptions?: any;
  renderItem?: (props: VirtualizerItemRenderProps) => ReactNode;
}

const VirtualizerContext = createContext<VirtualizerState<any, any> | null>(null);
const LayoutContext = createContext<LayoutContextValue | null>(null);

function defaultRenderItem(props: VirtualizerItemRenderProps): ReactNode {
  return (
    <VirtualizerItem
      key={props.viewKey}
      layoutInfo={props.layoutInfo}
      virtualizer={props.virtualizer}
      parent={props.parent}>
      {props.children}
    </VirtualizerItem>
  );
}

/**
 * A Virtualizer renders a scrollable collection of data using customizable layouts.
 * It supports very large collections by only rendering visible items to the DOM, reusing
 * them as the user scrolls.
 */
export function Virtualizer<O>(props: VirtualizerProps<O>): JSX.Element {
  let {children, layout: layoutProp, layoutOptions, renderItem} = props;
  let layout = useMemo(
    () => (typeof layoutProp === 'function' ? new layoutProp() : layoutProp),
    [layoutProp]
  );
  let renderer: CollectionRenderer = useMemo(
    () => ({
      isVirtualized: true,
      layoutDelegate: layout,
      dropTargetDelegate: layout.getDropTargetFromPoint
        ? (layout as DropTargetDelegate)
        : undefined,
      CollectionRoot,
      CollectionBranch
    }),
    [layout]
  );

  return (
    <CollectionRendererContext.Provider value={renderer}>
      <LayoutContext.Provider
        value={{layout, layoutOptions, renderItem: renderItem ?? layout.renderItem}}>
        {children}
      </LayoutContext.Provider>
    </CollectionRendererContext.Provider>
  );
}

function CollectionRoot({
  collection,
  persistedKeys,
  scrollRef,
  renderDropIndicator
}: CollectionRootProps) {
  let {layout, layoutOptions, renderItem} = useContext(LayoutContext)!;
  // oxlint-disable-next-line react/react-compiler
  let layoutOptions2 = layout.useLayoutOptions?.();
  let state = useVirtualizerState({
    allowsWindowScrolling: true,
    layout,
    collection,
    renderView: (type, item) => {
      return item?.render?.(item);
    },
    onVisibleRectChange(rect) {
      let element = scrollRef?.current;
      if (element) {
        // oxlint-disable-next-line react/react-compiler
        element.scrollLeft = rect.x;
        element.scrollTop = rect.y;
      }
    },
    persistedKeys,
    layoutOptions: useMemo(() => {
      if (layoutOptions && layoutOptions2) {
        return {...layoutOptions, ...layoutOptions2};
      }
      return layoutOptions || layoutOptions2;
    }, [layoutOptions, layoutOptions2])
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
        {renderChildren(null, state.visibleViews, renderDropIndicator, renderItem)}
      </VirtualizerContext.Provider>
    </div>
  );
}

function CollectionBranch({parent, renderDropIndicator}: CollectionBranchProps) {
  let virtualizer = useContext(VirtualizerContext);
  let {renderItem} = useContext(LayoutContext)!;
  let parentView = virtualizer!.virtualizer.getVisibleView(parent.key)!;
  return renderChildren(
    parentView,
    Array.from(parentView.children),
    renderDropIndicator,
    renderItem
  );
}

function renderChildren(
  parent: View | null,
  children: View[],
  renderDropIndicator?: (target: ItemDropTarget) => ReactNode,
  renderItem?: (props: VirtualizerItemRenderProps) => ReactNode
) {
  return children.map(view => renderWrapper(parent, view, renderDropIndicator, renderItem));
}

function renderWrapper(
  parent: View | null,
  reusableView: View,
  renderDropIndicator?: (target: ItemDropTarget) => ReactNode,
  renderItem: (props: VirtualizerItemRenderProps) => ReactNode = defaultRenderItem
): ReactNode {
  let rendered = renderItem({
    viewKey: reusableView.key,
    layoutInfo: reusableView.layoutInfo!,
    virtualizer: reusableView.virtualizer,
    parent: parent?.layoutInfo ?? null,
    children: reusableView.rendered,
    content: reusableView.content
  });

  let {collection, layout} = reusableView.virtualizer;
  let node = reusableView.content;
  if (node?.type === 'item' && renderDropIndicator && layout.getDropTargetLayoutInfo) {
    rendered = (
      <React.Fragment key={reusableView.key}>
        {renderDropIndicatorWrapper(
          parent,
          reusableView,
          {type: 'item', key: reusableView.content!.key, dropPosition: 'before'},
          renderDropIndicator,
          renderItem
        )}
        {rendered}
        {renderAfterDropIndicators(collection, node, target =>
          renderDropIndicatorWrapper(parent, reusableView, target, renderDropIndicator, renderItem)
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
  renderDropIndicator: (target: ItemDropTarget) => ReactNode,
  renderItem: (props: VirtualizerItemRenderProps) => ReactNode = defaultRenderItem
) {
  let indicator = renderDropIndicator(target);
  if (indicator) {
    let layoutInfo = reusableView.virtualizer.layout.getDropTargetLayoutInfo!(target);
    indicator = renderItem({
      viewKey: `${reusableView.key}-drop-${target.dropPosition}`,
      layoutInfo,
      virtualizer: reusableView.virtualizer,
      parent: parent?.layoutInfo ?? null,
      children: indicator,
      content: null
    });
  }

  return indicator;
}
