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
import {baseColor, focusRing, fontRelative, style} from '../style' with {type: 'macro'};
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
  JSXElementConstructor,
  ReactElement,
  KeyboardEvent as ReactKeyboardEvent,
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
import {getEventTarget} from 'react-aria/private/utils/shadowdom/DOMFunctions';
import {GridListHeaderProps, GridListSectionProps} from 'react-aria-components/GridList';
import {IconContext} from './Icon';
import {Link} from 'react-aria-components/Link';
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
    UnsafeStyles,
    SideNavStyleProps {
  /** The route that is currently selected. */
  selectedRoute?: string;
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight;
}

interface SideNavStyleProps {}

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

interface TreeRendererContextValue {
  renderer?: (item) => ReactElement<any, string | JSXElementConstructor<any>>;
}
const TreeRendererContext = createContext<TreeRendererContextValue>({});

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
  /**
   * Ref to the tree state, bridged up from SideNavItemContent so arrow-key handling can toggle
   * expansion.
   */
  stateRef?: RefObject<TreeState<unknown> | null>;
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
  let {children, UNSAFE_className, UNSAFE_style, selectedRoute} = props;

  let renderer;
  if (typeof children === 'function') {
    renderer = children;
  }

  let domRef = useDOMRef(ref);
  let scrollRef = useRef<HTMLDivElement | null>(null);
  let stateRef = useRef<TreeState<unknown> | null>(null);
  let {direction} = useLocale();

  // Tracks the last route we moved the focused key to, so the focus sync (driven from
  // RouteFocusSync, which has the built collection) only runs when the route actually changes
  let syncedRouteRef = useRef<string | undefined>(undefined);

  // RAC swallows arrow keys at the collection level (stopPropagation during capture), so a handler
  // on the link never sees them. Intercept here on an ancestor, before RAC's row handler runs, and
  // expand a collapsed row when the expand arrow is pressed while focus is on its link.
  let onKeyDownCapture = (e: ReactKeyboardEvent) => {
    let state = stateRef.current;
    if (!state) {
      return;
    }
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
      return;
    }
    let target = getEventTarget(e);
    let link = target.closest?.('a');
    if (!link || link !== target) {
      return;
    }
    let rowEl = link.closest<HTMLElement>('[role="row"]');
    if (!rowEl) {
      return;
    }
    let key = rowEl.dataset.key;
    if (key == null) {
      return;
    }
    let node = state.collection.getItem(key);
    // null = leaf, 'true' = expanded, 'false' = collapsed.
    let ariaExpanded = rowEl.getAttribute('aria-expanded');
    let collapseKey = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    let expandKey = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';

    // Move focus to the parent item. RAC's own parent-move (handleTreeExpansionKeys) only runs
    // when the row itself has DOM focus, so with focusMode="child" (focus on the link) it never
    // fires; replicate it here. Pointing the focused key at the parent makes useSelectableItem
    // move DOM focus to it (and, in focusMode="child", into the parent's link).
    let moveToParent = () => {
      if (node?.parentKey != null && state.collection.getItem(node.parentKey)?.type === 'item') {
        e.stopPropagation();
        e.preventDefault();
        state.selectionManager.setFocusedKey(node.parentKey);
      }
    };

    if (e.key === collapseKey) {
      if (ariaExpanded === 'true') {
        // Expanded parent: collapse it (focus stays on the row).
        e.stopPropagation();
        e.preventDefault();
        state.toggleKey(key);
      } else {
        // Leaf or already-collapsed row: step up to the parent.
        moveToParent();
      }
    } else if (e.key === expandKey && ariaExpanded === 'false') {
      // Collapsed parent: expand it.
      e.stopPropagation();
      e.preventDefault();
      state.toggleKey(key);
    }
  };

  return (
    <div
      ref={domRef}
      className={(UNSAFE_className ?? '') + sideNavWrapper(null, props.styles)}
      style={UNSAFE_style}
      onKeyDownCapture={onKeyDownCapture}>
      <TreeRendererContext.Provider value={{renderer}}>
        <InternalSideNavContext.Provider value={{stateRef, selectedRoute, syncedRouteRef}}>
          <Tree
            {...props}
            style={{
              paddingBottom: 0,
              scrollPaddingBottom: 0
            }}
            className={renderProps => tree(renderProps)}
            selectionMode="single"
            keyboardNavigationBehavior="arrow"
            disallowEmptySelection
            ref={scrollRef}>
            {props.children}
          </Tree>
        </InternalSideNavContext.Provider>
      </TreeRendererContext.Provider>
    </div>
  );
});

const treeRow = style<TreeItemRenderProps & {isLink?: boolean; isPreviousSelected?: boolean}>({
  outlineStyle: 'none',
  position: 'relative',
  display: 'flex',
  height: 32,
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
  '--borderRadiusTreeItem': {
    type: 'borderTopStartRadius',
    value: 'sm'
  },
  borderRadius: 'sm',
  marginTop: {
    ':not([aria-posinset="1"])': '[6px]',
    ':first-child': 0
  }
});

