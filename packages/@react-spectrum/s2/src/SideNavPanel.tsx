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
import {
  createContext,
  forwardRef,
  FunctionComponent,
  ReactNode,
  SVGProps,
  useMemo,
  useRef,
  useState
} from 'react';
import {createIcon, IconProps} from './Icon';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {
  getAllowedOverrides,
  StylesPropWithHeight,
  UnsafeStyles
} from './style-utils' with {type: 'macro'};
// @ts-ignore
import intlMessages from '../intl/*.json';
import {style} from '../style' with {type: 'macro'};
import {useControlledState} from 'react-stately/useControlledState';
import {useDOMRef} from './useDOMRef';
import {useHover} from 'react-aria/useHover';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useMediaQuery} from './useMediaQuery';

// Keep in sync with ANIMATION_DURATION in SideNav.tsx.
const ANIMATION_DURATION = 200;

export interface SideNavPanelProps extends AriaLabelingProps, UnsafeStyles {
  /** The content of the side panel. */
  children?: ReactNode;
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
  /**
   * Whether the side panel is collapsed to its icon rail. This becomes true once the panel finishes
   * collapsing, and false as soon as it starts expanding.
   */
  isCollapsed?: boolean;
  /** Sets whether the side panel is collapsed. */
  setCollapsed?: (isCollapsed: boolean) => void;
}

export const SideNavPanelContext = createContext<SideNavPanelContextValue>({});

interface InternalSideNavPanelContextValue {
  /**
   * Whether the panel is collapsed or collapsing. Unlike SideNavPanelContext's isCollapsed, this
   * becomes true as soon as the panel starts to collapse.
   */
  isCollapsedOrCollapsing: boolean;
  /**
   * Whether the panel has finished collapsing to its icon rail. This is SideNavPanelContext's
   * isCollapsed.
   */
  isRail: boolean;
  /** Whether the panel is changing width. */
  isTransitioning: boolean;
  /**
   * Whether the contents are pinned at their expanded width while the panel changes width. This
   * becomes true just after isTransitioning, once the panel has measured that width.
   */
  isContentPinned: boolean;
  setCollapsed: (isCollapsed: boolean) => void;
}

export const InternalSideNavPanelContext = createContext<InternalSideNavPanelContextValue | null>(
  null
);

const sideNavPanelStyle = style(
  {
    display: 'flex',
    flexDirection: 'column',
    height: 'full',
    minHeight: 0,
    // The expanded width is supplied by the consumer via `styles`; when collapsed, the inline
    // width below overrides it with the fixed icon-rail size.
    '--collapsedWidth': {
      type: 'width',
      value: 42
    },
    transition: {
      default: '[width]',
      '@media (prefers-reduced-motion: reduce)': 'none'
    },
    // Keep in sync with ANIMATION_DURATION above.
    transitionDuration: ANIMATION_DURATION,
    transitionTimingFunction: 'default'
  },
  getAllowedOverrides({height: true})
);

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
    isCollapsed: propIsCollapsed,
    defaultCollapsed,
    onCollapsedChange,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let contentRef = useRef<HTMLDivElement>(null);
  let [isCollapsed, setCollapsed] = useControlledState<boolean>(
    propIsCollapsed,
    defaultCollapsed ?? false,
    onCollapsedChange
  );
  let reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // While the width transitions, the contents are pinned at their expanded width so that nothing
  // reflows, and the panel clips them.
  let [prevCollapsed, setPrevCollapsed] = useState(isCollapsed);
  let [transition, setTransition] = useState<{contentWidth?: number} | null>(null);
  if (prevCollapsed !== isCollapsed) {
    setPrevCollapsed(isCollapsed);
    // Reversing part way through keeps the width that was already measured.
    setTransition(reduceMotion ? null : t => t ?? {});
  }
  let isTransitioning = transition != null;
  let contentWidth = transition?.contentWidth;

  useLayoutEffect(() => {
    if (!transition) {
      return;
    }

    let content = contentRef.current;
    let animation = domRef.current
      ?.getAnimations?.()
      .find(a => (a as CSSTransition).transitionProperty === 'width');
    if (!animation || !content) {
      // Nothing is animating, e.g. the expanded width is the same as the collapsed width.
      setTransition(null);
      return;
    }

    if (transition.contentWidth == null) {
      let width = content.getBoundingClientRect().width;
      if (!isCollapsed) {
        // The contents are still at the collapsed width, so seek to the end of the transition to
        // measure the expanded width, then rewind. Pausing while seeking stops WebKit from treating
        // the transition as finished, which would start a second one.
        let time = animation.currentTime;
        let endTime = animation.effect?.getComputedTiming().endTime;
        if (time != null && endTime != null) {
          animation.pause();
          animation.currentTime = endTime;
          width = content.getBoundingClientRect().width;
          animation.currentTime = time;
          animation.play();
        }
      }
      setTransition({contentWidth: width});
      return;
    }

    // Cancelling the transition part way through rejects this promise. When the panel reverses,
    // this effect has already re-run for the new transition, but in other cases, e.g. when the
    // panel is hidden or its expanded width changes, the contents are unpinned straight away.
    let isCancelled = false;
    let onEnd = () => {
      if (!isCancelled) {
        setTransition(null);
      }
    };
    animation.finished.then(onEnd, onEnd);
    return () => {
      isCancelled = true;
    };
  }, [isCollapsed, transition, domRef]);

  // Consumers only see the rail once the panel has finished collapsing.
  let isRail = isCollapsed && !isTransitioning;
  let context = useMemo(() => ({isCollapsed: isRail, setCollapsed}), [isRail, setCollapsed]);
  let isContentPinned = contentWidth != null;
  let internalContext = useMemo(
    () => ({
      isCollapsedOrCollapsing: isCollapsed,
      isRail,
      isTransitioning,
      isContentPinned,
      setCollapsed
    }),
    [isCollapsed, isRail, isTransitioning, isContentPinned, setCollapsed]
  );

  let filteredProps = filterDOMProps(otherProps, {labelable: true});
  // A labelled collapsible panel must have a role.
  let hasLabel = filteredProps['aria-label'] != null || filteredProps['aria-labelledby'] != null;
  return (
    <SideNavPanelContext.Provider value={context}>
      <InternalSideNavPanelContext.Provider value={internalContext}>
        <div
          {...filteredProps}
          role={hasLabel ? 'region' : undefined}
          ref={domRef}
          style={{
            ...UNSAFE_style,
            // Override the consumer's class-based width while collapsed.
            width: isCollapsed ? 'var(--collapsedWidth)' : undefined,
            overflowX: isTransitioning ? 'clip' : UNSAFE_style?.overflowX
          }}
          className={UNSAFE_className + sideNavPanelStyle(null, styles)}>
          <div
            ref={contentRef}
            style={{width: contentWidth}}
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
      </InternalSideNavPanelContext.Provider>
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
