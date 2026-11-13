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
import {centerBaseline, CenterBaseline} from './CenterBaseline';
import {
  centerPadding,
  getAllowedOverrides,
  StylesPropWithHeight,
  UnsafeStyles
} from './style-utils' with {type: 'macro'};
import Chevron from '../ui-icons/Chevron';
import {
  ComponentProps,
  ComponentType,
  createContext,
  forwardRef,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  ViewTransitionClass,
  ViewTransitionProps
} from 'react';
import {divider} from './Divider';
import {DOMRef, forwardRefType, GlobalDOMAttributes, Key} from '@react-types/shared';
import {IconContext} from './Icon';
import {InternalSideNavPanelContext, SideNavPanelContext} from './SideNavPanel';
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

// Older React versions just render their children, so items expand and collapse without animating.
const ViewTransition: ComponentType<ViewTransitionProps> =
  React.ViewTransition ?? (({children}) => children);
const addTransitionType: (type: string) => void = React.addTransitionType ?? (() => {});
const startTransition: (scope: () => void) => void =
  React.startTransition ?? ((scope: () => void) => scope());

// Keep in sync with ANIMATION_DURATION in SideNavPanel.tsx, and with SideNav.module.css.
const ANIMATION_DURATION = 200;
const ANIMATION_EASING = 'cubic-bezier(0.45, 0, 0.4, 1)';

// NavigationTree sets aria-level on every item's row. The rail only shows the top level.
const NESTED_ROW_SELECTOR = '[aria-level]:not([aria-level="1"])';

interface InternalSideNavContextValue {
  /** Whether the panel is collapsed or collapsing. */
  isCollapsedOrCollapsing: boolean;
  /** Whether the panel is changing width, with the rows keeping their expanded layout. */
  isTransitioning: boolean;
  /** Whether the panel has finished collapsing to its icon rail. */
  isRail: boolean;
  /** The class for the <ViewTransition> around each row and header. */
  viewTransition: ViewTransitionClass;
  /**
   * The items that the latest toggle expanded or collapsed. These aren't cleared afterwards, but
   * only matter during that toggle's view transition.
   */
  toggledKeys: Set<Key>;
  /** Clips an item's view transition to the nav. */
  clip?: () => (() => void) | undefined;
}

