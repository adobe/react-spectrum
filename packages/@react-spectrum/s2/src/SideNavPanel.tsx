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

import {ActionButton} from './ActionButton';
import {AriaLabelingProps, DOMRef} from '@react-types/shared';
import {createIcon, IconProps} from './Icon';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {
  getAllowedOverrides,
  StylesPropWithHeight,
  UnsafeStyles
} from './style-utils' with {type: 'macro'};
// @ts-ignore
import intlMessages from '../intl/*.json';
import React, {
  ComponentType,
  createContext,
  forwardRef,
  FunctionComponent,
  ReactNode,
  RefObject,
  SVGProps,
  useCallback,
  useMemo,
  useState,
  ViewTransitionClass,
  ViewTransitionInstance,
  ViewTransitionProps,
  ViewTransitionPseudoElement
} from 'react';
import sideNavCss from './SideNav.module.css';
import {style} from '../style' with {type: 'macro'};
import {useControlledState} from 'react-stately/useControlledState';
import {useDOMRef} from './useDOMRef';
import {useHover} from 'react-aria/useHover';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
import {useLocale} from 'react-aria/I18nProvider';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useMediaQuery} from './useMediaQuery';

// Older React versions are not animated
const ViewTransition: ComponentType<ViewTransitionProps> =
  React.ViewTransition ?? (({children}) => children);
const addTransitionType: (type: string) => void = React.addTransitionType ?? (() => {});
const startTransition: (scope: () => void) => void =
  React.startTransition ?? ((scope: () => void) => scope());

// Transition types, we can easily turn off the animations.
export const PANEL_TRANSITION = sideNavCss['side-panel'];
const PANEL_RTL_TRANSITION = sideNavCss['side-panel-rtl']; // Must be applied alongside PANEL_TRANSITION
const SIDE_NAV_CLASS = sideNavCss['side-nav'];

// `default: 'none'` opts an element out of the transitions it isn't part of. The nav is captured
// when the panel collapses, but not when an item inside it expands.
const panelViewTransition: ViewTransitionClass = {
  default: 'none',
  [PANEL_TRANSITION]: SIDE_NAV_CLASS
};

/*
 * Both of the animations here are view transitions: React captures the old and new states of an
 * element as images, the browser paints those over the page in an overlay, and animates between
 * them while the real DOM sits underneath already in its new state. Whatever is captured is
 * replaced by its image until the animation ends. Anything else keeps painting as usual.
 *
 * Collapsing the panel is one transition. The nav is captured whole and cross fades at its new
 * width, with each row's icon captured separately so it can slide to where its row ended up.
 * Expanding an item in the nav is the other, where rows are captured one by one and slide down.
 *
 * Because the snapshots are painted in an overlay instead of in place, the side nav's `overflow:
 * clip` no longer applies and rows paint over the rest of the app. We fix this by clipping on the
 * overlay image through one of two hooks:
 *
 * - `useClippedViewTransition` goes on the Panel's contents and on every row and header. It sets a
 *   `clip-path` on the overlay, which every snapshot is painted inside, so all of them share one
 *   box, the intersection of the bounds each of them registers. Expanding an item clips to the Nav, so
 *   the rows pushed below its bottom edge stop being drawn at the account footer instead of
 *   sliding over it. The footer itself is fine, because the Panel isn't captured during an item
 *   transition and keeps painting live underneath. The overlay is the size of the viewport and
 *   never moves, so bounds match the coordinate system of `clip-path`, rewritten each frame as they change.
 *
 * - `useMovingClippedViewTransition` goes on each row's icon, and clips that one snapshot by
 *   itself. Collapsing the Panel captures its contents as a single image, footer and all, with the
 *   icons travelling over it as images of their own. An icon sliding past the bottom of the nav
 *   needs a box that stops there, while the Panel's image needs one that reaches past it or its
 *   footer disappears for the length of the animation, and one shared box can't be both. A private
 *   clip is measured from its snapshot's own corner, which the motion moves with the
 *   the same keyframes rather than rewritten each frame.
 */

const OVERLAY = '::view-transition';

