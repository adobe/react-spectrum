/*
 * Copyright 2026 Adobe. All rights reserved.
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
  ChildrenOrFunction,
  ClassNameOrFunction,
  ContextValue,
  dom,
  Provider,
  StyleRenderProps,
  useContextProps
} from './utils';
import {Collection, forwardRefType, Key, Node, RouterOptions} from '@react-types/shared';
import {getScrollParent} from 'react-aria/private/utils/getScrollParent';
import {LinkContext} from './Link';
import {nodeContains} from 'react-aria/private/utils/shadowdom/DOMFunctions';
import React, {
  createContext,
  ForwardedRef,
  forwardRef,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {scrollIntoView} from 'react-aria/private/utils/scrollIntoView';
import {
  Tree,
  TreeHeader,
  TreeHeaderProps,
  TreeItem,
  TreeItemContent,
  TreeItemContentRenderProps,
  TreeItemProps,
  TreeItemRenderProps,
  TreeProps,
  TreeRenderProps,
  TreeSection,
  TreeSectionProps
} from './Tree';
import {TreeState} from 'react-stately/useTreeState';
import {useObjectRef} from 'react-aria/useObjectRef';

export const NavigationTreeContext =
  createContext<ContextValue<NavigationTreeProps<any>, HTMLDivElement>>(null);

interface InternalNavigationTreeContextValue {
  /** The route that is currently selected. */
  selectedRoute?: string | null;
  /** The last route the focused key was synced to; dedupes the focus sync across items. */
  syncedRouteRef?: RefObject<string | undefined>;
  /** The NavigationTree's root element, used to keep current-route scrolling inside the tree. */
  treeRef?: RefObject<HTMLDivElement | null>;
}
const InternalNavigationTreeContext = createContext<InternalNavigationTreeContextValue>({});

interface NavigationTreeItemLinkContextValue {
  href?: string;
  hrefLang?: string;
  target?: string;
  rel?: string;
  download?: string | boolean;
  ping?: string;
  referrerPolicy?: ReferrerPolicy;
  routerOptions?: RouterOptions;
  isCurrent?: boolean;
  // Whether the item's link (as opposed to another focusable child such as a button) is focused.
  isLinkFocused?: boolean;
  setLinkFocused?: (isFocused: boolean) => void;
}
const NavigationTreeItemLinkContext = createContext<NavigationTreeItemLinkContextValue>({});

export const NavigationTreeItemStateContext = createContext<{isCurrentAncestor: boolean}>({
  isCurrentAncestor: false
});

export interface NavigationTreeRenderProps extends Pick<
  TreeRenderProps,
  'isEmpty' | 'isFocused' | 'isFocusVisible' | 'state'
> {}

export interface NavigationTreeProps<T>
  extends
    Omit<
      TreeProps<T>,
      | 'selectionMode'
      | 'selectionBehavior'
      | 'selectedKeys'
      | 'defaultSelectedKeys'
      | 'onSelectionChange'
      | 'disallowEmptySelection'
      | 'disabledBehavior'
      | 'keyboardNavigationBehavior'
      | 'escapeKeyBehavior'
      | 'shouldSelectOnPressUp'
      | 'dragAndDropHooks'
      | 'renderEmptyState'
      | 'onAction'
      | 'className'
      | 'style'
      | 'render'
    >,
    StyleRenderProps<NavigationTreeRenderProps> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-NavigationTree'
   */
  className?: ClassNameOrFunction<NavigationTreeRenderProps>;
  /** The route that is currently selected, matched against each item's `href`. */
  selectedRoute?: string | null;
}

/**
 * A NavigationTree provides users with a way to navigate a nested, hierarchical set of links.
 */
