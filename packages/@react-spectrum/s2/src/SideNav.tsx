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

import {ActionButtonGroupContext} from './ActionButtonGroup';
import {ActionMenuContext} from './ActionMenu';
import {baseColor, focusRing, fontRelative, space, style} from '../style' with {type: 'macro'};
import {Button, ButtonContext} from 'react-aria-components/Button';
import {centerBaseline} from './CenterBaseline';
import Chevron from '../ui-icons/Chevron';
import {
  Collection,
  DOMRef,
  forwardRefType,
  GlobalDOMAttributes,
  Key,
  Node,
  RouterOptions
} from '@react-types/shared';
import {
  createContext,
  forwardRef,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  getAllowedOverrides,
  StylesPropWithHeight,
  UnsafeStyles
} from './style-utils' with {type: 'macro'};
import {GridListHeaderProps, GridListSectionProps} from 'react-aria-components/GridList';
import {IconContext} from './Icon';
import {Link} from 'react-aria-components/Link';
import {pressScale} from './pressScale';
import {Provider, useContextProps} from 'react-aria-components/slots';
import {
  TreeItemProps as RACTreeItemProps,
  TreeProps as RACTreeProps,
  Tree,
  TreeHeader,
  TreeItem,
  TreeItemContent,
  TreeItemContentProps,
  TreeItemRenderProps,
  TreeRenderProps,
  TreeSection
} from 'react-aria-components/Tree';
import {Text, TextContext} from './Content';
import {TreeState} from 'react-stately/useTreeState';
import {useDOMRef} from './useDOMRef';
import {useLocale} from 'react-aria/I18nProvider';
import {useScale} from './utils';

export interface SideNavProps<T>
  extends
    Omit<
      RACTreeProps<T>,
      | 'style'
      | 'className'
      | 'render'
      | 'onRowAction'
      | 'selectionBehavior'
      | 'onScroll'
      | 'onCellAction'
      | 'onSelectionChange'
      | 'selectedKeys'
      | 'defaultSelectedKeys'
      | 'disabledBehavior'
      | 'selectionMode'
      | 'escapeKeyBehavior'
      | 'shouldSelectOnPressUp'
      | 'disallowEmptySelection'
      | 'renderEmptyState'
      | 'keyboardNavigationBehavior'
      | 'dragAndDropHooks' // To be implemented
      | keyof GlobalDOMAttributes
    >,
    UnsafeStyles {
  /** The route that is currently selected. */
  selectedRoute: string;
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight;
}

export interface SideNavItemProps extends Omit<
  RACTreeItemProps,
  | 'className'
  | 'style'
  | 'render'
  | 'onClick'
  | 'allowsArrowNavigation'
  | 'focusMode'
  | 'value'
  | 'onAction'
  | keyof GlobalDOMAttributes
> {
  /** A string representation of the side nav item's contents, used for features like typeahead. */
  textValue: string;
  /** Whether this item has children. */
  hasChildItems?: boolean;
}

const sideNavWrapper = style(
  {
    minHeight: 0,
    height: 'full',
    minWidth: 160,
    display: 'flex',
    isolation: 'isolate',
    disableTapHighlight: true,
    position: 'relative',
    overflow: 'clip',
    '--indicator-level-padding': {
      type: 'width',
      value: {
        // 4 (start gap) + 10 (drag handle) + (hasCheckbox ? 16 + 8 : 0) + 40 (expand button)
        // keep in sync with treeCellGrid gridTemplateColumns
        default: 54
      }
    }
  },
  getAllowedOverrides({height: true})
);

// TODO: the below is needed so the borders of the top and bottom row isn't cut off if the TreeView is wrapped within a container by always reserving the 2px needed for the
// keyboard focus ring. Perhaps find a different way of rendering the outlines since the top of the item doesn't
// scroll into view due to how the ring is offset. Alternatively, have the tree render the top/bottom outline like it does in Listview
const tree = style<TreeRenderProps>({
  ...focusRing(),
  outlineOffset: -2, // make certain we are visible inside overflow hidden containers
  userSelect: 'none',
  minHeight: 0,
  minWidth: 0,
  width: 'full',
  height: 'full',
  overflowY: 'auto',
  overflowX: 'hidden',
  boxSizing: 'border-box',
  '--indent': {
    type: 'width',
    value: 16
  }
});

