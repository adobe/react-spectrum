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
  ContextValue,
  DialogProps,
  OverlayArrow,
  OverlayTriggerStateContext,
  useLocale
} from 'react-aria-components';
import {colorScheme, getAllowedOverrides, heightProperties, UnsafeStyles, widthProperties} from './style-utils' with {type: 'macro'};
import {ColorSchemeContext} from './Provider';
import {createContext, ForwardedRef, forwardRef, ReactNode, useCallback, useContext, useMemo} from 'react';
import {DOMRef, DOMRefValue, GlobalDOMAttributes} from '@react-types/shared';
import {lightDark, style} from '../style' with {type: 'macro'};
import {mergeRefs} from '@react-aria/utils';
import {mergeStyles} from '../style/runtime';
import {StyleString} from '../style/types' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface PopoverProps extends UnsafeStyles, Omit<AriaPopoverProps,
  'arrowSize' |
  'isNonModal' |
  'arrowBoundaryOffset' |
  'isKeyboardDismissDisabled' |
  'shouldCloseOnInteractOutside' |
  'shouldUpdatePosition' |
  'style' |
  'className' |
  keyof GlobalDOMAttributes
> {
  /**
   * The styles of the popover.
   */
  styles?: StyleString,
  /**
   * Whether a popover's arrow should be hidden.
   *
   * @default false
   */
  hideArrow?: boolean,
  /**
   * The size of the Popover. If not specified, the popover fits its contents.
   */
  size?: 'S' | 'M' | 'L'
  /** The type of overlay that should be rendered when on a mobile device. */
  // mobileType?: 'modal' | 'fullscreen' | 'fullscreenTakeover' // TODO: add tray back in
}

let popover = style({
  ...colorScheme(),
  '--s2-container-bg': {
    type: 'backgroundColor',
    value: {
      default: 'layer-2',
      forcedColors: 'Background'
    }
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
  outlineStyle: 'solid',
  outlineWidth: 1,
  outlineColor: {
    default: lightDark('transparent-white-25', 'gray-200'),
    forcedColors: 'ButtonBorder'
  },
  width: {
    size: {
      // Copied from designs, not sure if correct.
      S: 336,
      M: 416,
      L: 576
    }
  },
  // Don't be larger than full screen minus 2 * containerPadding
  maxWidth: 'calc(100vw - 24px)',
  boxSizing: 'border-box',
  display: 'flex',
  opacity: {
    isEntering: 0,
    isExiting: 0
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
    },
    isSubmenu: 0
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
    },
    isSubmenu: 0
  },
  transition: '[opacity, translate]',
  transitionDuration: 200,
  transitionTimingFunction: {
    isExiting: 'in'
  },
  isolation: 'isolate',
  pointerEvents: {
    isExiting: 'none'
  }
}, getAllowedOverrides());
// TODO: animations and real Popover Arrow

let arrow = style({
  display: 'block',
  fill: '--s2-container-bg',
  width: 18,
  height: 9,
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
      left: '-25%',
      right: '25%'
    }
  },
  strokeWidth: 1,
  stroke: {
    default: lightDark('transparent-white-25', 'gray-200'),
    forcedColors: 'ButtonBorder'
  }
});

export const PopoverContext = createContext<ContextValue<PopoverProps, DOMRefValue<HTMLDivElement>>>(null);
export const InPopoverContext = createContext(false);