const treeCellGrid = style({
  display: 'grid',
  width: 'full',
  height: 'full',
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
    isDescendantSelected: 'bold'
  },
  '--rowSelectedBorderColor': {
    type: 'outlineColor',
    value: {
      default: 'gray-800',
      isFocusVisible: 'focus-ring',
      forcedColors: 'Highlight'
    }
  },
  '--rowForcedFocusBorderColor': {
    type: 'outlineColor',
    value: {
      default: 'focus-ring',
      forcedColors: 'Highlight'
    }
  },
  '--borderColor': {
    type: 'borderColor',
    value: {
      default: 'blue-900',
      forcedColors: 'ButtonBorder'
    }
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
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden'
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
  cursor: 'pointer'
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
}>({});

export const SideNavItem = (props: SideNavItemProps): ReactNode => {
  let {href, hrefLang, target, rel, download, ping, referrerPolicy, routerOptions, ...rest} = props;

  return (
    <SideNavItemLinkContext.Provider
      value={{href, hrefLang, target, rel, download, ping, referrerPolicy, routerOptions}}>
      <TreeItem
        {...rest}
        data-href={href} // use a data attribute so it doesn't trigger Tree's handling of href
        focusMode={href && href.length > 0 ? 'child' : undefined}
        className={renderProps => treeRow(renderProps)}
      />
    </SideNavItemLinkContext.Provider>
  );
};

export interface SideNavItemContentProps extends Omit<TreeItemContentProps, 'children'> {
  /** Rendered contents of the side nav item or child items. */
  children: ReactNode;
}

const selectedIndicator = style<{isDisabled: boolean; isSelected: boolean}>({
  position: 'absolute',
  display: {
    default: 'none',
    isSelected: 'block'
  },
  backgroundColor: {
    default: 'neutral',
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

const hoveredIndicator = style({
  position: 'absolute',
  backgroundColor: {
    default: 'neutral-subdued',
    forcedColors: 'Highlight'
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

// Moves the tree's focused key to the item matching selectedRoute. Lives here
// (rather than in SideNav) because it needs the built collection off `state`, which only exists
// after the tree has rendered. Runs when the route or the collection changes; the shared
// syncedRouteRef dedupes across items so it fires once per route change
function useRouteFocusSync({state}: {state: TreeState<unknown>}): void {
  let {selectedRoute, syncedRouteRef} = useContext(InternalSideNavContext);
  let {collection, selectionManager} = state;
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
      syncedRouteRef.current = selectedRoute;
      selectionManager.setFocusedKey(key);
    }
  }, [selectedRoute, collection, syncedRouteRef, selectionManager]);
}

export const SideNavItemContent = (props: SideNavItemContentProps): ReactNode => {
  let {children} = props;
  let scale = useScale();
  let linkProps = useContext(SideNavItemLinkContext);
  let {stateRef, selectedRoute} = useContext(InternalSideNavContext);

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
        isFocusVisible,
        isFocusVisibleWithin
      }) => {
        return (
          <SideNaveItemContentInner
            isExpanded={isExpanded}
            hasChildItems={hasChildItems}
            isDisabled={isDisabled}
            isSelected={isSelected}
            linkProps={linkProps}
            scale={scale}
            id={id}
            state={state}
            stateRef={stateRef}
            selectedRoute={selectedRoute}
            isHovered={isHovered}
            isFocusVisible={isFocusVisible}
            isFocusVisibleWithin={isFocusVisibleWithin}>
            {children}
          </SideNaveItemContentInner>
        );
      }}
    </TreeItemContent>
  );
};

const SideNaveItemContentInner = props => {
  let {
    isExpanded,
    hasChildItems,
    isDisabled,
    isSelected,
    linkProps,
    scale,
    id,
    state,
    stateRef,
    selectedRoute,
    isHovered,
    isFocusVisible,
    isFocusVisibleWithin,
    children
  } = props;
  // Whether the link within this row is the focused element (any modality). Combined with the
  // keyboard-only isFocusVisibleWithin below, this lets the row focus ring follow the link
  // specifically and not other focusable children (e.g. an ActionMenu trigger).
  let [isLinkFocused, setLinkFocused] = useState(false);
  // Bridge the tree state up to SideNav so its arrow-key handler can toggle expansion.
  useEffect(() => {
    if (stateRef) {
      stateRef.current = state;
    }
  }, [state, stateRef]);

  useRouteFocusSync({state});

  return (
    <>
      {isHovered && <div className={hoveredIndicator} />}
      <div
        className={selectedIndicator({
          isDisabled,
          isSelected: linkProps.href === selectedRoute
        })}
      />
      <div
        className={treeCellGrid({
          isDisabled,
          isSelected: linkProps.href === selectedRoute,
          isDescendantSelected:
            !isExpanded && hasChildItems && hasSelectedDescendant(id, state, selectedRoute)
        })}>
        {(isFocusVisible || (isFocusVisibleWithin && isLinkFocused)) && (
          <div
            className={treeRowFocusRing({
              isFocusVisible: true,
              isSelected
            })}
          />
        )}
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
            [SideNavItemLinkContext, {...linkProps, onFocusChange: setLinkFocused}],
            [
              IconContext,
              {
                render: centerBaseline({slot: 'icon', styles: treeIcon}),
                styles: style({size: fontRelative(20), flexShrink: 0})
              }
            ],
            [ActionButtonGroupContext, {styles: treeActions, isDisabled}],
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
        paddingStart: 'edge-to-text',
        marginBottom: '[10px]',
        height: 32
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
      className={treeRowLink}>
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
    if (collection.getItem(key)?.props?.['data-href'] === route) {
      return key;
    }
  }
  return null;
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
