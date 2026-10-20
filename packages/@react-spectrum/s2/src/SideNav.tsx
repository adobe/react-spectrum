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
  ClipBounds,
  intersect,
  PANEL_TRANSITION,
  Rect,
  SideNavPanelBoundsContext,
  SideNavPanelContext,
  useClippedViewTransition,
  useMovingClippedViewTransition
} from './SideNavPanel';
import {
  ComponentProps,
  ComponentType,
  createContext,
  forwardRef,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ViewTransitionClass,
  ViewTransitionProps
} from 'react';
import {divider} from './Divider';
import {DOMRef, forwardRefType, GlobalDOMAttributes, Key} from '@react-types/shared';
import {getEventTarget} from 'react-aria/private/utils/shadowdom/DOMFunctions';
import {IconContext} from './Icon';
import {Link} from 'react-aria-components/Link';
import {mergeStyles} from '../style/runtime';
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
import React from 'react';
import sideNavCss from './SideNav.module.css';
import {Text, TextContext} from './Content';
import {useControlledState} from 'react-stately/useControlledState';
import {useDOMRef} from './useDOMRef';
import {useId} from 'react-aria/useId';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
import {useLocale} from 'react-aria/I18nProvider';
import {useMediaQuery} from './useMediaQuery';
import {useScale} from './utils';

// Older React versions are not animated
const ViewTransition: ComponentType<ViewTransitionProps> =
  React.ViewTransition ?? (({children}) => children);
const addTransitionType: (type: string) => void = React.addTransitionType ?? (() => {});
const startTransition: (scope: () => void) => void =
  React.startTransition ?? ((scope: () => void) => scope());

// Transition types, we can easily turn off the animations.
const SIDE_NAV_CLASS = sideNavCss['side-nav'];
const SIDE_NAV_ICON_CLASS = sideNavCss['side-nav-icon'];
const ITEM_TRANSITION = sideNavCss['side-nav-item'];

// `default: 'none'` opts an element out of the transitions it isn't part of. Rows and headers are
// already inside the panel's snapshot when it collapses, and capturing them again would lift them
// out of it and let them animate past its edges.
const itemViewTransition: ViewTransitionClass = {
  default: 'none',
  [ITEM_TRANSITION]: SIDE_NAV_CLASS
};

const iconViewTransition: ViewTransitionClass = {
  default: 'none',
  [PANEL_TRANSITION]: SIDE_NAV_ICON_CLASS
};

interface SideNavViewTransitionValue {
  /** The class applied to each row and header snapshot. */
  transition: ViewTransitionClass;
  /** The class applied to each icon snapshot. */
  iconTransition: ViewTransitionClass;
  /** Reads the bounds to clip snapshots to, as they are for the frame being drawn. */
  getClipBounds: () => Rect | null;
  /** Reads the bounds to clip to at the start and at the end of the update being transitioned. */
  getMovingClipBounds: () => ClipBounds;
}

const SideNavViewTransitionContext = createContext<SideNavViewTransitionValue>({
  transition: 'none',
  iconTransition: 'none',
  getClipBounds: () => null,
  getMovingClipBounds: () => [null, null]
});

/** Props for the `<ViewTransition>` around each row and header. */
function useSideNavViewTransition(): Omit<ViewTransitionProps, 'children'> {
  let {transition, getClipBounds} = useContext(SideNavViewTransitionContext);
  return useClippedViewTransition(transition, getClipBounds);
}