export const PopoverBase = forwardRef(function PopoverBase(props: PopoverProps, ref: ForwardedRef<HTMLDivElement | null>) {
  let {
    hideArrow = false,
    UNSAFE_className = '',
    UNSAFE_style,
    styles,
    size
  } = props;
  let colorScheme = useContext(ColorSchemeContext);
  let {locale, direction} = useLocale();

  // TODO: should we pass through lang and dir props in RAC?
  let popoverRef = useCallback((el: HTMLDivElement) => {
    if (el) {
      el.lang = locale;
      el.dir = direction;
    }
  }, [locale, direction]);
  // Memoed so it doesn't break ComboBox/Picker scrolling
  let mergedRef = useMemo(() => mergeRefs(popoverRef, ref), [ref, popoverRef]);

  // On small devices, show a modal (or eventually a tray) instead of a popover.
  // TODO: reverted this until we have trays.
  // let isMobile = useIsMobileDevice();
  // if (isMobile && process.env.NODE_ENV !== 'test') {
  //   let mappedChildren = typeof children === 'function'
  //     ? (renderProps: ModalRenderProps) => children({...renderProps, defaultChildren: null, trigger, placement: 'bottom'})
  //     : children;

  //   return (
  //     <Modal size={size} isDismissable>
  //       {composeRenderProps(mappedChildren, (children, {state}) => (
  //         <>
  //           {children}
  //           {/* Add additional dismiss button at the end to match popovers. */}
  //           <DismissButton onDismiss={state.close} />
  //         </>
  //       ))}
  //     </Modal>
  //   );
  // }

  // TODO: this still isn't the final popover 'tip', copying various ones out of the designs files yields different results
  // containerPadding not working as expected
  return (
    <AriaPopover
      {...props}
      offset={(props.offset ?? 8) + (hideArrow ? 0 : 8)}
      ref={mergedRef}
      style={{
        ...UNSAFE_style,
        // Override default z-index from useOverlayPosition. We use isolation: isolate instead.
        zIndex: undefined
      }}
      className={(renderProps) => UNSAFE_className + mergeStyles(popover({...renderProps, size, isArrowShown: !hideArrow, colorScheme, isSubmenu: renderProps.trigger === 'SubmenuTrigger'}), styles)}>
      {composeRenderProps(props.children, (children, renderProps) => (
        <>
          {!hideArrow && (
            <OverlayArrow className="">
              <svg viewBox="0 0 18 10" className={arrow(renderProps)}>
                <path transform="translate(0 -1)" d="M1 1L7.93799 8.52588C8.07224 8.67448 8.23607 8.79362 8.41895 8.87524C8.60182 8.95687 8.79973 8.9993 9 9C9.19984 8.99882 9.39724 8.95606 9.57959 8.87427C9.76193 8.79248 9.9253 8.67336 10.0591 8.5249L17 1" />
              </svg>
            </OverlayArrow>
          )}
          <InPopoverContext.Provider value>
            {children}
          </InPopoverContext.Provider>
        </>
      ))}
    </AriaPopover>
  );
});

type PopoverStylesProp = StyleString<((typeof widthProperties)[number] | (typeof heightProperties)[number])>;
export interface PopoverDialogProps extends Pick<PopoverProps,
'size' |
'hideArrow'|
'placement' |
'shouldFlip' |
'containerPadding' |
'offset' |
'crossOffset' |
'triggerRef' |
'isOpen' |
'onOpenChange'
>, Omit<DialogProps, 'children' | 'className' | 'style' | keyof GlobalDOMAttributes>, UnsafeStyles {
  /**
   * The children of the popover.
   */
  children?: ReactNode,
  /**
   * The amount of padding around the contents of the dialog.
   * @default 'default'
   */
  padding?: 'default' | 'none',
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: PopoverStylesProp
}

const innerDivStyle = style({
  padding: {
    padding: {
      default: 8,
      none: 0
    }
  },
  boxSizing: 'border-box',
  outlineStyle: 'none',
  borderRadius: 'inherit',
  overflow: 'auto',
  position: 'relative',
  width: 'full',
  maxSize: 'inherit'
}, getAllowedOverrides({height: true}));

/**
 * A popover is an overlay element positioned relative to a trigger.
 */
export const Popover = forwardRef(function Popover(props: PopoverDialogProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, PopoverContext);
  let domRef = useDOMRef(ref);
  let {
    UNSAFE_className,
    UNSAFE_style,
    styles,
    padding = 'default',
    ...otherProps
  } = props;

  return (
    <PopoverBase {...otherProps} ref={domRef}>
      {composeRenderProps(props.children, (children) => (
        <div
          style={UNSAFE_style}
          className={(UNSAFE_className || '') + innerDivStyle({padding}, styles)}>
          {/* Reset OverlayTriggerStateContext so the buttons inside the dialog don't retain their hover state. */}
          <OverlayTriggerStateContext.Provider value={null}>
            {children}
          </OverlayTriggerStateContext.Provider>
        </div>
      ))}
    </PopoverBase>
  );
});
