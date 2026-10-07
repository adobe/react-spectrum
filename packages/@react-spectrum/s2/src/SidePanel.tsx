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
import {getEventTarget} from 'react-aria/private/utils/shadowdom/DOMFunctions';
// @ts-ignore
import intlMessages from '../intl/*.json';
import React, {
  createContext,
  forwardRef,
  FunctionComponent,
  ReactNode,
  SVGProps,
  useMemo,
  useState
} from 'react';
import sideNavCss from './SideNav.module.css';
import {style} from '../style' with {type: 'macro'};
import {useControlledState} from 'react-stately/useControlledState';
import {useDOMRef} from './useDOMRef';
import {useHover} from 'react-aria/useHover';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useMediaQuery} from './useMediaQuery';

const addTransitionType: (type: string) => void = React.addTransitionType ?? (() => {});
const startTransition: (scope: () => void) => void =
  React.startTransition ?? ((scope: () => void) => scope());
const ANIMATION_DURATION = 200;
const EXPAND_TRANSITION = sideNavCss['side-panel-expand'];

export interface SidePanelProps extends AriaLabelingProps, UnsafeStyles {
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

interface SidePanelContextValue {
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
  // The panel's width and its contents are never animated at the same time.
  let [contentCollapsed, setContentCollapsed] = useState(isCollapsed);

  // Apply content collapse in the same render that starts the width transition.
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
    // The expanded width may equal the collapsed width, in which case no transitionend arrives.
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

  let filteredProps = filterDOMProps(otherProps, {labelable: true});
  // A labelled collapsible panel must have a role.
  let hasLabel = filteredProps['aria-label'] != null || filteredProps['aria-labelledby'] != null;
  return (
    <SidePanelContext.Provider value={context}>
      <div
        {...filteredProps}
        role={hasLabel ? 'region' : undefined}
        ref={domRef}
        // Allow children to hide via CSS instead of waiting for another state render.
        data-side-panel-collapsed={contentCollapsed || undefined}
        // Override the consumer's class-based width while collapsed.
        style={{...UNSAFE_style, width: isCollapsed ? 'var(--collapsedWidth)' : undefined}}
        className={UNSAFE_className + sidePanelStyle(null, styles)}>
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