interface InternalSideNavContextValue {
  /** The route that is currently selected. */
  selectedRoute?: string;
  /** The last route the focused key was synced to; dedupes the focus sync across items. */
  syncedRouteRef?: RefObject<string | undefined>;
}
let InternalSideNavContext = createContext<InternalSideNavContextValue>({});

/**
 * A SideNav provides users with a way to navigate nested hierarchical set of links.
 */
export const SideNav = /*#__PURE__*/ (forwardRef as forwardRefType)(function SideNav<T>(
  props: SideNavProps<T>,
  ref: DOMRef<HTMLDivElement>
) {
  let {children, UNSAFE_className, UNSAFE_style, selectedRoute, ...rest} = props;

  let domRef = useDOMRef(ref);

  // Tracks the last route we moved the focused key to, so the focus sync (driven from
  // RouteFocusSync, which has the built collection) only runs when the route actually changes
  let syncedRouteRef = useRef<string | undefined>(undefined);

  return (
    <div
      ref={domRef}
      className={(UNSAFE_className ?? '') + sideNavWrapper(null, props.styles)}
      style={UNSAFE_style}>
      <InternalSideNavContext.Provider value={{selectedRoute, syncedRouteRef}}>
        <Tree
          {...rest}
          style={{
            paddingBottom: 0,
            scrollPaddingBottom: 0
          }}
          className={renderProps => tree(renderProps)}
          selectionMode="none"
          keyboardNavigationBehavior="tab">
          {children}
        </Tree>
      </InternalSideNavContext.Provider>
    </div>
  );
});

const treeRow = style<TreeItemRenderProps & {isLink?: boolean}>({
  outlineStyle: 'none',
  position: 'relative',
  display: 'flex',
  minHeight: 32,
  width: 'full',
  boxSizing: 'border-box',
  font: 'ui',
  color: {
    default: baseColor('neutral-subdued'),
    forcedColors: 'ButtonText'
  },
  cursor: {
    default: 'default',
    isLink: 'pointer'
  },
  borderRadius: 'sm',
  marginTop: {
    default: space(6),
    ':first-child': 0
  }
});

const treeCellGrid = style({
  display: 'grid',
  width: 'full',
  minHeight: 'full',
  boxSizing: 'border-box',
  alignContent: 'center',
  alignItems: 'center',
  gridTemplateColumns: [12, 'auto', 'auto', '1fr', 'auto', 'auto'],
  gridTemplateRows: '1fr',
  gridTemplateAreas: ['. level-padding icon content actions actionmenu'],
  paddingEnd: 4, // account for any focus rings on the last item in the cell
  color: {
    default: baseColor('neutral-subdued'),
    isSelected: baseColor('neutral'),
    isDescendantSelected: baseColor('neutral'),
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    },
    forcedColors: 'ButtonText'
  },
  fontWeight: {
    isSelected: 'bold',
    isDescendantSelected: 'bold'
  },
  forcedColorAdjust: 'none'
});