/** A rect in the coordinates snapshots are placed in, which match the viewport. */
export interface Rect {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function intersect(a: Rect, b: Rect): Rect {
  return {
    top: Math.max(a.top, b.top),
    right: Math.min(a.right, b.right),
    bottom: Math.min(a.bottom, b.bottom),
    left: Math.max(a.left, b.left)
  };
}

/** A `clip-path` for the overlay, which is the size of the viewport. */
function getClipPath(bounds: Rect): string {
  let {top, right, bottom, left} = bounds;
  return `inset(${top}px calc(100% - ${right}px) calc(100% - ${bottom}px) ${left}px)`;
}

// Rows all register the same `getBounds` function, and a set of functions would collapse them
// into one entry, dropped as soon as the first row finished animating. Each registration is
// wrapped in its own object instead, so the overlay stays clipped until every snapshot is done.
let clips = new Set<{getBounds: () => Rect | null}>();
let clipFrame = 0;
let clipAnimation: Animation | null = null;

/** Clips the overlay to the bounds every tracked snapshot is inside. */
function writeClip() {
  let bounds: Rect | null = null;
  for (let {getBounds} of clips) {
    let next = getBounds();
    if (next) {
      bounds = bounds ? intersect(bounds, next) : next;
    }
  }

  if (bounds && clipAnimation) {
    // Both keyframes hold the same value, so there is nothing in between for it to animate to.
    let clipPath = getClipPath(bounds);
    (clipAnimation.effect as KeyframeEffect).setKeyframes([{clipPath}, {clipPath}]);
  }
}

function updateClip() {
  writeClip();
  clipFrame = clips.size > 0 ? requestAnimationFrame(updateClip) : 0;
}

/**
 * Clips the overlay to `getBounds()` until the returned function is called, re-reading the bounds
 * each frame so the clip follows them while they are still animating.
 */
function trackClip(getBounds: () => Rect | null): () => void {
  let clip = {getBounds};
  if (clips.size === 0) {
    // A zero length animation holds its value forever, and an animation is the only way to style
    // the overlay from script.
    clipAnimation = document.documentElement.animate([], {
      duration: 0,
      fill: 'forwards',
      pseudoElement: OVERLAY
    });
  }

  clips.add(clip);
  writeClip();
  if (clipFrame === 0) {
    clipFrame = requestAnimationFrame(updateClip);
  }

  return () => {
    clips.delete(clip);
    if (clips.size === 0) {
      if (clipFrame !== 0) {
        cancelAnimationFrame(clipFrame);
        clipFrame = 0;
      }

      // React only cancels the animations that already existed when it captured the snapshot.
      clipAnimation?.cancel();
      clipAnimation = null;
    }
  };
}

/**
 * Props for a `<ViewTransition>` whose snapshot shares the overlay's clip, narrowed to
 * `getBounds()`.
 */
export function useClippedViewTransition(
  transition: ViewTransitionClass,
  getBounds: () => Rect | null
): Omit<ViewTransitionProps, 'children'> {
  return useMemo(() => {
    let clip = () => trackClip(getBounds);
    return {default: transition, onEnter: clip, onExit: clip, onUpdate: clip};
  }, [transition, getBounds]);
}

/** Where a group's transform puts its origin. */
function getOrigin(transform: unknown): [number, number] {
  // Groups are moved with a matrix, and parsing anything else would throw.
  let matrix = typeof transform === 'string' && transform.startsWith('matrix') ? transform : '';
  let {e, f} = new DOMMatrixReadOnly(matrix);
  return [e, f];
}

/** A `clip-path` for a group whose origin is at `[x, y]`. */
function getGroupClipPath(bounds: Rect, [x, y]: [number, number]): string {
  let {top, right, bottom, left} = bounds;
  // The percentages resolve against the group, so the two edges furthest from its origin follow it
  // as it resizes. Insets reaching past an edge are allowed, and mean that edge isn't clipped.
  return `inset(${top - y}px calc(100% - ${right - x}px) calc(100% - ${bottom - y}px) ${left - x}px)`;
}

/** The bounds `progress` of the way from `from` to `to`. */
function interpolate(from: Rect, to: Rect, progress: number): Rect {
  return {
    top: from.top + (to.top - from.top) * progress,
    right: from.right + (to.right - from.right) * progress,
    bottom: from.bottom + (to.bottom - from.bottom) * progress,
    left: from.left + (to.left - from.left) * progress
  };
}

/** The animation moving a group, which is the only one with a transform to read a position from. */
function getMotion(group: ViewTransitionPseudoElement): Animation | undefined {
  for (let animation of group.getAnimations()) {
    let keyframes = (animation.effect as KeyframeEffect)?.getKeyframes?.();
    if (keyframes?.some(keyframe => keyframe.transform != null)) {
      return animation;
    }
  }
}

/**
 * Clips a snapshot to bounds moving from `from` to `to` for the length of the transition.
 *
 * A snapshot's `clip-path` is measured from its own top left corner, which its motion moves, so
 * the clip is animated from that motion's keyframes: at every point the snapshot is somewhere
 * between the two positions they describe, and the clip is the same amount of the way between
 * `from` and `to`.
 */
function clipGroup(
  group: ViewTransitionPseudoElement,
  [from, to]: ClipBounds
): (() => void) | void {
  if (!from || !to) {
    return;
  }

  let motion = getMotion(group);
  if (!motion) {
    return;
  }

  let effect = motion.effect as KeyframeEffect;
  let keyframes = effect.getKeyframes().map(({computedOffset, easing, transform}) => ({
    offset: computedOffset,
    easing,
    clipPath: getGroupClipPath(interpolate(from, to, computedOffset), getOrigin(transform))
  }));
  let animation = group.animate(keyframes, {...effect.getTiming(), fill: 'both'});
  // Start with the motion rather than whenever this happens to run, or the two drift apart.
  if (motion.startTime != null) {
    animation.startTime = motion.startTime;
  }
  // React only cancels the animations that already existed when it captured the snapshot.
  return () => animation.cancel();
}

/** The bounds to clip to at the start and at the end of a transition. */
export type ClipBounds = [Rect | null, Rect | null];

/**
 * Props for a `<ViewTransition>` whose snapshot is clipped on its own rather than with the rest of
 * the transition, to bounds moving from the first of `getBounds()` to the second.
 *
 * Only elements in both states are captured. One in a single state has nowhere to travel from or
 * to, so it is left to fade with its ancestor's snapshot instead.
 */
export function useMovingClippedViewTransition(
  transition: ViewTransitionClass,
  getBounds: () => ClipBounds
): Omit<ViewTransitionProps, 'children'> {
  return useMemo(
    () => ({
      default: transition,
      enter: 'none',
      exit: 'none',
      onUpdate: ({group}: ViewTransitionInstance) => clipGroup(group, getBounds())
    }),
    [transition, getBounds]
  );
}

export interface SideNavPanelProps extends AriaLabelingProps, UnsafeStyles {
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

interface SideNavPanelContextValue {
  /** Whether the side panel is currently collapsed. */
  isCollapsed?: boolean;
  /**
   * The state the panel is about to render. `isCollapsed` lags it by a commit, which is the last
   * chance descendants get to measure themselves before the transition captures them.
   */
  targetCollapsed?: boolean;
  /** Sets whether the side panel is collapsed. */
  setCollapsed?: (isCollapsed: boolean) => void;
}

export const SideNavPanelContext = createContext<SideNavPanelContextValue>({});

/** The panel a SideNav is inside, which it clips its snapshots to while the width transitions. */
export const SideNavPanelBoundsContext = createContext<RefObject<HTMLDivElement | null> | null>(
  null
);

const sideNavPanelStyle = style(
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
    // The expanded width is supplied by the consumer via `styles`; when collapsed, the inline
    // width below overrides it with the fixed icon-rail size.
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
const sideNavPanelContentStyle = style({
  display: 'flex',
  flexDirection: 'column',
  height: 'full',
  minHeight: 0
});

/**
 * A SideNavPanel contains a SideNav and other app chrome in a container that collapses to an icon
 * rail.
 */
export const SideNavPanel = /*#__PURE__*/ forwardRef(function SideNavPanel(
  props: SideNavPanelProps,
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
    () => ({isCollapsed: renderedCollapsed, targetCollapsed: isCollapsed, setCollapsed}),
    [renderedCollapsed, isCollapsed, setCollapsed]
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
    <SideNavPanelContext.Provider value={context}>
      <SideNavPanelBoundsContext.Provider value={domRef}>
        <div
          {...filteredProps}
          role={hasLabel ? 'region' : undefined}
          ref={domRef}
          // Allow children to hide via CSS instead of waiting for another state render.
          data-side-panel-collapsed={renderedCollapsed || undefined}
          style={{...UNSAFE_style, width: panelWidth}}
          className={UNSAFE_className + sideNavPanelStyle(null, styles)}>
          <ViewTransition {...viewTransition}>
            <div className={sideNavPanelContentStyle} style={{width: panelWidth}}>
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
              <div
                className={style({
                  flexGrow: 0,
                  flexShrink: 0,
                  marginBottom: 12,
                  marginTop: 4,
                  display: 'flex',
                  marginStart: 4
                })}>
                <ExpandButton isCollapsed={isCollapsed} setCollapsed={setCollapsed} />
              </div>
            </div>
          </ViewTransition>
        </div>
      </SideNavPanelBoundsContext.Provider>
    </SideNavPanelContext.Provider>
  );
});

function ExpandButton(props: {isCollapsed: boolean; setCollapsed: (isCollapsed: boolean) => void}) {
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  let label = stringFormatter.format(`sidepanel.${props.isCollapsed ? 'expand' : 'collapse'}`);
  let {isCollapsed, setCollapsed, ...otherProps} = props;
  let [isHovered, setHovered] = useState(false);
  let {hoverProps} = useHover({onHoverChange: setHovered});

  return (
    <div {...hoverProps} className={style({display: 'contents'})}>
      <ActionButton
        {...otherProps}
        aria-label={label}
        isQuiet
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
