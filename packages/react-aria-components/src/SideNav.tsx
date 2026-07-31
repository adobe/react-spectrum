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
import {LinkContext} from './Link';
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

export const SideNavContext = createContext<ContextValue<SideNavProps<any>, HTMLDivElement>>(null);

interface InternalSideNavContextValue {
  /** The route that is currently selected. */
  selectedRoute?: string | null;
  /** The last route the focused key was synced to; dedupes the focus sync across items. */
  syncedRouteRef?: RefObject<string | undefined>;
}
const InternalSideNavContext = createContext<InternalSideNavContextValue>({});

interface SideNavItemLinkContextValue {
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
const SideNavItemLinkContext = createContext<SideNavItemLinkContextValue>({});

const SideNavItemStateContext = createContext<{isCurrentAncestor: boolean}>({
  isCurrentAncestor: false
});

export interface SideNavRenderProps extends Pick<
  TreeRenderProps,
  'isEmpty' | 'isFocused' | 'isFocusVisible' | 'state'
> {}

export interface SideNavProps<T>
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
      | 'onAction'
      | 'className'
      | 'style'
      | 'render'
    >,
    StyleRenderProps<SideNavRenderProps> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-SideNav'
   */
  className?: ClassNameOrFunction<SideNavRenderProps>;
  /** The route that is currently selected, matched against each item's `href`. */
  selectedRoute?: string | null;
}

/**
 * A SideNav provides users with a way to navigate a nested, hierarchical set of links.
 */
export const SideNav = /*#__PURE__*/ (forwardRef as forwardRefType)(function SideNav<T>(
  props: SideNavProps<T>,
  ref: ForwardedRef<HTMLDivElement>
) {
  [props, ref] = useContextProps(props, ref, SideNavContext);
  let {className, style, children, selectedRoute, ...rest} = props;
  let syncedRouteRef = useRef<string | undefined>(undefined);
  let context = useMemo(() => ({selectedRoute, syncedRouteRef}), [selectedRoute]);
  return (
    <InternalSideNavContext.Provider value={context}>
      <Tree
        {...rest}
        ref={ref}
        className={className ?? 'react-aria-SideNav'}
        style={style}
        selectionMode="none"
        keyboardNavigationBehavior="tab">
        {children}
      </Tree>
    </InternalSideNavContext.Provider>
  );
});

export interface SideNavItemRenderProps extends TreeItemRenderProps {
  /**
   * Whether this item is the current route (its `href` matches the SideNav's `selectedRoute`).
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

export interface SideNavItemProps<T = object>
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
    StyleRenderProps<SideNavItemRenderProps> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-SideNavItem'
   */
  className?: ClassNameOrFunction<SideNavItemRenderProps>;
  /**
   * The content of the side nav item along with any nested children. Supports static nested side
   * nav items or use of a Collection to dynamically render nested side nav items.
   */
  children: ReactNode;
}

/**
 * A SideNavItem represents an individual item in a SideNav.
 */