const treeIcon = style({
  gridArea: 'icon',
  marginEnd: 'text-to-visual',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

const treeContent = style({
  gridArea: 'content',
  paddingY: '[7px]' // padding shouldn't scale
});

let treeRowFocusRing = style({
  ...focusRing(),
  outlineOffset: -2,
  outlineWidth: 2,
  outlineColor: {
    default: 'focus-ring',
    forcedColors: 'ButtonBorder'
  },
  position: 'absolute',
  inset: 0,
  top: 0,
  bottom: 0,
  borderRadius: 'default', // tokens say 12... but that seems a lot, should it match selection in other collections?
  zIndex: 1,
  pointerEvents: 'none'
});

const treeRowLink = style({
  display: 'grid',
  gridArea: 'content',
  gridTemplateColumns: ['auto', '1fr'],
  gridTemplateAreas: ['icon content'],
  alignItems: 'center',
  minWidth: 0,
  outlineStyle: 'none',
  textDecoration: 'none',
  color: 'inherit',
  cursor: {
    default: 'pointer',
    isDisabled: 'default'
  }
});

const treeActions = style({
  gridArea: 'actions',
  marginStart: 2,
  marginEnd: 4
});

const treeActionMenu = style({
  gridArea: 'actionmenu'
});

const SideNavItemLinkContext = createContext<{
  isDisabled?: boolean;
  href?: string;
  hrefLang?: string;
  target?: string;
  rel?: string;
  download?: string | boolean;
  ping?: string;
  referrerPolicy?: ReferrerPolicy;
  routerOptions?: RouterOptions;
  // Lets the row track whether the link (as opposed to another focusable child like an ActionMenu
  // trigger) is the focused element, so the row focus ring can follow the link specifically.
  onFocusChange?: (isFocused: boolean) => void;
  // So we can scale the row when the link is pressed.
  onPressChange?: (isPressed: boolean) => void;
}>({});

export const SideNavItem = (props: SideNavItemProps): ReactNode => {
  let {href, hrefLang, target, rel, download, ping, referrerPolicy, routerOptions, ...rest} = props;

  let hasLink = href != null && href.length > 0;
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
        routerOptions
      }}>
      <TreeItem
        {...rest}
        href={href}
        focusMode={hasLink ? 'child' : undefined}
        allowsArrowNavigation
        className={renderProps => treeRow(renderProps)}
      />
    </SideNavItemLinkContext.Provider>
  );
};

export interface SideNavItemContentProps extends Omit<TreeItemContentProps, 'children'> {
  /** Rendered contents of the side nav item or child items. */
  children: ReactNode;
}

const indicator = style<{isDisabled: boolean; isSelected: boolean; isHovered: boolean}>({
  position: 'absolute',
  display: {
    default: 'none',
    isSelected: 'block',
    isHovered: 'block'
  },
  backgroundColor: {
    isHovered: 'gray-400',
    isSelected: 'gray-800',
    isDisabled: 'disabled',
    forcedColors: {
      default: 'Highlight',
      isDisabled: 'GrayText'
    }
  },
  height: 18,
  width: '[2px]',
  contain: 'strict',
  top: '50%',
  transform: 'translateY(-50%)',
  '--indicator-indent': {
    type: 'width',
    value: 4
  },
  insetStart:
    '[calc(calc(var(--tree-item-level, 0) - 1) * var(--indent) + var(--indicator-indent))]',
  borderStyle: 'none',
  borderRadius: 'full'
});

// Moves the tree's focused key to the item matching selectedRoute. Lives in items
// (rather than up in SideNav) because it needs the built collection off `state`, which only exists
// after the tree has rendered. Runs when the route or the collection changes; the shared
// syncedRouteRef dedupes across items so it fires once per route change.
// If the item is inside a collapsed parent, the focused key is moved to the closest
// visible ancestor instead of the hidden descendant.
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

export const SideNavItemContent = (props: SideNavItemContentProps): ReactNode => {
  let {children} = props;
  let scale = useScale();
  let linkProps = useContext(SideNavItemLinkContext);
  let {selectedRoute} = useContext(InternalSideNavContext);

  return (
    <TreeItemContent>
      {({
        isExpanded,
        hasChildItems,
        isDisabled,
        isSelected,
        id,
        state,
        isHovered,
        isPressed,
        isFocusVisible,
        isFocusVisibleWithin
      }) => {
        return (
          <SideNavItemContentInner
            isExpanded={isExpanded}
            hasChildItems={hasChildItems}
            isDisabled={isDisabled}
            isSelected={isSelected}
            linkProps={linkProps}
            scale={scale}
            id={id}
            state={state}
            selectedRoute={selectedRoute}
            isHovered={isHovered}
            isPressed={isPressed}
            isFocusVisible={isFocusVisible}
            isFocusVisibleWithin={isFocusVisibleWithin}>
            {children}
          </SideNavItemContentInner>
        );
      }}
    </TreeItemContent>
  );
};