// While a view transition runs, Safari hit tests the snapshots it paints rather than the live DOM,
// so the pointer appears to move onto the document element and then back a frame or two after the
// animation ends, leaving whatever it was resting on unhovered in between. Swallow the events it
// moves with. A pointer that really moves enters the element it moved to, not the document
// element, so it is left alone.
function useViewTransitionHover(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    let view = ref.current?.ownerDocument.defaultView;
    // Without this selector there is no way to tell these events apart from the pointer moving.
    if (!view || !view.CSS.supports?.('selector(:active-view-transition)')) {
      return;
    }

    let root = view.document.documentElement;
    let onPointerEvent = (e: PointerEvent) => {
      let entered = e.type === 'pointerover' ? getEventTarget(e) : e.relatedTarget;
      if (entered === root && root.matches(':active-view-transition')) {
        e.stopPropagation();
      }
    };

    // Hover is tracked with listeners on the document, so these must be on the window to run first.
    view.addEventListener('pointerover', onPointerEvent, true);
    view.addEventListener('pointerout', onPointerEvent, true);
    return () => {
      view.removeEventListener('pointerover', onPointerEvent, true);
      view.removeEventListener('pointerout', onPointerEvent, true);
    };
  }, [ref]);
}

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
      isInSideNavPanel: 'unset'
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
  useViewTransitionHover(domRef);
  let {isCollapsed, targetCollapsed} = useContext(SideNavPanelContext) ?? {};
  let isInSideNavPanel = isCollapsed !== undefined;
  let panelRef = useContext(SideNavPanelBoundsContext);

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
  // Scheduling that as a transition causes the <ViewTransition> around each row to animate.
  let toggleExpandedKeys = (keys: Set<Key>) => {
    startTransition(() => {
      addTransitionType(ITEM_TRANSITION);
      setExpandedKeys(keys);
    });
  };

  let reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Travelling snapshots are clipped to where the nav is drawn, which is somewhere between the
  // bounds it had before the panel started resizing and the ones it ends up with.
  let boundsBeforeResize = useRef<Rect | null>(null);
  let getNavBounds = useCallback(() => domRef.current?.getBoundingClientRect() ?? null, [domRef]);

  let viewTransition = useMemo(
    (): SideNavViewTransitionValue => ({
      transition: reduceMotion ? 'none' : itemViewTransition,
      iconTransition: reduceMotion ? 'none' : iconViewTransition,
      getClipBounds: () => {
        // Rows stay within the nav, and within the panel while it is still widening or narrowing
        // around them, so they never reach the content beside it either.
        let bounds = getNavBounds();
        let panel = panelRef?.current;
        return bounds && panel ? intersect(bounds, panel.getBoundingClientRect()) : bounds;
      },
      // Unlike the panel, whose width is still transitioning around it, the nav's own width snaps,
      // so by the time there is a transition to clip its bounds are already the final ones.
      getMovingClipBounds: () => [boundsBeforeResize.current, getNavBounds()]
    }),
    [reduceMotion, getNavBounds, panelRef]
  );

  // The panel renders a collapse or expand one commit after it is asked for, so this still sees
  // the bounds the transition is about to capture rather than the ones it animates to.
  useLayoutEffect(() => {
    boundsBeforeResize.current = getNavBounds();
  }, [targetCollapsed, getNavBounds]);

  return (
    <SideNavViewTransitionContext.Provider value={viewTransition}>
      <div
        ref={domRef}
        className={(UNSAFE_className ?? '') + sideNavWrapper({isInSideNavPanel}, props.styles)}
        style={UNSAFE_style}>
        <NavigationTree
          {...rest}
          expandedKeys={visibleExpandedKeys}
          onExpandedChange={toggleExpandedKeys}
          selectedRoute={selectedRoute}
          className={renderProps => tree({...renderProps, isInSideNavPanel})}>
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

/** Renders a row's icon inside its own `<ViewTransition>`, for `IconContext`. */
function useSideNavIcon(isCollapsed: boolean): (icon: ReactNode) => ReactNode {
  let {iconTransition, getMovingClipBounds} = useContext(SideNavViewTransitionContext);
  let viewTransition = useMovingClippedViewTransition(iconTransition, getMovingClipBounds);
  let render = centerBaseline({slot: 'icon', styles: treeIcon({isCollapsed})});
  return (icon: ReactNode) => <ViewTransition {...viewTransition}>{render(icon)}</ViewTransition>;
}

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
  let viewTransition = useSideNavViewTransition();

  return (
    <SideNavInternalItemContext.Provider value={{setLinkPressed}}>
      <NavigationTreeItem
        {...props}
        ref={rowRef}
        style={({isPressed}) => scaling({isPressed: isLinkPressed || isPressed})}
        className={renderProps => treeRow(renderProps)}
        render={domProps => (
          <ViewTransition {...viewTransition}>
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
  let {isCollapsed = false} = useContext(SideNavPanelContext);
  let renderIcon = useSideNavIcon(isCollapsed);
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
                render: renderIcon,
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

const sideNavHeader = style<{isCollapsed: boolean}>({
  position: 'relative',
  display: {
    default: 'block',
    // Lets the divider that takes the label's place center itself.
    isCollapsed: 'flex'
  },
  font: 'ui-sm',
  // Component/S/Medium for the font, doesn't appear to match our fonts
  fontWeight: 'medium',
  color: 'gray-600',
  paddingStart: {
    default: 'edge-to-text',
    isCollapsed: 0
  },
  marginBottom: '[8px]',
  height: 16
});

const sideNavHeaderDivider = style({
  // The divider styles stretch it, which would pin it to the top of the header.
  alignSelf: 'center',
  width: 'full'
});

/**
 * Renders the header's element, for `NavigationTreeHeader`'s `render` prop.
 *
 * Whether the panel is collapsed is read here rather than in SideNavHeader, because this runs as
 * the tree renders, while what SideNavHeader returns is read back out of the collection, which is
 * only rebuilt once the collapse or expand has finished. A header still showing its label until
 * then leaves the rows below it to jump into place after the panel has settled.
 */
function SideNavHeaderElement(props: {domProps: ComponentProps<'div'>}): ReactNode {
  let viewTransition = useSideNavViewTransition();
  let {isCollapsed = false} = useContext(SideNavPanelContext);
  let {children, ...domProps} = props.domProps;
  return (
    <ViewTransition {...viewTransition}>
      <div {...domProps} className={sideNavHeader({isCollapsed})}>
        {isCollapsed ? (
          <div
            role="separator"
            className={mergeStyles(
              divider({size: 'M', orientation: 'horizontal', isStaticColor: false}),
              sideNavHeaderDivider
            )}
          />
        ) : (
          children
        )}
      </div>
    </ViewTransition>
  );
}

export const SideNavHeader = (props: SideNavHeaderProps): ReactNode => (
  <NavigationTreeHeader render={domProps => <SideNavHeaderElement domProps={domProps} />}>
    {props.children}
  </NavigationTreeHeader>
);

export interface SideNavItemLinkProps {
  /** Rendered contents of the link. */
  children?: ReactNode;
}

export const SideNavItemLink = (props: SideNavItemLinkProps): ReactNode => {
  let {children} = props;
  let linkFocus = useContext(SideNavItemLinkContext);
  let {isCollapsed = false} = useContext(SideNavPanelContext);
  let renderIcon = useSideNavIcon(isCollapsed);
  let textId = useId();

  return (
    <Link
      {...props}
      {...linkFocus}
      aria-labelledby={textId}
      data-do-not-hide
      className={treeRowLink({isDisabled: linkFocus.isDisabled})}>
      <Provider
        values={[
          [
            TextContext,
            {
              id: textId,
              styles: treeContent({isCollapsed})
            }
          ],
          [
            IconContext,
            {
              render: renderIcon,
              styles: style({size: '1lh', flexShrink: 0})
            }
          ]
        ]}>
        {typeof children === 'string' ? <Text>{children}</Text> : children}
      </Provider>
    </Link>
  );
};
