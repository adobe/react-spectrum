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

export const PANEL_TRANSITION = sideNavCss['side-panel'];
const PANEL_RTL_TRANSITION = sideNavCss['side-panel-rtl']; // Must be applied alongside PANEL_TRANSITION
const SIDE_NAV_CLASS = sideNavCss['side-nav'];

// Captured only when the panel collapses or expands, not when an item inside it does.
const panelViewTransition: ViewTransitionClass = {
  default: 'none',
  [PANEL_TRANSITION]: SIDE_NAV_CLASS
};

/*
 * Both animations are view transitions: the browser captures the old and new states as snapshots
 * and animates them in an overlay above the page, while the real DOM is already in its new state.
 *
 * - Collapsing or expanding the panel captures its contents as one snapshot, and each row's icon
 *   on its own so it can slide to its new position.
 * - Expanding or collapsing an item captures each row and header so they can slide.
 *
 * The overlay ignores the nav's `overflow: clip`, so snapshots would paint over the rest of the
 * app. Two hooks clip them:
 *
 * - `useClippedViewTransition` clips the whole overlay to the bounds every snapshot registers. Used
 *   for the panel's contents, rows and headers.
 * - `useMovingClippedViewTransition` clips a single snapshot. Used for icons, which have to stop at
 *   the nav's bottom edge while the panel's snapshot reaches past it to the footer.
 */

const OVERLAY = '::view-transition';

/** A rect in viewport coordinates. */
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

// Each registration gets its own object, since rows share one `getBounds`. Storing the functions
// directly would dedupe them and drop the clip when the first row finished.
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
  // Percentages resolve against the group, so its far edges follow it as it resizes. An inset past
  // an edge leaves that edge unclipped.
  return `inset(${top - y}px calc(100% - ${right - x}px) calc(100% - ${bottom - y}px) ${left - x}px)`;
}

function interpolate(from: Rect, to: Rect, progress: number): Rect {
  return {
    top: from.top + (to.top - from.top) * progress,
    right: from.right + (to.right - from.right) * progress,
    bottom: from.bottom + (to.bottom - from.bottom) * progress,
    left: from.left + (to.left - from.left) * progress
  };
}

/** The animation moving a group, i.e. the one animating its `transform`. */
function getMotion(group: ViewTransitionPseudoElement): Animation | undefined {
  for (let animation of group.getAnimations()) {
    let keyframes = (animation.effect as KeyframeEffect)?.getKeyframes?.();
    if (keyframes?.some(keyframe => keyframe.transform != null)) {
      return animation;
    }
  }
}

/**
 * Clips a snapshot to bounds moving from `from` to `to`. Its `clip-path` is relative to its own
 * corner, which moves, so the clip is keyframed to match the snapshot's motion.
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
  // Start in sync with the motion so the two don't drift apart.
  if (motion.startTime != null) {
    animation.startTime = motion.startTime;
  }
  // React only cancels the animations that already existed when it captured the snapshot.
  return () => animation.cancel();
}

/** The bounds to clip to at the start and at the end of a transition. */
export type ClipBounds = [Rect | null, Rect | null];

/**
 * Props for a `<ViewTransition>` whose snapshot is clipped on its own, to bounds moving from the
 * first of `getBounds()` to the second. Elements in only one state aren't captured, and fade with
 * their ancestor's snapshot instead.
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
   * Whether the side panel will be collapsed. It changes a render before `isCollapsed`, so while
   * the two differ, a transition is about to start. Use it to prepare for the transition, like
   * measuring elements before the panel resizes.
   */
  willBeCollapsed?: boolean;
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
    '--collapsedWidth': {
      type: 'width',
      value: 42
    }
  },
  getAllowedOverrides({height: true})
);

// The element the view transition captures. Its width snaps rather than transitioning, since a
// transitioning width would be captured at its old value and jump when the animation ends.
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
    () => ({isCollapsed: renderedCollapsed, willBeCollapsed: isCollapsed, setCollapsed}),
    [renderedCollapsed, isCollapsed, setCollapsed]
  );
  // The snapshot and the live panel animate their widths separately. Clipping the snapshot to the
  // panel stops it painting over the content beside it if it gets ahead.
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
