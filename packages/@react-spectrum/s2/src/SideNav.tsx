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

import {ActionButton} from './ActionButton';
import {ActionButtonGroupContext} from './ActionButtonGroup';
import {ActionMenuContext} from './ActionMenu';
import {baseColor, css, focusRing, space, style} from '../style' with {type: 'macro'};
import {Button, ButtonContext} from 'react-aria-components/Button';
import {centerBaseline} from './CenterBaseline';
import {
  centerPadding,
  getAllowedOverrides,
  StylesPropWithHeight,
  UnsafeStyles
} from './style-utils' with {type: 'macro'};
import Chevron from '../ui-icons/Chevron';
import {
  ComponentType,
  createContext,
  forwardRef,
  ReactNode,
  useContext,
  useMemo,
  useRef,
  useState,
  ViewTransitionClass
} from 'react';
import {createIcon} from './Icon';
import {DOMRef, forwardRefType, GlobalDOMAttributes, Key} from '@react-types/shared';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {getEventTarget} from 'react-aria/private/utils/shadowdom/DOMFunctions';
import {IconContext} from './Icon';
import intlMessages from '../intl/*.json';
import {Link} from 'react-aria-components/Link';
import {
  NavigationTree,
  NavigationTreeHeader,
  NavigationTreeHeaderProps,
  NavigationTreeItem,
  NavigationTreeItemContent,
  NavigationTreeItemContentRenderProps,
  NavigationTreeItemProps,
  NavigationTreeProps,
  NavigationTreeSection,
  NavigationTreeSectionProps
} from 'react-aria-components/NavigationTree';
import {pressScale} from './pressScale';
import {Provider, useContextProps} from 'react-aria-components/slots';
import * as ReactAPI from 'react';
import sideNavCss from './SideNav.module.css';
import {Text, TextContext} from './Content';
import {useControlledState} from 'react-stately/useControlledState';
import {useDOMRef} from './useDOMRef';
import {useHover} from 'react-aria/useHover';
import {useId} from 'react-aria/useId';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
import {useLocale} from 'react-aria/I18nProvider';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useMediaQuery} from './useMediaQuery';
import {useScale} from './utils';

// Older React versions just render their children, so the panel collapses and expands without
// animating.
const ViewTransition: ComponentType<{children: ReactNode; default?: ViewTransitionClass}> =
  ReactAPI.ViewTransition ?? (({children}) => children);
const addTransitionType: (type: string) => void = ReactAPI.addTransitionType ?? (() => {});
const startTransition: (scope: () => void) => void =
  ReactAPI.startTransition ?? ((scope: () => void) => scope());

// How long the panel takes to animate between its collapsed and expanded widths. Keep in sync with
// sidePanelStyle's transitionDuration below. SidePanel falls back to this when it has to wait for
// the width transition and no transitionend arrives.
const ANIMATION_DURATION = 200;

const EXPAND_TRANSITION = sideNavCss['side-panel-expand'];
const ITEM_COLLAPSE_TRANSITION = sideNavCss['side-nav-item-collapse'];
const ITEM_EXPAND_TRANSITION = sideNavCss['side-nav-item-expand'];

interface SideNavViewTransitions {
  /** The `view-transition-class` for each row. */
  item: ViewTransitionClass;
  /** The `view-transition-class` for each section header, or null when headers shouldn't animate. */
  header: string | null;
}

// A boundary resolves to 'none' for any transition type that isn't listed here. React skips such a
// boundary before it flags the update as needing a view transition, so an update SideNav didn't
// schedule — a route change, or the initial mount — never animates the nav. Collapsing the panel is
// absent for the same reason: its contents are removed before the panel starts to narrow
// so they don't reflow as it shrinks.
const viewTransitions: SideNavViewTransitions = {
  item: {
    default: 'none',
    [EXPAND_TRANSITION]: sideNavCss['side-nav-item'],
    [ITEM_COLLAPSE_TRANSITION]: sideNavCss['side-nav-item'],
    [ITEM_EXPAND_TRANSITION]: sideNavCss['side-nav-item']
  },
  // Headers are named in plain CSS rather than through a boundary, so they can't opt out per type
  // the way a row can. A name on its own animates nothing: an update that leaves a header where it
  // was captures identical states and paints no differently, so an update SideNav didn't schedule
  // still leaves the header alone.
  header: sideNavCss['side-nav-header']
};