const InternalSideNavContext = createContext<InternalSideNavContextValue>({
  isCollapsedOrCollapsing: false,
  isTransitioning: false,
  isRail: false,
  viewTransition: 'none',
  toggledKeys: new Set()
});

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
  let panel = useContext(InternalSideNavPanelContext);
  // A custom panel can provide SideNavPanelContext instead, but the rows won't animate as its width
  // changes.
  let publicPanel = useContext(SideNavPanelContext) ?? {};
  let isInSideNavPanel = panel != null || publicPanel.isCollapsed !== undefined;
  let isRail = panel ? panel.isRail : !!publicPanel.isCollapsed;
  let isCollapsedOrCollapsing = panel ? panel.isCollapsedOrCollapsing : isRail;
  let isTransitioning = panel?.isTransitioning ?? false;
  let isContentPinned = panel?.isContentPinned ?? false;
  let setCollapsed = panel ? panel.setCollapsed : publicPanel.setCollapsed;

  let [expandedKeys, setExpandedKeys] = useControlledState(
    propExpandedKeys ? new Set(propExpandedKeys) : undefined,
    propDefaultExpandedKeys ? new Set(propDefaultExpandedKeys) : new Set(),
    onExpandedChange
  );

  // The rail is only wide enough for icons, so every item renders closed. The expanded keys are
  // kept rather than cleared, so that expanding the panel restores the tree the user left behind.
  let emptySet = useMemo(() => new Set<Key>(), []);
  let visibleExpandedKeys = isRail ? emptySet : expandedKeys;

  let reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  // Marks this nav's view transitions, so that they don't animate any other nav.
  let navType = useId();
  let [toggledKeys, setToggledKeys] = useState(() => new Set<Key>());

  let toggleExpandedKeys = (keys: Set<Key>) => {
    // The rail has no room for an item's children, so opening an item while the panel is collapsed
    // or collapsing expands the panel to reveal them. Closing one as the panel collapses just
    // closes it.
    let isOpening = [...keys].some(key => !visibleExpandedKeys.has(key));
    if (isRail || (isCollapsedOrCollapsing && isOpening)) {
      let mergedKeys = new Set([...expandedKeys, ...keys]);
      if (mergedKeys.size > expandedKeys.size) {
        setExpandedKeys(mergedKeys);
      }
      setCollapsed?.(false);
      return;
    }

    // A view transition shows snapshots of the rows, so items open and close without animating
    // while the panel changes width.
    if (reduceMotion || isTransitioning) {
      setExpandedKeys(keys);
      return;
    }

    // Expanding or collapsing an item moves every row below it and mounts or unmounts its
    // children, which the <ViewTransition> around each row animates.
    startTransition(() => {
      addTransitionType(sideNavCss.toggle);
      addTransitionType(navType);
      let toggled = new Set<Key>();
      for (let key of keys) {
        if (!visibleExpandedKeys.has(key)) {
          toggled.add(key);
        }
      }
      for (let key of visibleExpandedKeys) {
        if (!keys.has(key)) {
          toggled.add(key);
        }
      }
      setToggledKeys(toggled);
      setExpandedKeys(keys);
    });
  };

  // View transitions are drawn above the whole page, so clip them to the nav.
  let clipRef = useRef<Animation | null>(null);
  let clip = useCallback(() => {
    let nav = domRef.current;
    if (clipRef.current || !nav) {
      return;
    }

    let {left, top, right, bottom} = nav.getBoundingClientRect();
    let polygon = `polygon(${left}px ${top}px, ${right}px ${top}px, ${right}px ${bottom}px, ${left}px ${bottom}px)`;
    let animation = document.documentElement.animate(
      {clipPath: [polygon, polygon]},
      {pseudoElement: '::view-transition', duration: ANIMATION_DURATION, fill: 'forwards'}
    );
    clipRef.current = animation;
    return () => {
      animation.cancel();
      if (clipRef.current === animation) {
        clipRef.current = null;
      }
    };
  }, [domRef]);

  // A view transition shows snapshots of the rows, so end any that are still animating before the
  // panel starts to change width. Only one view transition runs at a time, and clipRef is only set
  // during this nav's, so all of these animations belong to it.
  useLayoutEffect(() => {
    if (!clipRef.current) {
      return;
    }

    for (let animation of document.documentElement.getAnimations({subtree: true})) {
      let effect = animation.effect as KeyframeEffect | null;
      if (effect?.pseudoElement?.startsWith('::view-transition')) {
        try {
          animation.finish();
        } catch {
          // Animations that never end can't be finished.
        }
      }
    }
  }, [isCollapsedOrCollapsing]);

  // The rows keep their expanded layout while the panel changes width, so nested rows close as the
  // panel collapses, and open as it expands. This waits for the panel to pin its contents, since
  // until then, an expanding panel's rows are laid out at its collapsed width.
  let nestedRowAnimations = useRef(new Map<Element, Animation>());
  useLayoutEffect(() => {
    let animations = nestedRowAnimations.current;
    if (!isContentPinned) {
      for (let animation of animations.values()) {
        animation.cancel();
      }
      animations.clear();
      return;
    }

    // The panel turned around part way through.
    for (let animation of animations.values()) {
      animation.reverse();
    }

    // Measure every new row before animating any of them, so that the page is only laid out once.
    let rows = domRef.current?.querySelectorAll<HTMLElement>(NESTED_ROW_SELECTOR) ?? [];
    let newRows = [...rows]
      .filter(row => !animations.has(row))
      .map(row => ({
        row,
        open: {
          height: `${row.offsetHeight}px`,
          minHeight: 0,
          marginTop: getComputedStyle(row).marginTop,
          opacity: 1,
          clipPath: 'inset(0)'
        }
      }));

    let closed = {height: 0, minHeight: 0, marginTop: 0, opacity: 0, clipPath: 'inset(0)'};
    for (let {row, open} of newRows) {
      let animation = row.animate(isCollapsedOrCollapsing ? [open, closed] : [closed, open], {
        duration: ANIMATION_DURATION,
        easing: ANIMATION_EASING,
        fill: 'both'
      });
      animations.set(row, animation);
    }
  }, [isContentPinned, isCollapsedOrCollapsing, domRef]);

  let context = useMemo(
    () => ({
      isCollapsedOrCollapsing,
      isTransitioning,
      isRail,
      // Only this nav's item toggles animate its rows. A class without a default is "auto".
      viewTransition: reduceMotion ? 'none' : {[navType]: sideNavCss.item, default: 'none'},
      toggledKeys,
      clip
    }),
    [isCollapsedOrCollapsing, isTransitioning, isRail, reduceMotion, navType, toggledKeys, clip]
  );

  return (
    <InternalSideNavContext.Provider value={context}>
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
    </InternalSideNavContext.Provider>
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
  transition: 'default',
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

interface CollapsibleProps {
  isCollapsedOrCollapsing?: boolean;
  isTransitioning?: boolean;
  isRail?: boolean;
}

const treeContent = style<CollapsibleProps>({
  gridArea: 'content',
  paddingY: `--centerPadding`,
  flexShrink: 1,
  minWidth: 0,
  opacity: {
    isCollapsedOrCollapsing: 0
  },
  transition: {
    default: 'none',
    isTransitioning: 'opacity'
  },
  transitionDuration: ANIMATION_DURATION,
  // The rail has no room for the label, but it still names the item.
  position: {
    isRail: 'absolute'
  },
  inset: {
    isRail: 0
  },
  overflow: {
    isRail: 'hidden'
  },
  pointerEvents: {
    isRail: 'none'
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

// Anything else in a row, such as an ActionMenu, fades out along with the label.
const fadeUnmarkedChildren = css(
  '& > :not([data-do-not-hide], [data-rsp-slot=text]) {opacity: 0; visibility: hidden;}'
);
const transitionUnmarkedChildren = css(
  `& > :not([data-do-not-hide], [data-rsp-slot=text]) {transition: opacity ${ANIMATION_DURATION}ms ${ANIMATION_EASING}, visibility ${ANIMATION_DURATION}ms ${ANIMATION_EASING};}`
);
// The rail takes them out of the row's layout. Unlike display: none, this lets them fade back in as
// the panel expands.
const removeUnmarkedChildren = css(
  '& > :not([data-do-not-hide], [data-rsp-slot=text]) {position: absolute; inset: 0; overflow: hidden;}'
);

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

  return (
    <SideNavInternalItemContext.Provider value={{setLinkPressed}}>
      <NavigationTreeItem
        {...props}
        ref={rowRef}
        style={({isPressed}) => scaling({isPressed: isLinkPressed || isPressed})}
        className={renderProps => treeRow(renderProps)}
        render={(domProps, {id}) => <SideNavItemRow id={id} domProps={domProps} />}
      />
    </SideNavInternalItemContext.Provider>
  );
};

// NavigationTree renders each row from its collection, which only receives SideNavItem's new props
// once this update has committed. Reading the toggled items from context instead includes them in
// the update that starts the view transition.
function SideNavItemRow({id, domProps}: {id: Key; domProps: ComponentProps<'div'>}) {
  let {viewTransition, toggledKeys, clip} = useContext(InternalSideNavContext);
  return (
    <ViewTransition
      default={viewTransition}
      // The pressed item stays live, so that it doesn't jump as it scales back.
      update={toggledKeys.has(id) ? 'none' : undefined}
      onEnter={clip}
      onExit={clip}
      onUpdate={clip}>
      <div {...domProps} />
    </ViewTransition>
  );
}

export interface SideNavItemContentProps {
  /** Rendered contents of the side nav item or child items. */
  children: ReactNode;
}

const indicator = style<{
  isDisabled: boolean;
  isSelected: boolean;
  isHovered: boolean;
  isTransitioning: boolean;
}>({
  position: 'absolute',
  opacity: {
    default: 0,
    isSelected: 1,
    isHovered: 1
  },
  transition: {
    default: 'none',
    isTransitioning: 'opacity'
  },
  transitionDuration: ANIMATION_DURATION,
  backgroundColor: {
    default: 'gray-800',
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
  let {isCollapsedOrCollapsing, isTransitioning, isRail} = useContext(InternalSideNavContext);
  let {
    isExpanded,
    hasChildItems,
    isDisabled,
    isCurrent,
    isCurrentAncestor,
    isHovered,
    isFocusVisible,
    level,
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
            isDescendantSelected: isCurrentAncestor && !isExpanded
          }) +
          (isCollapsedOrCollapsing ? ' ' + fadeUnmarkedChildren : '') +
          (isTransitioning ? ' ' + transitionUnmarkedChildren : '') +
          (isRail ? ' ' + removeUnmarkedChildren : '')
        }>
        <div
          data-do-not-hide
          className={indicator({
            isDisabled,
            // As the panel collapses, the indicator moves from a nested item to its top level
            // ancestor, which is all that the rail shows.
            isSelected:
              isCurrent ||
              (isCurrentAncestor && !isExpanded) ||
              (level === 1 && isCurrentAncestor && isCollapsedOrCollapsing),
            isHovered,
            isTransitioning
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
                styles: treeContent({isCollapsedOrCollapsing, isTransitioning, isRail})
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
                render: (icon: ReactNode) => (
                  <CenterBaseline data-do-not-hide slot="icon" styles={treeIcon}>
                    {icon}
                  </CenterBaseline>
                )
              }
            ],
            [ActionButtonGroupContext, {styles: treeActions, isDisabled, size: 'S'}],
            [ActionMenuContext, {styles: treeActionMenu, isQuiet: true, isDisabled, size: 'S'}]
          ]}>
          {typeof children === 'string' ? <Text>{children}</Text> : children}
        </Provider>
      </div>
      <ExpandableRowChevron
        isCollapsedOrCollapsing={isCollapsedOrCollapsing}
        isTransitioning={isTransitioning}
        isRail={isRail}
        isDisabled={isDisabled}
        isExpanded={isExpanded}
        scale={scale}
        isHidden={!hasChildItems}
      />
    </>
  );
};

interface ExpandableRowChevronProps extends CollapsibleProps {
  isExpanded?: boolean;
  isDisabled?: boolean;
  isRTL?: boolean;
  scale: 'medium' | 'large';
  isHidden?: boolean;
}

const expandButton = style<ExpandableRowChevronProps>({
  display: 'flex',
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
  opacity: {
    isCollapsedOrCollapsing: 0
  },
  transition: {
    default: 'default',
    isTransitioning: '[opacity, visibility]'
  },
  transitionDuration: {
    default: 150,
    isTransitioning: ANIMATION_DURATION
  },
  backgroundColor: 'transparent',
  borderStyle: 'none',
  disableTapHighlight: true,
  visibility: {
    isHidden: 'hidden',
    isCollapsedOrCollapsing: 'hidden'
  },
  position: {
    isRail: 'absolute'
  },
  insetEnd: {
    isRail: 0
  },
  top: {
    isRail: 0
  }
});

function ExpandableRowChevron(props: ExpandableRowChevronProps) {
  let expandButtonRef = useRef<HTMLButtonElement>(null);
  let [fullProps, ref] = useContextProps(
    {...props, slot: 'chevron'},
    expandButtonRef,
    ButtonContext
  );
  let {isExpanded, scale, isHidden, isCollapsedOrCollapsing, isTransitioning, isRail} = fullProps;
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
          isCollapsedOrCollapsing,
          isTransitioning,
          isRail,
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

const headerStyle = style({
  position: 'relative',
  font: 'ui-sm',
  // Component/S/Medium for the font, doesn't appear to match our fonts
  fontWeight: 'medium',
  color: 'gray-600',
  paddingStart: 'edge-to-text',
  marginBottom: '[8px]',
  height: 16
});

const headerText = style<CollapsibleProps>({
  opacity: {
    isCollapsedOrCollapsing: 0
  },
  transition: {
    default: 'none',
    isTransitioning: 'opacity'
  },
  transitionDuration: ANIMATION_DURATION,
  position: {
    isRail: 'absolute'
  },
  inset: {
    isRail: 0
  },
  overflow: {
    isRail: 'hidden'
  }
});

// The rail shows a divider in place of each section's header.
const headerDivider = style<CollapsibleProps>({
  position: 'absolute',
  top: '50%',
  translateY: '-50%',
  insetStart: 8,
  width: 26,
  opacity: {
    default: 0,
    isCollapsedOrCollapsing: 1
  },
  transition: {
    default: 'none',
    isTransitioning: 'opacity'
  },
  transitionDuration: ANIMATION_DURATION,
  pointerEvents: 'none'
});

export const SideNavHeader = (props: SideNavHeaderProps): ReactNode => {
  let {isCollapsedOrCollapsing, isTransitioning, isRail, viewTransition, clip} =
    useContext(InternalSideNavContext);
  let id = useId();
  return (
    <NavigationTreeHeader
      id={id}
      className={headerStyle}
      render={domProps => (
        <ViewTransition default={viewTransition} onEnter={clip} onExit={clip} onUpdate={clip}>
          <div {...domProps}>
            {domProps.children}
            <div
              aria-hidden
              className={mergeStyles(
                divider({size: 'M', orientation: 'horizontal', isStaticColor: false}),
                headerDivider({isCollapsedOrCollapsing, isTransitioning})
              )}
            />
          </div>
        </ViewTransition>
      )}>
      <span className={headerText({isCollapsedOrCollapsing, isTransitioning, isRail})}>
        {props.children}
      </span>
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
  let {isCollapsedOrCollapsing, isTransitioning, isRail} = useContext(InternalSideNavContext);
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
              styles: treeContent({isCollapsedOrCollapsing, isTransitioning, isRail})
            }
          ],
          [
            IconContext,
            {
              render: centerBaseline({slot: 'icon', styles: treeIcon}),
              styles: style({size: '1lh', flexShrink: 0})
            }
          ]
        ]}>
        {typeof children === 'string' ? <Text>{children}</Text> : children}
      </Provider>
    </Link>
  );
};
