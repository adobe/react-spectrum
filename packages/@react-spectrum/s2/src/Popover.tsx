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
  Popover as AriaPopover,
  PopoverProps as AriaPopoverProps,
  composeRenderProps,
  OverlayArrow,
  useLocale
} from 'react-aria-components';
import {colorScheme, getAllowedOverrides, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {ColorSchemeContext} from './Provider';
import {DOMRef} from '@react-types/shared';
import {forwardRef, MutableRefObject, useCallback, useContext} from 'react';
import {keyframes} from '../style/style-macro' with {type: 'macro'};
import {mergeStyles} from '../style/runtime';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {StyleString} from '../style/types' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';

export interface PopoverProps extends UnsafeStyles, Omit<AriaPopoverProps, 'arrowSize' | 'isNonModal' | 'arrowBoundaryOffset' | 'isKeyboardDismissDisabled' | 'shouldCloseOnInteractOutside' | 'shouldUpdatePosition'> {
  styles?: StyleString,
  /**
   * Whether a popover's arrow should be hidden.
   *
   * @default false
   */
  hideArrow?: boolean,
  size?: 'S' | 'M' | 'L'
}

const fadeKeyframes = keyframes(`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`);
const slideUpKeyframes = keyframes(`
  from {
    transform: translateY(-4px);
  }

  to {
    transform: translateY(0);
  }
`);
const slideDownKeyframes = keyframes(`
  from {
    transform: translateY(4px);
  }

  to {
    transform: translateY(0);
  }
`);
const slideRightKeyframes = keyframes(`
  from {
    transform: translateX(4px);
  }

  to {
    transform: translateX(0);
  }
`);
const slideLeftKeyframes = keyframes(`
  from {
    transform: translateX(-4px);
  }

  to {
    transform: translateX(0);
  }
`);

let popover = style({
  ...colorScheme(),
  '--s2-container-bg': {
    type: 'backgroundColor',
    value: 'layer-2'
  },
  backgroundColor: '--s2-container-bg',
  borderRadius: 'lg',
  filter: {
    isArrowShown: 'elevated'
  },
  // Use box-shadow instead of filter when an arrow is not shown.
  // This fixes the shadow stacking problem with submenus.
  boxShadow: {
    default: 'elevated',
    isArrowShown: 'none'
  },
  borderStyle: 'solid',
  borderWidth: 1,
  borderColor: {
    default: 'gray-200',
    forcedColors: 'ButtonBorder'
  },
  width: {
    size: {
      // Copied from designs, not sure if correct.
      S: '[21rem]',
      M: '[26rem]',
      L: '[36rem]'
    }
  },
  translateY: {
    placement: {
      bottom: {
        isArrowShown: 8 // TODO: not defined yet should this change with font size? need boolean support for 'hideArrow' prop
      },
      top: {
        isArrowShown: -8
      }
    }
  },
  translateX: {
    placement: {
      left: {
        isArrowShown: -8
      },
      right: {
        isArrowShown: 8
      }
    }
  },
  animation: {
    placement: {
      top: {
        isEntering: `${slideDownKeyframes}, ${fadeKeyframes}`,
        isExiting: `${slideDownKeyframes}, ${fadeKeyframes}`
      },
      bottom: {
        isEntering: `${slideUpKeyframes}, ${fadeKeyframes}`,
        isExiting: `${slideUpKeyframes}, ${fadeKeyframes}`
      },
      left: {
        isEntering: `${slideRightKeyframes}, ${fadeKeyframes}`,
        isExiting: `${slideRightKeyframes}, ${fadeKeyframes}`
      },
      right: {
        isEntering: `${slideLeftKeyframes}, ${fadeKeyframes}`,
        isExiting: `${slideLeftKeyframes}, ${fadeKeyframes}`
      }
    }
  },
  animationDuration: {
    isEntering: 200,
    isExiting: 200
  },
  animationDirection: {
    isEntering: 'normal',
    isExiting: 'reverse'
  },
  animationTimingFunction: {
    isExiting: 'in'
  },
  transition: '[opacity, transform]',
  willChange: '[opacity, transform]',
  isolation: 'isolate',
  pointerEvents: {
    isExiting: 'none'
  }
}, getAllowedOverrides());
// TODO: animations and real Popover Arrow

let arrow = style({
  display: 'block',
  fill: '--s2-container-bg',
  rotate: {
    default: 180,
    placement: {
      top: 0,
      bottom: 180,
      left: -90,
      right: 90
    }
  },
  translateX: {
    placement: {
      left: -4,
      right: 4
    }
  },
  strokeWidth: 1,
  stroke: {
    default: 'gray-200',
    forcedColors: 'ButtonBorder'
  }
});

function Popover(props: PopoverProps, ref: DOMRef<HTMLDivElement>) {
  let {
    hideArrow = false,
    UNSAFE_className = '',
    UNSAFE_style,
    styles,
    size
  } = props;
  let domRef = useDOMRef(ref);
  let colorScheme = useContext(ColorSchemeContext);
  let {locale, direction} = useLocale();

  // TODO: should we pass through lang and dir props in RAC?
  let popoverRef = useCallback((el: HTMLDivElement) => {
    (domRef as MutableRefObject<HTMLDivElement>).current = el;
    if (el) {
      el.lang = locale;
      el.dir = direction;
    }
  }, [locale, direction, domRef]);

  // TODO: this still isn't the final popover 'tip', copying various ones out of the designs files yields different results
  // containerPadding not working as expected
  return (
    <AriaPopover
      {...props}
      ref={popoverRef}
      style={{
        ...UNSAFE_style,
        // Override default z-index from useOverlayPosition. We use isolation: isolate instead.
        zIndex: undefined
      }}
      className={(renderProps) => UNSAFE_className + mergeStyles(popover({...renderProps, size, isArrowShown: !hideArrow, colorScheme}), styles)}>
      {composeRenderProps(props.children, (children, renderProps) => (
        <>
          {!hideArrow && (
            <OverlayArrow>
              <svg width={18} height={9} viewBox="0 0 18 10" className={arrow(renderProps)}>
                <path transform="translate(0 -1)" d="M1 1L7.93799 8.52588C8.07224 8.67448 8.23607 8.79362 8.41895 8.87524C8.60182 8.95687 8.79973 8.9993 9 9C9.19984 8.99882 9.39724 8.95606 9.57959 8.87427C9.76193 8.79248 9.9253 8.67336 10.0591 8.5249L17 1" />
              </svg>
            </OverlayArrow>
          )}
          {children}
        </>
      ))}
    </AriaPopover>
  );
}

/**
 * A popover is an overlay element positioned relative to a trigger.
 */
let _Popover = forwardRef(Popover);
export {_Popover as Popover};