// prefers-reduced-motion: A row's boundary is skipped rather than animated, and
// a header goes unnamed so that it isn't captured at all.
const noViewTransitions: SideNavViewTransitions = {item: 'none', header: null};

const SideNavViewTransitionContext = createContext<SideNavViewTransitions>(noViewTransitions);

export interface SideNavProps<T>
  extends
    Omit<NavigationTreeProps<T>, 'style' | 'className' | 'render' | keyof GlobalDOMAttributes>,
    UnsafeStyles {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight;
}

export interface SideNavItemProps extends Omit<
  NavigationTreeItemProps,
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
    flexShrink: 1,
    flexGrow: 1,
    minWidth: {
      default: 160,
      isInSidePanel: 'unset'
    },
    display: 'flex',
    isolation: 'isolate',
    disableTapHighlight: true,
    position: 'relative',
    overflow: 'clip'
  },
  getAllowedOverrides({height: true})
);

// TODO: the below is needed so the borders of the top and bottom row isn't cut off if the TreeView is wrapped within a container by always reserving the 2px needed for the
// keyboard focus ring. Perhaps find a different way of rendering the outlines since the top of the item doesn't
// scroll into view due to how the ring is offset. Alternatively, have the tree render the top/bottom outline like it does in Listview
const tree = style({
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
  paddingBottom: 0,
  scrollPaddingBottom: 0,
  '--indent': {
    type: 'width',
    value: 16
  }
});

/**
 * A SideNav provides users with a way to navigate nested hierarchical set of links.
 */
export const SideNav = /*#__PURE__*/ (forwardRef as forwardRefType)(function SideNav<T>(
  props: SideNavProps<T>,
  ref: DOMRef<HTMLDivElement>
) {
  let {
    children,
    UNSAFE_className,
    UNSAFE_style,
    selectedRoute,
    expandedKeys: propExpandedKeys,
    defaultExpandedKeys: propDefaultExpandedKeys,
    onExpandedChange,
    ...rest
  } = props;

  let domRef = useDOMRef(ref);
  let {isCollapsed} = useContext(SidePanelContext) ?? {};
  let isInSidePanel = isCollapsed !== undefined;

  let [expandedKeys, setExpandedKeys] = useControlledState(
    propExpandedKeys ? new Set(propExpandedKeys) : undefined,
    propDefaultExpandedKeys ? new Set(propDefaultExpandedKeys) : new Set(),
    onExpandedChange
  );

  // A collapsed panel is only wide enough for the icon rail, so every item renders closed. The
  // expanded keys are kept as they were rather than cleared, so that expanding the panel restores
  // the tree the user left behind.
  let emptySet = useMemo(() => new Set<Key>(), []);
  let visibleExpandedKeys = isCollapsed ? emptySet : expandedKeys;

  // Expanding or collapsing an item moves every row below it and mounts or unmounts its children.
  // Scheduling that as a transition lets the <ViewTransition> around each row slide the rows that
  // move into place, and cross fade the ones that come and go.
  let toggleExpandedKeys = (keys: Set<Key>) => {
    startTransition(() => {
      addTransitionType(
        keys.size > visibleExpandedKeys.size ? ITEM_EXPAND_TRANSITION : ITEM_COLLAPSE_TRANSITION
      );
      setExpandedKeys(keys);
    });
  };

  let reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <SideNavViewTransitionContext.Provider
      value={reduceMotion ? noViewTransitions : viewTransitions}>
      <div
        ref={domRef}
        className={(UNSAFE_className ?? '') + sideNavWrapper({isInSidePanel}, props.styles)}
        style={UNSAFE_style}>
        <NavigationTree
          {...rest}
          expandedKeys={visibleExpandedKeys}
          onExpandedChange={toggleExpandedKeys}
          selectedRoute={selectedRoute}
          className={renderProps => tree({...renderProps, isInSidePanel})}>
          {children}
        </NavigationTree>
      </div>
    </SideNavViewTransitionContext.Provider>
  );
});

