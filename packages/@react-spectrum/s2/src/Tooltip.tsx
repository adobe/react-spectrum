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

import {
  Tooltip as AriaTooltip,
  TooltipProps as AriaTooltipProps,
  TooltipTrigger as AriaTooltipTrigger,
  TooltipTriggerComponentProps as AriaTooltipTriggerComponentProps,
  OverlayArrow,
  TooltipRenderProps,
  useLocale
} from 'react-aria-components';
import {centerPadding, colorScheme, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {ColorScheme} from '@react-types/provider';
import {ColorSchemeContext} from './Provider';
import {createContext, forwardRef, MutableRefObject, ReactNode, useCallback, useContext, useState} from 'react';
import {DOMRef} from '@react-types/shared';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';

export interface TooltipTriggerProps extends Omit<AriaTooltipTriggerComponentProps, 'children' | 'closeDelay'>, Pick<AriaTooltipProps, 'shouldFlip' | 'containerPadding' | 'offset' | 'crossOffset'> {
  /** The content of the tooltip. */
  children?: ReactNode,
  /**
   * The placement of the element with respect to its anchor element.
   *
   * @default 'top'
   */
  placement?: 'start' | 'end' | 'right' | 'left' | 'top' | 'bottom'
}

export interface TooltipProps extends Omit<AriaTooltipProps, 'children' | 'className' | 'style' | 'triggerRef' | 'UNSTABLE_portalContainer' | 'isEntering' | 'isExiting' | 'placement' | 'containerPadding' |  'offset' | 'crossOffset' |  'shouldFlip' | 'arrowBoundaryOffset' | 'isOpen' | 'defaultOpen' | 'onOpenChange'>, UnsafeStyles {
  /** The content of the tooltip. */
  children?: ReactNode
}

const tooltip = style<TooltipRenderProps & {colorScheme: ColorScheme | 'light dark' | null}>({
  ...colorScheme(),
  justifyContent: 'center',
  alignItems: 'center',
  maxWidth: 160,
  minHeight: 24,
  boxSizing: 'border-box',
  font: 'ui-sm',
  color: {
    default: 'gray-25',
    forcedColors: 'ButtonText'
  },
  borderWidth: {
    forcedColors: 1
  },
  borderStyle: {
    forcedColors: 'solid'
  },
  borderColor: {
    forcedColors: 'transparent'
  },
  backgroundColor: 'neutral',
  borderRadius: 'control',
  paddingX: 'edge-to-text',
  paddingY: centerPadding(),
  margin: 8,
  transition: 'default',
  transitionDuration: 200,
  transitionTimingFunction: {
    isExiting: 'in'
  },
  translateX: {
    placement: {
      left: {
        isEntering: 4,
        isExiting: 4
      },
      right: {
        isEntering: -4,
        isExiting: -4
      }
    }
  },
  translateY: {
    placement: {
      top: {
        isEntering: 4,
        isExiting: 4
      },
      bottom: {
        isEntering: -4,
        isExiting: -4
      }
    }
  },
  opacity: {
    isEntering: 0,
    isExiting: 0
  }
});

const arrowStyles = style<TooltipRenderProps>({
  display: 'block',
  fill: 'gray-800',
  rotate: {
    placement: {
      top: 0,
      bottom: '180deg',
      left: '-90deg',
      right: '90deg'
    }
  },
  translateX: {
    placement: {
      left: '[-25%]',
      right: '[25%]'
    }
  }
});

let InternalTooltipTriggerContext = createContext<TooltipTriggerProps>({});

/**
 * Display container for Tooltip content. Has a directional arrow dependent on its placement.
 */
export const Tooltip = forwardRef(function Tooltip(props: TooltipProps, ref: DOMRef<HTMLDivElement>) {
  let {children, UNSAFE_style, UNSAFE_className = ''} = props;
  let domRef = useDOMRef(ref);
  let {
    containerPadding,
    crossOffset,
    offset,
    placement = 'top',
    shouldFlip
  } = useContext(InternalTooltipTriggerContext);
  let colorScheme = useContext(ColorSchemeContext);
  let {locale, direction} = useLocale();
  let [borderRadius, setBorderRadius] = useState(0);

  // TODO: should we pass through lang and dir props in RAC?
  let tooltipRef = useCallback((el: HTMLDivElement) => {
    (domRef as MutableRefObject<HTMLDivElement>).current = el;
    if (el) {
      el.lang = locale;
      el.dir = direction;
      let spectrumBorderRadius = window.getComputedStyle(el).borderRadius;
      if (spectrumBorderRadius !== '') {
        setBorderRadius(parseInt(spectrumBorderRadius, 10));
      }
    }
  }, [locale, direction, domRef]);

  return (
    <AriaTooltip
      {...props}
      arrowBoundaryOffset={borderRadius}
      containerPadding={containerPadding}
      crossOffset={crossOffset}
      offset={offset}
      placement={placement}
      shouldFlip={shouldFlip}
      ref={tooltipRef}
      style={UNSAFE_style}
      className={renderProps => UNSAFE_className + tooltip({...renderProps, colorScheme})}>
      {renderProps => (
        <>
          <OverlayArrow>
            <svg className={arrowStyles(renderProps)} xmlns="http://www.w3.org/2000/svg" width="10" height="5" viewBox="0 0 10 5">
              <path d="M4.29289 4.29289L0 0H10L5.70711 4.29289C5.31658 4.68342 4.68342 4.68342 4.29289 4.29289Z" />
            </svg>
          </OverlayArrow>
          {children}
        </>
      )}
    </AriaTooltip>
  );
});

/**
 * TooltipTrigger wraps around a trigger element and a Tooltip. It handles opening and closing
 * the Tooltip when the user hovers over or focuses the trigger, and positioning the Tooltip
 * relative to the trigger.
 */
export function TooltipTrigger(props: TooltipTriggerProps) {
  let {
    containerPadding,
    crossOffset,
    offset,
    placement,
    shouldFlip,
    ...triggerProps
  } = props;

  return (
    <AriaTooltipTrigger {...triggerProps}>
      <InternalTooltipTriggerContext.Provider
        value={{
          containerPadding: containerPadding,
          crossOffset: crossOffset,
          offset: offset,
          placement: placement,
          shouldFlip: shouldFlip
        }}>
        {props.children}
      </InternalTooltipTriggerContext.Provider>
    </AriaTooltipTrigger>
  );
}


// This is purely so that storybook generates the types for both Menu and MenuTrigger
interface ICombined extends Omit<TooltipProps, 'placement'>, TooltipTriggerProps {}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CombinedTooltip(props: ICombined) {
  return <div />;
}