const SideNavItemContentInner = props => {
  let {
    isExpanded,
    hasChildItems,
    isDisabled,
    isSelected,
    linkProps,
    scale,
    id,
    state,
    selectedRoute,
    isHovered,
    isPressed,
    isFocusVisible,
    isFocusVisibleWithin,
    children
  } = props;

  useRouteFocusSync({state});

  // Whether the link within this row is the focused element (any modality). Combined with the
  // keyboard-only isFocusVisibleWithin below, this lets the row focus ring follow the link
  // specifically and not other focusable children (e.g. an ActionMenu trigger).
  let [isLinkFocused, setLinkFocused] = useState(false);
  let [isLinkPressed, setLinkPressed] = useState(false);
  let cellRef = useRef<HTMLDivElement | null>(null);

  let hasLink = linkProps.href != null && linkProps.href.length > 0;

  // oxlint-disable-next-line react-compiler
  let itemScaling = pressScale(cellRef)({isPressed: isLinkPressed || isPressed});

  return (
    <>
      <div
        ref={cellRef}
        className={treeCellGrid({
          isDisabled,
          isSelected: linkProps.href === selectedRoute,
          isDescendantSelected:
            !isExpanded && hasChildItems && hasSelectedDescendant(id, state, selectedRoute)
        })}
        style={itemScaling}>
        <div
          className={indicator({
            isDisabled,
            isSelected: linkProps.href === selectedRoute,
            isHovered: isHovered && hasLink
          })}
        />
        <div
          className={treeRowFocusRing({
            isFocusVisible: isFocusVisible || (isFocusVisibleWithin && isLinkFocused),
            isSelected
          })}
        />
        <div
          className={style({
            gridArea: 'level-padding',
            width: 'calc(calc(var(--tree-item-level, 0) - 1) * var(--indent))'
          })}
        />
        <Provider
          values={[
            [TextContext, {styles: treeContent}],
            // forward this so that it gets out of the fake dom's tree and into the real one, and
            // add onFocusChange so the link reports focus for the row focus ring.
            [
              SideNavItemLinkContext,
              {
                ...linkProps,
                isDisabled,
                onFocusChange: setLinkFocused,
                onPressChange: setLinkPressed
              }
            ],
            [
              IconContext,
              {
                render: centerBaseline({slot: 'icon', styles: treeIcon}),
                styles: style({size: fontRelative(20), flexShrink: 0})
              }
            ],
            [ActionButtonGroupContext, {styles: treeActions, isDisabled, size: 'S'}],
            [ActionMenuContext, {styles: treeActionMenu, isQuiet: true, isDisabled, size: 'S'}]
          ]}>
          {typeof children === 'string' ? <Text>{children}</Text> : children}
        </Provider>
      </div>
      <ExpandableRowChevron
        isDisabled={isDisabled}
        isExpanded={isExpanded}
        scale={scale}
        isHidden={!hasChildItems}
      />
    </>
  );
};

interface ExpandableRowChevronProps {
  isExpanded?: boolean;
  isDisabled?: boolean;
  isRTL?: boolean;
  scale: 'medium' | 'large';
  isHidden?: boolean;
}

const expandButton = style<ExpandableRowChevronProps>({
  gridArea: 'expand-button',
  color: {
    default: 'inherit',
    isDisabled: {
      default: 'disabled',
      forcedColors: 'GrayText'
    }
  },
  height: 32,
  width: 32,
  display: 'flex',
  flexWrap: 'wrap',
  alignContent: 'center',
  justifyContent: 'center',
  outlineStyle: 'none',
  cursor: 'default',
  transform: {
    isExpanded: {
      default: 'rotate(90deg)',
      isRTL: 'rotate(-90deg)'
    }
  },
  padding: 0,
  transition: 'default',
  backgroundColor: 'transparent',
  borderStyle: 'none',
  disableTapHighlight: true,
  visibility: {
    isHidden: 'hidden'
  }
});

