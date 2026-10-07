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
const PANEL_TRANSITION = sideNavCss['side-panel'];
// Added alongside PANEL_TRANSITION rather than instead of it. It only tells the stylesheet which
// edge of the snapshots to anchor, so everything keyed on PANEL_TRANSITION still has to match.
const PANEL_RTL_TRANSITION = sideNavCss['side-panel-rtl'];
const SIDE_NAV_CLASS = sideNavCss['side-nav'];

// `default: 'none'` opts elements out of transitions they aren't part of. Rows and headers are
// already inside the panel's snapshot when it collapses, and capturing them again would lift them
// out of it and let them animate past its edges.
const panelViewTransition: ViewTransitionClass = {
  default: 'none',
  [PANEL_TRANSITION]: SIDE_NAV_CLASS
};

// A snapshot is a pseudo element on the document root, so the nav's `overflow: clip` doesn't reach
// it and rows sliding in or out paint over the rest of the app. `view-transition-group: contain`
// would nest the snapshots inside the nav's own group, but it is only implemented in Chrome, so
// each snapshot gets a clip path holding it inside the nav instead.
//
// The clip path follows the snapshot animation.

/** A rect in the coordinates snapshots are placed in, which match the viewport. */
export interface Rect {
  top: number;
  right: number;
  bottom: number;
  left: number;
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
export function useClippedViewTransition(
  transition: ViewTransitionClass,
  getBounds: () => Rect | null
): Omit<ViewTransitionProps, 'children'> {
  return useMemo(() => {
    let clip = ({group}: ViewTransitionInstance) => {
      // A zero length animation holds its value indefinitely, which is the only way to set a
      // property on a pseudo element that no selector can reach but that we get from React instead.
      let animation = group.animate([], {duration: 0, fill: 'forwards'});
      let effect = animation.effect as KeyframeEffect;

      let stop = trackClip(() => {
        let bounds = getBounds();
        let clipPath = bounds && getClipPath(group, bounds);
        return () => {
          if (clipPath) {
            // Both keyframes are the same since it's first -> second. If they match,
            // then there can be no intermediate interpolated frames.
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
export const SidePanelBoundsContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

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
          // Allow children to hide via CSS instead of waiting for another state render.
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
              <div
                className={style({
                  flexGrow: 0,
                  flexShrink: 0,
                  marginBottom: 4,
                  marginTop: 4,
                  display: 'flex',
                  marginStart: 4
                })}>
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