export const SideNavItem = /*#__PURE__*/ (forwardRef as forwardRefType)(function SideNavItem<
  T extends object
>(props: SideNavItemProps<T>, ref: ForwardedRef<HTMLDivElement>) {
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
  let {selectedRoute} = useContext(InternalSideNavContext);
  let hasLink = href != null && href.length > 0;
  let isCurrent = hasLink && href === selectedRoute;
  let [isLinkFocused, setLinkFocused] = useState(false);
  // Additional render props SideNavItem adds to what TreeItem already provides.
  let getItemRenderProps = <R extends TreeItemRenderProps>(
    renderProps: R
  ): R & {isCurrent: boolean; isCurrentAncestor: boolean} => ({
    ...renderProps,
    isCurrent,
    isCurrentAncestor: hasSelectedDescendant(renderProps.id, renderProps.state, selectedRoute),
    isFocusVisible:
      renderProps.isFocusVisible || (renderProps.isFocusVisibleWithin && isLinkFocused)
  });
  return (
    <SideNavItemLinkContext.Provider
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
        ref={ref}
        href={href}
        focusMode={hasLink ? 'child' : undefined}
        allowsArrowNavigation
        data-current={isCurrent || undefined}
        className={
          typeof className === 'function'
            ? renderProps => className(getItemRenderProps(renderProps))
            : (className ?? 'react-aria-SideNavItem')
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
            <SideNavItemStateContext.Provider value={{isCurrentAncestor: values.isCurrentAncestor}}>
              {rowChildren}
            </SideNavItemStateContext.Provider>
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
    </SideNavItemLinkContext.Provider>
  );
});

export interface SideNavItemContentRenderProps extends TreeItemContentRenderProps {
  /**
   * Whether this item is the current route (its `href` matches the SideNav's `selectedRoute`).
   *
   * @selector [data-current]
   */
  isCurrent: boolean;
  /** Whether this item is an ancestor of the current-route item. */
  isCurrentAncestor: boolean;
}

export interface SideNavItemContentProps {
  /**
   * The children of the component. A function may be provided to alter the children based on
   * component state.
   */
  children: ChildrenOrFunction<SideNavItemContentRenderProps>;
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
  let {selectedRoute, syncedRouteRef} = useContext(InternalSideNavContext);
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

export function SideNavItemContent(props: SideNavItemContentProps): ReactNode {
  let linkCtx = useContext(SideNavItemLinkContext);
  return (
    <TreeItemContent {...props}>
      {(treeRenderProps: TreeItemContentRenderProps & {defaultChildren: ReactNode | undefined}) => (
        <SideNavItemContentInner
          treeRenderProps={treeRenderProps}
          linkCtx={linkCtx}
          children={props.children}
        />
      )}
    </TreeItemContent>
  );
}

interface SideNavItemContentInnerProps {
  treeRenderProps: TreeItemContentRenderProps & {defaultChildren: ReactNode | undefined};
  linkCtx: SideNavItemLinkContextValue;
  children: ChildrenOrFunction<SideNavItemContentRenderProps>;
}

function SideNavItemContentInner(props: SideNavItemContentInnerProps): ReactNode {
  let {treeRenderProps, linkCtx, children} = props;
  let {isCurrent, isLinkFocused, setLinkFocused, ...linkProps} = linkCtx;
  let {state, isFocusVisible, isFocusVisibleWithin} = treeRenderProps;
  let {isCurrentAncestor} = useContext(SideNavItemStateContext);

  useRouteFocusSync({state});

  // isFocusVisible follows the link: true when the row itself is keyboard focused, or when a child
  // is keyboard focused and that child is the link (not another button/action).
  let linkFocusVisible = isFocusVisible || (isFocusVisibleWithin && !!isLinkFocused);
  let values: SideNavItemContentRenderProps & {defaultChildren: ReactNode | undefined} = {
    ...treeRenderProps,
    isCurrent: !!isCurrent,
    isCurrentAncestor,
    isFocusVisible: linkFocusVisible
  };
  let renderChildren = typeof children === 'function' ? children(values) : children;
  // Provide onFocusChange so the link reports its focus up to SideNavItem.
  let linkContextValue = {
    ...linkProps,
    'aria-current': isCurrent ? 'page' : undefined,
    onFocusChange: setLinkFocused
  };
  return <Provider values={[[LinkContext, linkContextValue]]}>{renderChildren}</Provider>;
}

export interface SideNavSectionProps<T> extends Omit<TreeSectionProps<T>, 'value'> {}

/**
 * A SideNavSection represents a section within a SideNav.
 */
export function SideNavSection<T extends object>(props: SideNavSectionProps<T>): ReactNode {
  return (
    <TreeSection className="react-aria-SideNavSection" {...props}>
      {props.children}
    </TreeSection>
  );
}

export interface SideNavHeaderProps extends TreeHeaderProps {}

/**
 * A SideNavHeader renders the header of a SideNavSection.
 */
export function SideNavHeader(props: SideNavHeaderProps): ReactNode {
  return (
    <TreeHeader className="react-aria-SideNavHeader" {...props}>
      {props.children}
    </TreeHeader>
  );
}