export const NavigationTree = /*#__PURE__*/ (forwardRef as forwardRefType)(function NavigationTree<
  T
>(props: NavigationTreeProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, NavigationTreeContext);
  let {className, style, children, selectedRoute, ...rest} = props;
  let syncedRouteRef = useRef<string | undefined>(undefined);
  let treeRef = useObjectRef(ref);
  let context = useMemo(() => ({selectedRoute, syncedRouteRef, treeRef}), [selectedRoute, treeRef]);

  return (
    <InternalNavigationTreeContext.Provider value={context}>
      <Tree
        {...rest}
        ref={treeRef}
        className={className ?? 'react-aria-NavigationTree'}
        style={style}
        selectionMode="none"
        keyboardNavigationBehavior="tab">
        {children}
      </Tree>
    </InternalNavigationTreeContext.Provider>
  );
});

export interface NavigationTreeItemRenderProps extends TreeItemRenderProps {
  /**
   * Whether this item is the current route (its `href` matches the NavigationTree's
   * `selectedRoute`).
   *
   * @selector [data-current]
   */
  isCurrent: boolean;
  /**
   * Whether this item is an ancestor of the current-route item (at any level, regardless of whether
   * it is expanded or collapsed).
   *
   * @selector [data-current-ancestor]
   */
  isCurrentAncestor: boolean;
}

export interface NavigationTreeItemProps<T = object>
  extends
    Omit<
      TreeItemProps<T>,
      | 'className'
      | 'style'
      | 'render'
      | 'onAction'
      | 'allowsArrowNavigation'
      | 'focusMode'
      | 'value'
    >,
    StyleRenderProps<NavigationTreeItemRenderProps> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-NavigationTreeItem'
   */
  className?: ClassNameOrFunction<NavigationTreeItemRenderProps>;
  /**
   * The content of the side nav item along with any nested children. Supports static nested side
   * nav items or use of a Collection to dynamically render nested side nav items.
   */
  children: ReactNode;
}

/**
 * A NavigationTreeItem represents an individual item in a NavigationTree.
 */
export const NavigationTreeItem = /*#__PURE__*/ (forwardRef as forwardRefType)(
  function NavigationTreeItem<T extends object>(
    props: NavigationTreeItemProps<T>,
    ref: ForwardedRef<HTMLDivElement>
  ) {
    let {
      href,
      hrefLang,
      target,
      rel,
      download,
      ping,
      referrerPolicy,
      routerOptions,
      className,
      style,
      render,
      ...rest
    } = props;
    let {selectedRoute, treeRef} = useContext(InternalNavigationTreeContext);
    let hasLink = href != null && href.length > 0;
    let isCurrent = hasLink && href === selectedRoute;
    let [isLinkFocused, setLinkFocused] = useState(false);
    // Additional render props NavigationTreeItem adds to what TreeItem already provides.
    let getItemRenderProps = <R extends TreeItemRenderProps>(
      renderProps: R
    ): R & {isCurrent: boolean; isCurrentAncestor: boolean} => ({
      ...renderProps,
      isCurrent,
      isCurrentAncestor: hasSelectedDescendant(renderProps.id, renderProps.state, selectedRoute),
      isFocusVisible:
        renderProps.isFocusVisible || (renderProps.isFocusVisibleWithin && isLinkFocused)
    });

    let objRef = useObjectRef(ref);
    useEffect(() => {
      if (isCurrent && objRef.current) {
        let scrollParent = getScrollParent(objRef.current, true) as HTMLElement;
        // Only scroll the tree's own scroll container into view — never an outer ancestor such as the
        // page. When the tree isn't its own scroll container the nearest scroll parent is outside the
        // tree, so we skip rather than hijack the surrounding scroll position.
        let treeRoot = treeRef?.current;
        if (treeRoot && nodeContains(treeRoot, scrollParent)) {
          scrollIntoView(scrollParent, objRef.current, {block: 'center'});
        }
      }
    }, [isCurrent, objRef, treeRef]);

    return (
      <NavigationTreeItemLinkContext.Provider
        value={{
          href,
          hrefLang,
          target,
          rel,
          download,
          ping,
          referrerPolicy,
          routerOptions,
          isCurrent,
          isLinkFocused,
          setLinkFocused
        }}>
        <TreeItem
          {...rest}
          ref={objRef}
          href={href}
          focusMode={hasLink ? 'child' : undefined}
          allowsArrowNavigation
          data-current={isCurrent || undefined}
          className={
            typeof className === 'function'
              ? renderProps => className(getItemRenderProps(renderProps))
              : (className ?? 'react-aria-NavigationTreeItem')
          }
          style={
            typeof style === 'function'
              ? renderProps => style(getItemRenderProps(renderProps))
              : style
          }
          render={(domProps, renderProps) => {
            let values = getItemRenderProps(renderProps);
            let {children: rowChildren, ...domRest} = domProps;
            let dataProps = {
              'data-focus-visible': values.isFocusVisible || undefined,
              'data-current-ancestor': values.isCurrentAncestor || undefined
            };
            let content = (
              <NavigationTreeItemStateContext.Provider
                value={{isCurrentAncestor: values.isCurrentAncestor}}>
                {rowChildren}
              </NavigationTreeItemStateContext.Provider>
            );
            return typeof render === 'function' ? (
              render({...domRest, ...dataProps, children: content}, values)
            ) : (
              <dom.div {...domRest} {...dataProps}>
                {content}
              </dom.div>
            );
          }}
        />
      </NavigationTreeItemLinkContext.Provider>
    );
  }
);

