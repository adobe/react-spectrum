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
import {
  AriaLabelingProps,
  DOMRef,
  forwardRefType,
  GlobalDOMAttributes,
  Key
} from '@react-types/shared';
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
  FunctionComponent,
  ReactNode,
  RefObject,
  SVGProps,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  ViewTransitionClass,
  ViewTransitionInstance,
  ViewTransitionProps,
  ViewTransitionPseudoElement
} from 'react';
import {createIcon, IconProps} from './Icon';
import {filterDOMProps} from 'react-aria/filterDOMProps';
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
import React from 'react';
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

// Older React versions are not animated
const ViewTransition: ComponentType<ViewTransitionProps> =
  React.ViewTransition ?? (({children}) => children);
const addTransitionType: (type: string) => void = React.addTransitionType ?? (() => {});
const startTransition: (scope: () => void) => void =
  React.startTransition ?? ((scope: () => void) => scope());

// Transition types, we can easily turn off the animations.
const PANEL_TRANSITION = sideNavCss['side-panel'];
// Added alongside PANEL_TRANSITION rather than instead of it. It only tells the stylesheet which
// edge of the snapshots to anchor, so everything keyed on PANEL_TRANSITION still has to match.
const PANEL_RTL_TRANSITION = sideNavCss['side-panel-rtl'];
const SIDE_NAV_CLASS = sideNavCss['side-nav'];
const ITEM_TRANSITION = sideNavCss['side-nav-item'];

// `default: 'none'` opts elements out of transitions they aren't part of. Rows and headers are
// already inside the panel's snapshot when it collapses, and capturing them again would lift them
// out of it and let them animate past its edges.
const panelViewTransition: ViewTransitionClass = {
  default: 'none',
  [PANEL_TRANSITION]: SIDE_NAV_CLASS
};
const itemViewTransition: ViewTransitionClass = {
  default: 'none',
  [ITEM_TRANSITION]: SIDE_NAV_CLASS
};

// A snapshot is a pseudo element on the document root, so the nav's `overflow: clip` doesn't reach
// it and rows sliding in or out paint over the rest of the app. `view-transition-group: contain`
// would nest the snapshots inside the nav's own group, but it is only implemented in Chrome, so
// each snapshot gets a clip path holding it inside the nav instead.
//
// The clip path follows the snapshot animation.