const treeRow = style({
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
  },
  '--centerPadding': {
    type: 'paddingTop',
    value: centerPadding()
  },
  transition: 'default'
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
  paddingEnd: {
    default: 4, // account for any focus rings on the last item in the cell,
    isCollapsed: 0
  },
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
  transition: 'default',
  forcedColorAdjust: 'none'
});

const treeIcon = style({
  gridArea: 'icon',
  marginEnd: {
    default: 'text-to-visual',
    isCollapsed: 0
  },
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

const treeContent = style<{isCollapsed?: boolean}>({
  gridArea: 'content',
  paddingY: `--centerPadding`,
  flexShrink: 1,
  minWidth: 0,
  display: {
    default: 'block',
    isCollapsed: 'none'
  }
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

const treeRowLink = style<{isDisabled?: boolean}>({
  display: 'grid',
  gridArea: 'content',
  gridTemplateColumns: ['auto', '1fr', 'auto'],
  gridTemplateAreas: ['icon content badge'],
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

const treeActions = style({gridArea: 'actions', marginStart: 2, marginEnd: 4});

const treeActionMenu = style({gridArea: 'actionmenu'});

const hideUnmarkedChildren = css('& > *:not([data-do-not-hide]) {display: none;}');

const SideNavItemLinkContext = createContext<{
  isDisabled?: boolean;
  onPressChange?: (isPressed: boolean) => void;
}>({});

const SideNavInternalItemContext = createContext<{setLinkPressed?: (isPressed: boolean) => void}>(
  {}
);

export const SideNavItem = (props: SideNavItemProps): ReactNode => {
  let [isLinkPressed, setLinkPressed] = useState(false);
  let rowRef = useRef<HTMLDivElement | null>(null);
  // oxlint-disable-next-line react-compiler
  let scaling = pressScale(rowRef);
  let viewTransitions = useContext(SideNavViewTransitionContext);

  return (
    <SideNavInternalItemContext.Provider value={{setLinkPressed}}>
      <NavigationTreeItem
        {...props}
        ref={rowRef}
        style={({isPressed}) => scaling({isPressed: isLinkPressed || isPressed})}
        className={renderProps => treeRow(renderProps)}
        render={domProps => (
          <ViewTransition default={viewTransitions.item}>
            <div {...domProps} />
          </ViewTransition>
        )}
      />
    </SideNavInternalItemContext.Provider>
  );
};

export interface SideNavItemContentProps {
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

export const SideNavItemContent = (props: SideNavItemContentProps): ReactNode => {
  let {children} = props;
  let scale = useScale();
  let {setLinkPressed} = useContext(SideNavInternalItemContext);
  return (
    <NavigationTreeItemContent>
      {(renderProps: NavigationTreeItemContentRenderProps) => (
        <SideNavItemContentInner {...renderProps} scale={scale} setLinkPressed={setLinkPressed}>
          {children}
        </SideNavItemContentInner>
      )}
    </NavigationTreeItemContent>
  );
};

const SideNavItemContentInner = props => {
  let {isCollapsed = false} = useContext(SidePanelContext);
  let {
    isExpanded,
    hasChildItems,
    isDisabled,
    isCurrent,
    isCurrentAncestor,
    isHovered,
    isFocusVisible,
    scale,
    setLinkPressed,
    children
  } = props;

  return (
    <>
      <div
        className={treeRowFocusRing({
          isFocusVisible,
          isSelected: isCurrent
        })}
      />
      <div
        className={
          treeCellGrid({
            isDisabled,
            isSelected: isCurrent,
            isDescendantSelected: isCurrentAncestor && !isExpanded,
            isCollapsed
          }) + (isCollapsed ? ' ' + hideUnmarkedChildren : '')
        }>
        <div
          data-do-not-hide
          className={indicator({
            isDisabled,
            isSelected: isCurrent || (isCurrentAncestor && !isExpanded),
            isHovered
          })}
        />
        <div
          data-do-not-hide
          className={style({
            gridArea: 'level-padding',
            width: 'calc(calc(var(--tree-item-level, 0) - 1) * var(--indent))'
          })}
        />
        <Provider
          values={[
            [
              TextContext,
              {
                styles: treeContent({isCollapsed})
              }
            ],
            [
              SideNavItemLinkContext,
              {
                isDisabled,
                onPressChange: setLinkPressed
              }
            ],
            [
              IconContext,
              {
                render: centerBaseline({slot: 'icon', styles: treeIcon({isCollapsed})}),
                styles: style({size: '1lh', flexShrink: 0})
              }
            ],
            [ActionButtonGroupContext, {styles: treeActions, isDisabled, size: 'S'}],
            [ActionMenuContext, {styles: treeActionMenu, isQuiet: true, isDisabled, size: 'S'}]
          ]}>
          {typeof children === 'string' ? <Text>{children}</Text> : children}
        </Provider>
      </div>
      <ExpandableRowChevron
        isCollapsed={isCollapsed}
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
  isCollapsed?: boolean;
  isDisabled?: boolean;
  isRTL?: boolean;
  scale: 'medium' | 'large';
  isHidden?: boolean;
}

const expandButton = style<ExpandableRowChevronProps>({
  display: {
    default: 'flex',
    isCollapsed: 'none'
  },
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
  transitionDuration: 150,
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
  let {isExpanded, scale, isHidden, isCollapsed} = fullProps;
  let {direction} = useLocale();

  return (
    <Button
      {...props}
      ref={ref}
      slot="chevron"
      className={renderProps =>
        expandButton({
          ...renderProps,
          isExpanded,
          isCollapsed,
          isRTL: direction === 'rtl',
          scale,
          isHidden
        })
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
  NavigationTreeSectionProps<T>,
  'value' | 'render' | 'style' | 'className'
> {}

export function SideNavSection<T extends object>(props: SideNavSectionProps<T>) {
  return (
    <NavigationTreeSection {...props} className={style({marginTop: {':not(:first-child)': 24}})}>
      {props.children}
    </NavigationTreeSection>
  );
}

export interface SideNavHeaderProps extends Omit<
  NavigationTreeHeaderProps,
  'value' | 'render' | 'style' | 'className'
> {}

export const SideNavHeader = (props: SideNavHeaderProps): ReactNode => {
  let {header} = useContext(SideNavViewTransitionContext);
  let id = useId();
  return (
    <NavigationTreeHeader
      id={id}
      // A row gets its boundary from React, but a header can't. A header is rendered from the
      // collection rather than straight into the DOM, and the collection commits a render later than
      // the update that scheduled the transition, so React has no name on it at the point the new
      // state is captured. Naming it here instead doesn't depend on when it renders: the name is on
      // it either way, so it's captured like any other row and SideNav.module.css can hold its fade
      // back to the second half of the transition.
      style={header ? {viewTransitionName: `${id}-header`, viewTransitionClass: header} : undefined}
      className={style({
        position: 'relative',
        // Hidden by the panel rather than by the header itself — see the attribute in SidePanel.
        display: {
          default: 'block',
          ':is([data-side-panel-collapsed] *)': 'none'
        },
        font: 'ui-sm',
        // Component/S/Medium for the font, doesn't appear to match our fonts
        fontWeight: 'medium',
        color: 'gray-600',
        paddingStart: 'edge-to-text',
        marginBottom: '[8px]',
        height: 16
      })}>
      {props.children}
    </NavigationTreeHeader>
  );
};

export interface SideNavItemLinkProps {
  /** Rendered contents of the link. */
  children?: ReactNode;
}

export const SideNavItemLink = (props: SideNavItemLinkProps): ReactNode => {
  let {children} = props;
  let linkFocus = useContext(SideNavItemLinkContext);
  let {isCollapsed = false} = useContext(SidePanelContext);

  return (
    <Link
      {...props}
      {...linkFocus}
      data-do-not-hide
      className={treeRowLink({isDisabled: linkFocus.isDisabled})}>
      <Provider
        values={[
          [
            TextContext,
            {
              styles: treeContent({isCollapsed})
            }
          ],
          [
            IconContext,
            {
              render: centerBaseline({slot: 'icon', styles: treeIcon({isCollapsed})}),
              styles: style({size: '1lh', flexShrink: 0})
            }
          ]
        ]}>
        {typeof children === 'string' ? <Text>{children}</Text> : children}
      </Provider>
    </Link>
  );
};

export interface SidePanelProps<T> extends Omit<SideNavProps<T>, 'children'> {
  /** The content of the side panel. */
  children?: ReactNode;
  /** Whether the side panel is collapsed (controlled). */
  isCollapsed?: boolean;
  /** Whether the side panel is collapsed by default (uncontrolled). */
  defaultCollapsed?: boolean;
  /** Handler that is called when the collapsed state changes. */
  onCollapsedChange?: (isCollapsed: boolean) => void;
}

export interface SidePanelContextValue {
  /** Whether the side panel is currently collapsed. */
  isCollapsed?: boolean;
  /** Sets whether the side panel is collapsed. */
  setCollapsed?: (isCollapsed: boolean) => void;
}

export const SidePanelContext = createContext<SidePanelContextValue>({});

const sidePanelStyle = style(
  {
    display: 'flex',
    flexDirection: 'column',
    height: 'full',
    // The expanded width is supplied by the consumer via the `styles` prop. When collapsed, SidePanel
    // applies an inline `width: var(--collapsedWidth)` (the fixed icon-rail size) which overrides that
    // class-based width.
    '--collapsedWidth': {
      type: 'width',
      value: 42
    },
    transition: {
      default: '[width]',
      '@media (prefers-reduced-motion: reduce)': 'none'
    },
    // Keep in sync with ANIMATION_DURATION.
    transitionDuration: 200,
    transitionTimingFunction: 'default'
  },
  getAllowedOverrides({height: true})
);

export const SidePanel = /*#__PURE__*/ (forwardRef as forwardRefType)(function SidePanel<T>(
  props: SidePanelProps<T>,
  ref: DOMRef<HTMLDivElement>
) {
  let {children, UNSAFE_className = '', UNSAFE_style, styles, ...otherProps} = props;
  let domRef = useDOMRef(ref);
  let [isCollapsed, setCollapsed] = useControlledState<boolean>(
    props.isCollapsed,
    props.defaultCollapsed ?? false,
    props.onCollapsedChange
  );
  let reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // The panel's width and its contents are never animated at the same time.
  let [contentCollapsed, setContentCollapsed] = useState(isCollapsed);

  // Collapsing has to take effect in the render that starts the width transition, not in an effect
  // afterwards. Possibly a layouteffect would work, but this has precedent.
  if (isCollapsed && !contentCollapsed) {
    setContentCollapsed(true);
  }

  useLayoutEffect(() => {
    if (isCollapsed || !contentCollapsed) {
      return;
    }

    let expand = () => {
      startTransition(() => {
        addTransitionType(EXPAND_TRANSITION);
        setContentCollapsed(false);
      });
    };

    if (reduceMotion) {
      expand();
      return;
    }

    let panel = domRef.current;
    let onTransitionEnd = (e: TransitionEvent) => {
      if (getEventTarget(e) === panel && e.propertyName === 'width') {
        expand();
      }
    };
    panel?.addEventListener('transitionend', onTransitionEnd);
    // The panel doesn't necessarily animate at all, if the expanded width
    // matches the collapsed, no transitionend ever arrives.
    let timeout = setTimeout(expand, ANIMATION_DURATION + 50);
    return () => {
      panel?.removeEventListener('transitionend', onTransitionEnd);
      clearTimeout(timeout);
    };
  }, [isCollapsed, contentCollapsed, reduceMotion, domRef]);

  let context = useMemo(
    () => ({isCollapsed: contentCollapsed, setCollapsed}),
    [contentCollapsed, setCollapsed]
  );

  let filteredProps = filterDOMProps(otherProps);
  return (
    <SidePanelContext.Provider value={context}>
      <div
        {...filteredProps}
        ref={domRef}
        // Anything inside the panel that can't be in the layout before the panel starts to narrow
        // is hidden from here. The panel renders straight into the DOM,
        // while its contents come from a collection that commits a render cycle later.
        data-side-panel-collapsed={contentCollapsed || undefined}
        // When collapsed, override the consumer's class-based (expanded) width with the fixed
        // icon-rail width. The CSS width transition animates between the two.
        style={{...UNSAFE_style, width: isCollapsed ? 'var(--collapsedWidth)' : undefined}}
        className={UNSAFE_className + sidePanelStyle(null, styles)}>
        <div
          className={style({
            flexGrow: 1,
            flexShrink: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column'
          })}>
          {children}
        </div>
        <div className={style({flexGrow: 0, flexShrink: 0, marginBottom: 4, marginTop: 4})}>
          {/* The button follows the panel itself rather than its contents, so that it flips as soon
           * as it is pressed rather than at the end of an expand. */}
          <ExpandButton isCollapsed={isCollapsed} setCollapsed={setCollapsed} />
        </div>
      </div>
    </SidePanelContext.Provider>
  );
});

function ExpandButton(props: {isCollapsed: boolean; setCollapsed: (isCollapsed: boolean) => void}) {
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');

  let label = stringFormatter.format(`sidepanel.${props.isCollapsed ? 'expand' : 'collapse'}`);

  return (
    <PanelToggleButton
      isCollapsed={props.isCollapsed}
      setCollapsed={props.setCollapsed}
      aria-label={label}
    />
  );
}

function PanelToggleButton({isCollapsed, setCollapsed, ...otherProps}: any) {
  let [isHovered, setHovered] = useState(false);
  let {hoverProps} = useHover({onHoverChange: setHovered});
  return (
    <div {...hoverProps} className={style({display: 'contents', marginBottom: 2})}>
      <ActionButton
        {...otherProps}
        isQuiet
        styles={style({alignSelf: 'start'})}
        onPress={() => {
          setCollapsed(!isCollapsed);
          setHovered(false);
        }}>
        {/* @ts-ignore */}
        <PanelIcon isCollapsed={isCollapsed} isHovered={isHovered} />
      </ActionButton>
    </div>
  );
}

const PanelIcon = createIcon(props => {
  let {isCollapsed, isHovered, ...otherProps} = props as any;
  return (
    <svg viewBox="0 0 20 20" fill="var(--iconPrimary)" {...otherProps}>
      <path
        d="M15.75 18H4.25C3.00977 18 2 16.9907 2 15.75V4.25C2 3.00928 3.00977 2 4.25 2H15.75C16.9902 2 18 3.00928 18 4.25V15.75C18 16.9907 16.9902 18 15.75 18ZM4.25 3.5C3.83691 3.5 3.5 3.83643 3.5 4.25V15.75C3.5 16.1636 3.83691 16.5 4.25 16.5H15.75C16.1631 16.5 16.5 16.1636 16.5 15.75V4.25C16.5 3.83643 16.1631 3.5 15.75 3.5H4.25Z"
        fill="var(--iconPrimary)"
      />
      <rect
        x={5}
        y={5}
        rx={0.5}
        height={10}
        className={style({
          transition: '[width]',
          transitionDuration: 300,
          width: {
            default: '[5px]',
            isHovered: '[1.5px]',
            isCollapsed: {
              default: '[1.5px]',
              isHovered: '[5px]'
            }
          }
        })({isCollapsed, isHovered})}
      />
    </svg>
  );
});