export interface NavigationTreeItemContentRenderProps extends NavigationTreeItemRenderProps {}

export interface NavigationTreeItemContentProps {
  /**
   * The children of the component. A function may be provided to alter the children based on
   * component state.
   */
  children: ChildrenOrFunction<NavigationTreeItemContentRenderProps>;
}

// The collection key of the item whose href matches `route`, or null.
function findKeyForRoute(collection: Collection<Node<unknown>>, route: string): Key | null {
  for (let key of collection.getKeys()) {
    if (collection.getItem(key)?.props?.href === route) {
      return key;
    }
  }
  return null;
}

// Walks up from `key` to the closest ancestor that is actually rendered (all ancestors expanded).
// Returns `key` unchanged when already visible. A collapsed ancestor hides everything beneath it,
// so the highest collapsed ancestor is the closest visible row.
function closestVisibleKey(
  collection: Collection<Node<unknown>>,
  expandedKeys: Set<Key>,
  key: Key
): Key {
  let target = key;
  let node = collection.getItem(key);
  while (node?.parentKey != null) {
    let parent = collection.getItem(node.parentKey);
    if (parent?.type === 'item' && !expandedKeys.has(node.parentKey)) {
      target = node.parentKey;
    }
    node = parent;
  }
  return target;
}

// Moves the tree's focused key to the item matching selectedRoute. Runs when the route or the
// collection changes; the shared syncedRouteRef dedupes across items so it fires once per change.
function useRouteFocusSync({state}: {state: TreeState<unknown>}): void {
  let {selectedRoute, syncedRouteRef} = useContext(InternalNavigationTreeContext);
  let {collection, selectionManager, expandedKeys} = state;
  useEffect(() => {
    if (
      selectedRoute == null ||
      syncedRouteRef == null ||
      syncedRouteRef.current === selectedRoute
    ) {
      return;
    }
    let key = findKeyForRoute(collection, selectedRoute);
    if (key != null) {
      key = closestVisibleKey(collection, expandedKeys, key);
      syncedRouteRef.current = selectedRoute;
      selectionManager.setFocusedKey(key);
    }
  }, [selectedRoute, collection, expandedKeys, syncedRouteRef, selectionManager]);
}

// Cache so each row doesn't have to walk up the tree every time.
let selectedAncestorsCache = new WeakMap<
  Collection<Node<unknown>>,
  {selection: unknown; ancestors: Set<Key>}
>();