function ExpandableRowChevron(props: ExpandableRowChevronProps) {
  let expandButtonRef = useRef<HTMLButtonElement>(null);
  let [fullProps, ref] = useContextProps(
    {...props, slot: 'chevron'},
    expandButtonRef,
    ButtonContext
  );
  let {isExpanded, scale, isHidden} = fullProps;
  let {direction} = useLocale();

  return (
    <Button
      {...props}
      ref={ref}
      slot="chevron"
      className={renderProps =>
        expandButton({...renderProps, isExpanded, isRTL: direction === 'rtl', scale, isHidden})
      }>
      <Chevron
        className={style({
          scale: {
            direction: {
              ltr: '1',
              rtl: '-1'
            }
          },
          '--iconPrimary': {
            type: 'fill',
            value: 'currentColor'
          }
        })({direction})}
      />
    </Button>
  );
}

export interface SideNavSectionProps<T> extends Omit<
  GridListSectionProps<T>,
  'value' | 'render' | 'style' | 'className'
> {}

export function SideNavSection<T extends object>(props: SideNavSectionProps<T>) {
  return (
    <TreeSection {...props} className={style({marginTop: {':not(:first-child)': 24}})}>
      {props.children}
    </TreeSection>
  );
}

export interface SideNavHeaderProps extends Omit<
  GridListHeaderProps,
  'value' | 'render' | 'style' | 'className'
> {}

export const SideNavHeader = (props: SideNavHeaderProps): ReactNode => {
  return (
    <TreeHeader
      className={style({
        font: 'ui-sm',
        // Component/S/Medium for the font, doesn't appear to match our fonts
        fontWeight: 'medium',
        color: 'gray-600',
        paddingStart: 'edge-to-text',
        marginBottom: '[8px]',
        height: 16
      })}>
      {props.children}
    </TreeHeader>
  );
};

export interface SideNavItemLinkProps {
  /** Rendered contents of the link. */
  children?: ReactNode;
}

export const SideNavItemLink = (props: SideNavItemLinkProps): ReactNode => {
  let {children} = props;
  let {selectedRoute} = useContext(InternalSideNavContext);
  let linkProps = useContext(SideNavItemLinkContext);

  return (
    <Link
      {...props}
      {...linkProps}
      aria-current={selectedRoute === linkProps.href ? 'page' : undefined}
      className={treeRowLink({isDisabled: linkProps.isDisabled})}>
      <Provider
        values={[
          [TextContext, {styles: treeContent}],
          [
            IconContext,
            {
              render: centerBaseline({slot: 'icon', styles: treeIcon}),
              styles: style({size: fontRelative(20), flexShrink: 0})
            }
          ]
        ]}>
        {typeof children === 'string' ? <Text>{children}</Text> : children}
      </Provider>
    </Link>
  );
};

// The collection key of the item whose href matches `route`, or null. getKeys() covers collapsed
// items too, and the href is stored as a data attribute so it doesn't trigger Tree's link handling.
function findKeyForRoute(collection: Collection<Node<unknown>>, route: string): Key | null {
  for (let key of collection.getKeys()) {
    if (collection.getItem(key)?.props?.href === route) {
      return key;
    }
  }
  return null;
}

// Walks up from `key` to the closest ancestor that is actually rendered (i.e. all of its ancestors
// are expanded). Returns `key` unchanged when it is already visible. A collapsed ancestor hides
// everything beneath it, so the highest collapsed ancestor is the closest visible row.
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

// Cache so each row doesn't have to walk up the tree every time
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

// Whether the row `id` is an ancestor of the item matching `selectedRoute`, i.e. it has a
// selected descendant. Used to keep a collapsed parent styled when its selected child is hidden.
function hasSelectedDescendant(
  id: Key | undefined,
  state: TreeState<unknown>,
  selectedRoute: string | undefined
) {
  if (id == null || selectedRoute == null || !state) {
    return false;
  }
  return getSelectedAncestors(state, selectedRoute).has(id);
}