/** A rect in the coordinates snapshots are placed in, which match the viewport. */
interface Rect {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

function intersect(a: Rect, b: Rect): Rect {
  return {
    top: Math.max(a.top, b.top),
    right: Math.min(a.right, b.right),
    bottom: Math.min(a.bottom, b.bottom),
    left: Math.max(a.left, b.left)
  };
}

/**
 * Converts bounds into a `clip-path` for a snapshot, which is clipped before its group's transform
 * places it, so the bounds have to be mapped back through that transform. Sides that fall outside
 * the snapshot clamp to zero, leaving whatever part of it is within the bounds.
 */
function getClipPath(group: ViewTransitionPseudoElement, bounds: Rect): string {
  let style = group.getComputedStyle();
  let width = parseFloat(style.width);
  let height = parseFloat(style.height);

  // Firefox reports the origin as percentages where other browsers resolve it to pixels.
  let [x = '0', y = '0'] = style.transformOrigin.split(' ');
  let resolve = (value: string, size: number) =>
    (value.endsWith('%') ? (parseFloat(value) / 100) * size : parseFloat(value)) || 0;
  let originX = resolve(x, width);
  let originY = resolve(y, height);

  let toLocal = new DOMMatrixReadOnly()
    .translate(originX, originY)
    .multiply(new DOMMatrixReadOnly(style.transform === 'none' ? '' : style.transform))
    .translate(-originX, -originY)
    .inverse();
  let topLeft = toLocal.transformPoint({x: bounds.left, y: bounds.top});
  let bottomRight = toLocal.transformPoint({x: bounds.right, y: bounds.bottom});

  let insets = [topLeft.y, width - bottomRight.x, height - bottomRight.y, topLeft.x];
  return `inset(${insets.map(inset => Math.max(0, inset) + 'px').join(' ')})`;
}

/** Measures a snapshot, returning a function that applies what it measured. */
type Clip = () => () => void;

let clips = new Set<Clip>();
let clipFrame = 0;

function updateClips() {
  // Every snapshot is measured before any of them is clipped, so a clip never invalidates the
  // style the next measurement needs, which would recalculate the layout once per snapshot.
  let writes = Array.from(clips, read => read());
  for (let write of writes) {
    write();
  }

  clipFrame = clips.size > 0 ? requestAnimationFrame(updateClips) : 0;
}

/**
 * Runs `clip` now and on every frame until the returned function is called. Animations are updated
 * before frame callbacks run, so a snapshot measured here is where it is about to be drawn rather
 * than where it was drawn last frame, and every snapshot in a transition shares this one loop so
 * they are all clipped for the same frame.
 */
function trackClip(clip: Clip): () => void {
  clip()();
  clips.add(clip);
  if (clipFrame === 0) {
    clipFrame = requestAnimationFrame(updateClips);
  }

  return () => {
    clips.delete(clip);
    if (clips.size === 0 && clipFrame !== 0) {
      cancelAnimationFrame(clipFrame);
      clipFrame = 0;
    }
  };
}

/**
 * Props for a `<ViewTransition>` whose snapshot has to stay inside `getBounds()`, which is read
 * fresh each frame so the clip tracks anything the bounds are still animating to.
 */
function useClippedViewTransition(
  transition: ViewTransitionClass,
  getBounds: () => Rect | null
): Omit<ViewTransitionProps, 'children'> {
  return useMemo(() => {
    let clip = ({group}: ViewTransitionInstance) => {
      // A zero length animation holds its value indefinitely, which is the only way to set a
      // property on a pseudo element that no selector can reach.
      let animation = group.animate([], {duration: 0, fill: 'forwards'});
      let effect = animation.effect as KeyframeEffect;

      let stop = trackClip(() => {
        let bounds = getBounds();
        let clipPath = bounds && getClipPath(group, bounds);
        return () => {
          if (clipPath) {
            // Both keyframes get the same value because a lone keyframe is the one to animate
            // *to*, which would leave the clip interpolating out of whatever was underneath it.
            effect.setKeyframes([{clipPath}, {clipPath}]);
          }
        };
      });

      // React only cleans up the animations that were already there when it captured the snapshot.
      return () => {
        stop();
        animation.cancel();
      };
    };

    return {default: transition, onEnter: clip, onExit: clip, onUpdate: clip};
  }, [transition, getBounds]);
}

interface SideNavViewTransitionValue {
  /** The class applied to each row and header snapshot. */
  transition: ViewTransitionClass;
  /** Reads the bounds to clip snapshots to, as they are for the frame being drawn. */
  getClipBounds: () => Rect | null;
}

const SideNavViewTransitionContext = createContext<SideNavViewTransitionValue>({
  transition: 'none',
  getClipBounds: () => null
});

/** Props for the `<ViewTransition>` around each row and header. */
function useSideNavViewTransition(): Omit<ViewTransitionProps, 'children'> {
  let {transition, getClipBounds} = useContext(SideNavViewTransitionContext);
  return useClippedViewTransition(transition, getClipBounds);
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
  let panelRef = useContext(SidePanelBoundsContext);

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

  let viewTransition = useMemo(
    (): SideNavViewTransitionValue => ({
      transition: reduceMotion ? 'none' : itemViewTransition,
      getClipBounds: () => {
        let nav = domRef.current;
        if (!nav) {
          return null;
        }

        // Rows stay within the nav, and within the panel while it is still widening or narrowing
        // around them, so they never reach the content beside it either.
        let bounds = nav.getBoundingClientRect();
        let panel = panelRef?.current;
        return panel ? intersect(bounds, panel.getBoundingClientRect()) : bounds;
      }
    }),
    [reduceMotion, domRef, panelRef]
  );

  return (
    <SideNavViewTransitionContext.Provider value={viewTransition}>
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
  let viewTransition = useSideNavViewTransition();
  // Hidden via state rather than a descendant selector so the header re-renders, which is what
  // includes it in the view transition.
  let {isCollapsed = false} = useContext(SidePanelContext);
  return (
    <NavigationTreeHeader
      render={domProps => (
        <ViewTransition {...viewTransition}>
          <div {...domProps} />
        </ViewTransition>
      )}
      className={style<{isCollapsed: boolean}>({
        position: 'relative',
        display: {
          default: 'block',
          isCollapsed: 'none'
        },
        font: 'ui-sm',
        // Component/S/Medium for the font, doesn't appear to match our fonts
        fontWeight: 'medium',
        color: 'gray-600',
        paddingStart: 'edge-to-text',
        marginBottom: '[8px]',
        height: 16
      })({isCollapsed})}>
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

export interface SidePanelProps extends AriaLabelingProps, UnsafeStyles {
  /** The content of the side panel. */
  children?: ReactNode;
  /**
   * The width of the side panel when it is expanded, in pixels.
   *
   * @default 208
   */
  width?: number;
  /** Whether the side panel is collapsed (controlled). */
  isCollapsed?: boolean;
  /** Whether the side panel is collapsed by default (uncontrolled). */
  defaultCollapsed?: boolean;
  /** Handler that is called when the collapsed state changes. */
  onCollapsedChange?: (isCollapsed: boolean) => void;
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight;
}

interface SidePanelContextValue {
  /** Whether the side panel is currently collapsed. */
  isCollapsed?: boolean;
  /** Sets whether the side panel is collapsed. */
  setCollapsed?: (isCollapsed: boolean) => void;
}

export const SidePanelContext = createContext<SidePanelContextValue>({});

/** The panel a SideNav is inside, which it clips its snapshots to while the width transitions. */
const SidePanelBoundsContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

const sidePanelStyle = style(
  {
    height: 'full',
    minHeight: 0,
    boxSizing: 'border-box',
    // Not captured by the view transition, so it keeps painting live and the page reflows with it.
    transition: {
      default: '[width]',
      '@media (prefers-reduced-motion: reduce)': 'none'
    },
    // Keep in sync with the group animation in SideNav.module.css.
    transitionDuration: 200,
    transitionTimingFunction: 'default',
    '--collapsedWidth': {
      type: 'width',
      value: 42
    }
  },
  getAllowedOverrides({height: true})
);

// The ViewTransition captured element. Its width snaps rather than transitioning. A CSS transition still reports
// its starting width when the new state is captured, which would leave the snapshot at the old
// width for the whole animation and then jump.
const sidePanelContentStyle = style({
  display: 'flex',
  flexDirection: 'column',
  height: 'full',
  minHeight: 0
});

/**
 * A SidePanel contains a SideNav and other app chrome in a container that collapses to an icon
 * rail.
 */
export const SidePanel = /*#__PURE__*/ forwardRef(function SidePanel(
  props: SidePanelProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {
    children,
    UNSAFE_className = '',
    UNSAFE_style,
    styles,
    width = 208,
    isCollapsed: propIsCollapsed,
    defaultCollapsed,
    onCollapsedChange,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let [isCollapsed, setCollapsed] = useControlledState<boolean>(
    propIsCollapsed,
    defaultCollapsed ?? false,
    onCollapsedChange
  );
  let reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  let {direction} = useLocale();

  // `isCollapsed` can change from anywhere (the toggle below, or a controlled prop), so the
  // transition starts here rather than at each call site. The extra render keeps the old state on
  // screen for the transition to capture.
  let [renderedCollapsed, setRenderedCollapsed] = useState(isCollapsed);
  useLayoutEffect(() => {
    if (renderedCollapsed !== isCollapsed) {
      startTransition(() => {
        addTransitionType(PANEL_TRANSITION);
        if (direction === 'rtl') {
          addTransitionType(PANEL_RTL_TRANSITION);
        }
        setRenderedCollapsed(isCollapsed);
      });
    }
  }, [isCollapsed, renderedCollapsed, direction]);

  let context = useMemo(
    () => ({isCollapsed: renderedCollapsed, setCollapsed}),
    [renderedCollapsed, setCollapsed]
  );
  // The panel's own snapshot animates to the new width on the view transition's clock, while the
  // panel underneath it transitions on its own. Clipping it to the panel keeps whichever one is
  // ahead from painting over the content beside it.
  let getPanelBounds = useCallback(() => domRef.current?.getBoundingClientRect() ?? null, [domRef]);
  let viewTransition = useClippedViewTransition(
    reduceMotion ? 'none' : panelViewTransition,
    getPanelBounds
  );

  // Both elements share a width so the snapshot lines up with the live element underneath it.
  let panelWidth = renderedCollapsed
    ? 'var(--collapsedWidth)'
    : `calc(${width / 16} * var(--rem, 1rem) * var(--s2-scale, 1))`;

  let filteredProps = filterDOMProps(otherProps, {labelable: true});
  // A labelled collapsible panel must have a role.
  let hasLabel = filteredProps['aria-label'] != null || filteredProps['aria-labelledby'] != null;
  return (
    <SidePanelContext.Provider value={context}>
      <SidePanelBoundsContext.Provider value={domRef}>
        <div
          {...filteredProps}
          role={hasLabel ? 'region' : undefined}
          ref={domRef}
          // Allows any children to hide via css selector instead of the state.
          // This can allow us to get ahead of the double render cycle for collections.
          data-side-panel-collapsed={renderedCollapsed || undefined}
          style={{...UNSAFE_style, width: panelWidth}}
          className={UNSAFE_className + sidePanelStyle(null, styles)}>
          <ViewTransition {...viewTransition}>
            <div className={sidePanelContentStyle} style={{width: panelWidth}}>
              <div
                className={style({
                  flexGrow: 1,
                  flexShrink: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 'full'
                })}>
                {children}
              </div>
              <div className={style({flexGrow: 0, flexShrink: 0, marginBottom: 4, marginTop: 4})}>
                <ExpandButton isCollapsed={isCollapsed} setCollapsed={setCollapsed} />
              </div>
            </div>
          </ViewTransition>
        </div>
      </SidePanelBoundsContext.Provider>
    </SidePanelContext.Provider>
  );
});

function ExpandButton(props: {isCollapsed: boolean; setCollapsed: (isCollapsed: boolean) => void}) {
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');

  let label = stringFormatter.format(`sidepanel.${props.isCollapsed ? 'expand' : 'collapse'}`);

  let {isCollapsed, setCollapsed, ...otherProps} = props;
  let [isHovered, setHovered] = useState(false);
  let {hoverProps} = useHover({onHoverChange: setHovered});
  return (
    <div {...hoverProps} className={style({display: 'contents', marginBottom: 2})}>
      <ActionButton
        {...otherProps}
        aria-label={label}
        isQuiet
        styles={style({alignSelf: 'start'})}
        onPress={() => {
          setCollapsed(!isCollapsed);
          setHovered(false);
        }}>
        <PanelIcon isCollapsed={isCollapsed} isHovered={isHovered} />
      </ActionButton>
    </div>
  );
}

interface PanelIconProps extends IconProps {
  isCollapsed?: boolean;
  isHovered?: boolean;
}

const PanelIcon = createIcon(
  ({
    isCollapsed,
    isHovered,
    ...otherProps
  }: SVGProps<SVGSVGElement> & Pick<PanelIconProps, 'isCollapsed' | 'isHovered'>) => {
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
  }
) as FunctionComponent<PanelIconProps>;