// The set of collection keys that are ancestors of the item matching `selectedRoute`.
function getSelectedAncestors(state: TreeState<unknown>, selectedRoute: string): Set<Key> {
  let {collection} = state;
  let cached = selectedAncestorsCache.get(collection);
  if (cached && cached.selection === selectedRoute) {
    return cached.ancestors;
  }
  let matchKey = findKeyForRoute(collection, selectedRoute);
  let ancestors = new Set<Key>();
  let node = matchKey != null ? collection.getItem(matchKey) : null;
  while (node?.parentKey != null && !ancestors.has(node.parentKey)) {
    ancestors.add(node.parentKey);
    node = collection.getItem(node.parentKey);
  }
  selectedAncestorsCache.set(collection, {selection: selectedRoute, ancestors});
  return ancestors;
}

// Whether the row `id` is an ancestor of the item matching `selectedRoute`.
function hasSelectedDescendant(
  id: Key | undefined,
  state: TreeState<unknown>,
  selectedRoute: string | undefined | null
): boolean {
  if (id == null || selectedRoute == null || !state) {
    return false;
  }
  return getSelectedAncestors(state, selectedRoute).has(id);
}

export function NavigationTreeItemContent(props: NavigationTreeItemContentProps): ReactNode {
  let linkCtx = useContext(NavigationTreeItemLinkContext);
  return (
    <TreeItemContent {...props}>
      {(treeRenderProps: TreeItemContentRenderProps & {defaultChildren: ReactNode | undefined}) => (
        <NavigationTreeItemContentInner
          treeRenderProps={treeRenderProps}
          linkCtx={linkCtx}
          children={props.children}
        />
      )}
    </TreeItemContent>
  );
}

interface NavigationTreeItemContentInnerProps {
  treeRenderProps: TreeItemContentRenderProps & {defaultChildren: ReactNode | undefined};
  linkCtx: NavigationTreeItemLinkContextValue;
  children: ChildrenOrFunction<NavigationTreeItemContentRenderProps>;
}

function NavigationTreeItemContentInner(props: NavigationTreeItemContentInnerProps): ReactNode {
  let {treeRenderProps, linkCtx, children} = props;
  let {isCurrent, isLinkFocused, setLinkFocused, ...linkProps} = linkCtx;
  let {state, isFocusVisible, isFocusVisibleWithin, id, hasChildItems} = treeRenderProps;
  let {isCurrentAncestor} = useContext(NavigationTreeItemStateContext);

  useRouteFocusSync({state});

  // isFocusVisible follows the link: true when the row itself is keyboard focused, or when a child
  // is keyboard focused and that child is the link (not another button/action).
  let linkFocusVisible = isFocusVisible || (isFocusVisibleWithin && !!isLinkFocused);
  let values: NavigationTreeItemContentRenderProps & {defaultChildren: ReactNode | undefined} = {
    ...treeRenderProps,
    isCurrent: !!isCurrent,
    isCurrentAncestor,
    isFocusVisible: linkFocusVisible
  };
  let renderChildren = typeof children === 'function' ? children(values) : children;
  // Provide onFocusChange so the link reports its focus up to NavigationTreeItem.
  let linkContextValue = {
    ...linkProps,
    'aria-current': isCurrent ? 'page' : undefined,
    onFocusChange: setLinkFocused,
    onPress: linkProps.href == null && hasChildItems ? () => state.toggleKey(id) : undefined
  };
  return <Provider values={[[LinkContext, linkContextValue]]}>{renderChildren}</Provider>;
}

export interface NavigationTreeSectionProps<T> extends Omit<TreeSectionProps<T>, 'value'> {}

/**
 * A NavigationTreeSection represents a section within a NavigationTree.
 */
export function NavigationTreeSection<T extends object>(
  props: NavigationTreeSectionProps<T>
): ReactNode {
  return (
    <TreeSection className="react-aria-NavigationTreeSection" {...props}>
      {props.children}
    </TreeSection>
  );
}

export interface NavigationTreeHeaderProps extends TreeHeaderProps {}

/**
 * A NavigationTreeHeader renders the header of a NavigationTreeSection.
 */
export function NavigationTreeHeader(props: NavigationTreeHeaderProps): ReactNode {
  return (
    <TreeHeader className="react-aria-NavigationTreeHeader" {...props}>
      {props.children}
    </TreeHeader>
  );
}
