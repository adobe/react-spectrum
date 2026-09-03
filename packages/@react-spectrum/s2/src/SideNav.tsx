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
import {Badge, BadgeContext, BadgeProps} from './Badge';
import {baseColor, focusRing, space, style} from '../style' with {type: 'macro'};
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
  createContext,
  forwardRef,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {createIcon} from './Icon';
import {Divider} from './Divider';
import {DOMRef, forwardRefType, GlobalDOMAttributes, Key} from '@react-types/shared';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {IconContext} from './Icon';
import intlMessages from '../intl/*.json';
import {keyframes} from '../style/style-macro' with {type: 'macro'};
import {Link, LinkContext} from 'react-aria-components/Link';
import {mergeProps} from 'react-aria/mergeProps';
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
import {NotificationBadge, NotificationBadgeContext} from './NotificationBadge';
import {NumberFormatter} from '@internationalized/number';
import {pressScale} from './pressScale';
import {Provider, useContextProps} from 'react-aria-components/slots';
import {Text, TextContext} from './Content';
import {useControlledState} from 'react-stately/useControlledState';
import {useDOMRef} from './useDOMRef';
import {useHover} from 'react-aria/useHover';
import {useId} from 'react-aria/useId';
import {useLocale} from 'react-aria/I18nProvider';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useMediaQuery} from './useMediaQuery';
import {useScale} from './utils';

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

  let collapseAwareExpandedKeys = expandedKeys;
  let emptySet = useMemo(() => new Set<Key>(), []);
  if (isCollapsed) {
    collapseAwareExpandedKeys = emptySet;
  }

  return (
    <div
      data-this-one
      ref={domRef}
      className={(UNSAFE_className ?? '') + sideNavWrapper({isInSidePanel}, props.styles)}
      style={UNSAFE_style}>
      <NavigationTree
        {...rest}
        expandedKeys={collapseAwareExpandedKeys}
        onExpandedChange={setExpandedKeys}
        selectedRoute={selectedRoute}
        className={renderProps => tree({...renderProps, isInSidePanel})}>
        {children}
      </NavigationTree>
    </div>
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
  gridTemplateColumns: {
    default: [12, 'auto', 'auto', '1fr', 'auto', 'auto'],
    isCollapsed: [12, 'auto', 'auto', '1fr', 0, 12]
  },
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

const fadeInKeyframes = keyframes(`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`);

const treeContent = style<{isCollapsed?: boolean; isInSidePanel?: boolean}>({
  display: {
    default: 'block',
    isCollapsed: 'none'
  },
  gridArea: 'content',
  paddingY: `--centerPadding`,
  // In a side panel the label hides instantly on collapse (display:none above) and fades in quickly
  // when it reappears on expand. Scoped to the side panel so a plain SideNav's labels don't animate.
  animation: {
    isInSidePanel: {
      default: fadeInKeyframes,
      '@media (prefers-reduced-motion: reduce)': 'none'
    }
  },
  animationDuration: 150,
  animationDelay: 200,
  animationFillMode: 'backwards'
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

const treeRowButton = style({
  display: 'grid',
  gridArea: 'content',
  gridTemplateColumns: ['auto', '1fr', 'auto'],
  gridTemplateAreas: ['icon content badge'],
  alignItems: 'center',
  minWidth: 0,
  outlineStyle: 'none',
  textDecoration: 'none',
  color: 'inherit',
  cursor: 'default',
  backgroundColor: {
    default: 'transparent',
    isHovered: baseColor('gray-100').isHovered
  },
  borderStyle: 'none',
  padding: 4,
  margin: -4,
  borderRadius: 'sm',
  textAlign: 'inherit',
  font: 'ui'
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
  let {isCollapsed = false} = useContext(SidePanelContext);

  return (
    <SideNavInternalItemContext.Provider value={{setLinkPressed}}>
      <NavigationTreeItem
        {...props}
        ref={rowRef}
        // When collapsed, every item renders as a focusable expanding button, so focus the child
        // rather than the row — otherwise keyboard focus lands on the row and items without an
        // href (which default to row focus) can't be reached or activated.
        focusMode={isCollapsed ? 'child' : undefined}
        style={({isPressed}) => scaling({isPressed: isLinkPressed || isPressed})}
        className={renderProps => treeRow(renderProps)}
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
  let sidePanelContext = useContext(SidePanelContext);
  let {isCollapsed = false, showControls = true} = sidePanelContext;
  let isInSidePanel = sidePanelContext.isCollapsed !== undefined;
  // Hide row controls while collapsed and during the expand animation (they reveal once expanded).
  let isControlsHidden = isInSidePanel && !showControls;
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
        className={treeCellGrid({
          isDisabled,
          isSelected: isCurrent,
          isDescendantSelected: isCurrentAncestor && !isExpanded,
          isCollapsed
        })}>
        <div
          className={indicator({
            isDisabled,
            isSelected: isCurrent || (isCurrentAncestor && isCollapsed),
            isHovered
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
            [TextContext, {styles: treeContent({isCollapsed})}],
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
            [ActionMenuContext, {styles: treeActionMenu, isQuiet: true, isDisabled, size: 'S'}],
            [BadgeContext, {size: 'S', fillStyle: 'subtle', styles: style({gridArea: 'badge'})}],
            [
              NotificationBadgeContext,
              {
                size: 'S',
                styles: style({position: 'absolute', insetEnd: 8, top: 4, gridArea: 'icon'})
              }
            ]
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
        isInSidePanel={isInSidePanel}
        isControlsHidden={isControlsHidden}
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
  isInSidePanel?: boolean;
  isControlsHidden?: boolean;
}

const expandButton = style<ExpandableRowChevronProps>({
  display: {
    default: 'flex',
    isCollapsed: 'none',
    // Removed from layout while collapsed/expanding so it doesn't reflow the narrow panel.
    isControlsHidden: 'none'
  },
  // Fade the chevron in once the panel has finished expanding (display flips back on). Gated on the
  // hidden state so the animation-name changes none -> fadeIn on reveal, forcing it to (re)play.
  animation: {
    isInSidePanel: {
      default: fadeInKeyframes,
      isControlsHidden: 'none',
      '@media (prefers-reduced-motion: reduce)': 'none'
    }
  },
  animationDuration: 150,
  animationFillMode: 'backwards',
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
  let {isExpanded, scale, isHidden, isCollapsed, isInSidePanel, isControlsHidden} = fullProps;
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
          isHidden,
          isInSidePanel,
          isControlsHidden
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
  let {isCollapsed = false} = useContext(SidePanelContext);
  let id = useId();
  return (
    <NavigationTreeHeader
      id={id}
      className={style({
        font: 'ui-sm',
        // Component/S/Medium for the font, doesn't appear to match our fonts
        fontWeight: 'medium',
        color: 'gray-600',
        paddingStart: 'edge-to-text',
        marginBottom: '[8px]',
        height: 16
      })}>
      {isCollapsed ? (
        <Divider aria-labelledby={id} orientation="horizontal" styles={style({marginX: 8})} />
      ) : (
        props.children
      )}
    </NavigationTreeHeader>
  );
};

export interface SideNavItemLinkProps {
  /** Rendered contents of the link. */
  children?: ReactNode;
}

let SideNavItemButton = (
  props: SideNavItemLinkProps & {onExpandSidePanel: () => void}
): ReactNode => {
  let {children, onExpandSidePanel} = props;
  let linkFocus = useContext(SideNavItemLinkContext);
  let linkProps = useContext(LinkContext);
  let {isCollapsed = false} = useContext(SidePanelContext);
  let labelId = useId();
  let additionalExplanation = 'panel collapsed, click to expand';
  let additionalExplanationId = useId();

  let eventHandlers = linkProps
    ? Object.keys(linkProps).reduce(
        (acc, key) => {
          if (key.startsWith('on')) {
            acc[key] = linkProps[key];
          }
          return acc;
        },
        {} as Record<string, any>
      )
    : {};
  return (
    <Button
      {...props}
      {...mergeProps(eventHandlers, linkFocus)}
      onPress={() => {
        onExpandSidePanel?.();
      }}
      aria-expanded={false}
      aria-labelledby={`${labelId} ${additionalExplanationId}`}
      className={treeRowButton}>
      <Provider
        values={[
          [TextContext, {styles: treeContent({isCollapsed}), id: labelId}],
          [
            IconContext,
            {
              render: centerBaseline({slot: 'icon', styles: treeIcon({isCollapsed})}),
              styles: style({size: '1lh', flexShrink: 0})
            }
          ]
        ]}>
        {typeof children === 'string' ? <Text>{children}</Text> : children}
        <span className={style({display: 'none'})} id={additionalExplanationId}>
          {additionalExplanation}
        </span>
      </Provider>
    </Button>
  );
};

export const SideNavItemLink = (props: SideNavItemLinkProps): ReactNode => {
  let {children} = props;
  let linkFocus = useContext(SideNavItemLinkContext);
  let sidePanelContext = useContext(SidePanelContext);
  let {isCollapsed = false, setCollapsed} = sidePanelContext;
  let isInSidePanel = sidePanelContext.isCollapsed !== undefined;
  let linkRef = useRef<HTMLAnchorElement>(null);

  let isFocusedRef = useRef(false);
  useEffect(() => {
    if (!isCollapsed && isFocusedRef.current) {
      linkRef.current?.focus();
    }
    isFocusedRef.current = false;
  }, [isCollapsed]);

  if (isCollapsed) {
    return (
      <SideNavItemButton
        {...props}
        onExpandSidePanel={() => {
          setCollapsed?.(false);
          // if the SidePanel is expanded via this button, we know it was focused
          isFocusedRef.current = true;
        }}
      />
    );
  }

  return (
    <Link
      {...props}
      {...linkFocus}
      ref={linkRef}
      className={treeRowLink({isDisabled: linkFocus.isDisabled})}>
      <Provider
        values={[
          [TextContext, {styles: treeContent({isCollapsed, isInSidePanel})}],
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

interface SidePanelProps<T> extends Omit<SideNavProps<T>, 'children'> {
  /** The content of the side panel. */
  children?: ReactNode;
  /** Whether the side panel is collapsed (controlled). */
  isCollapsed?: boolean;
  /** Whether the side panel is collapsed by default (uncontrolled). */
  defaultCollapsed?: boolean;
  /** Handler that is called when the collapsed state changes. */
  onCollapsedChange?: (isCollapsed: boolean) => void;
}

const SidePanelContext = createContext<{
  isCollapsed?: boolean;
  setCollapsed?: (isCollapsed: boolean) => void;
  // Whether row controls (chevron, action buttons, etc.) should be shown. False while collapsed and
  // during the expand animation, so they stay out of layout until there is room; true once expanded.
  showControls?: boolean;
}>({});

// Duration of the collapse/expand width transition (see sidePanelStyle). Row controls are revealed
// only after this completes so they don't reflow the panel while it is still narrow.
const COLLAPSE_ANIMATION_DURATION = 200;

const sidePanelStyle = style(
  {
    display: 'flex',
    flexDirection: 'column',
    height: 'full',
    // The expanded width is supplied by the consumer via the `styles` prop. When collapsed, SidePanel
    // applies an inline `width: var(--collapsedWidth)` (the fixed icon-rail size) which overrides that
    // class-based width; the CSS width transition animates between the two. overflow clips the labels
    // as the panel grows/shrinks.
    '--collapsedWidth': {
      type: 'width',
      value: 42
    },
    overflow: 'hidden',
    transition: {
      default: '[width]',
      '@media (prefers-reduced-motion: reduce)': 'none'
    },
    transitionDuration: 200,
    transitionTimingFunction: 'default'
  },
  getAllowedOverrides({height: true})
);

export const SidePanel = /*#__PURE__*/ (forwardRef as forwardRefType)(function SidePanelProps<T>(
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

  // Row controls are hidden while collapsed and during the expand animation, then revealed once the
  // width transition has finished so they don't reflow the panel while it is still too narrow.
  let reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  let [showControls, setShowControls] = useState(!isCollapsed);
  useEffect(() => {
    if (isCollapsed) {
      setShowControls(false);
      return;
    }
    if (reduceMotion) {
      setShowControls(true);
      return;
    }
    let timeout = setTimeout(() => setShowControls(true), COLLAPSE_ANIMATION_DURATION);
    return () => clearTimeout(timeout);
  }, [isCollapsed, reduceMotion]);

  let filteredProps = filterDOMProps(otherProps);
  return (
    <SidePanelContext.Provider value={{isCollapsed, setCollapsed, showControls}}>
      <div
        {...filteredProps}
        ref={domRef}
        // When collapsed, override the consumer's class-based (expanded) width with the fixed icon-rail
        // width. The CSS width transition animates between the two.
        style={{...UNSAFE_style, width: isCollapsed ? 'var(--collapsedWidth)' : undefined}}
        className={UNSAFE_className + sidePanelStyle(null, styles)}>
        <div className={style({flexGrow: 1, flexShrink: 1, minHeight: 0})}>{children}</div>
        <div className={style({flexGrow: 0, flexShrink: 0})}>
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
    <div {...hoverProps} className={style({display: 'contents'})}>
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

// TODO: NotificationBadge doesn't support all the colors
export const SidePanelBadge = (props: Omit<BadgeProps, 'children'> & {value?: number | string}) => {
  let {isCollapsed = false} = useContext(SidePanelContext) ?? {};
  let {locale} = useLocale();
  let formattedValue = props.value;
  if (typeof props.value === 'number') {
    formattedValue = new NumberFormatter(locale).format(Math.min(props.value, 99));
  }
  if (isCollapsed) {
    let value: number | undefined = typeof props.value === 'number' ? props.value : undefined;
    return <NotificationBadge {...props} value={value} />;
  }
  return <Badge {...props}>{formattedValue}</Badge>;
};
