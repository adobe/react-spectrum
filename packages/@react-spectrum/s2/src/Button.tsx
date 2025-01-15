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

import {baseColor, focusRing, fontRelative, linearGradient, style} from '../style' with {type: 'macro'};
import {ButtonRenderProps, ContextValue, Link, LinkProps, OverlayTriggerStateContext, Provider, Button as RACButton, ButtonProps as RACButtonProps} from 'react-aria-components';
import {centerBaseline} from './CenterBaseline';
import {centerPadding, getAllowedOverrides, staticColor, StyleProps} from './style-utils' with {type: 'macro'};
import {createContext, forwardRef, ReactNode, useContext, useEffect, useState} from 'react';
import {FocusableRef, FocusableRefValue} from '@react-types/shared';
import {IconContext} from './Icon';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {pressScale} from './pressScale';
import {ProgressCircle} from './ProgressCircle';
import {SkeletonContext} from './Skeleton';
import {Text, TextContext} from './Content';
import {useFocusableRef} from '@react-spectrum/utils';
import {useFormProps} from './Form';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useSpectrumContextProps} from './useSpectrumContextProps';

interface ButtonStyleProps {
  /**
   * The [visual style](https://spectrum.adobe.com/page/button/#Options) of the button.
   *
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'accent' | 'negative' | 'premium' | 'genai',
  /**
   * The background style of the Button.
   *
   * @default 'fill'
   */
  fillStyle?: 'fill' | 'outline',
  /**
   * The size of the Button.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /** The static color style to apply. Useful when the Button appears over a color background. */
  staticColor?: 'white' | 'black' | 'auto'
}

export interface ButtonProps extends Omit<RACButtonProps, 'className' | 'style' | 'children' | 'onHover' | 'onHoverStart' | 'onHoverEnd' | 'onHoverChange'>, StyleProps, ButtonStyleProps {
  /** The content to display in the Button. */
  children?: ReactNode
}

export interface LinkButtonProps extends Omit<LinkProps, 'className' | 'style' | 'children'>, StyleProps, ButtonStyleProps {
  /** The content to display in the Button. */
  children?: ReactNode
}

export const ButtonContext = createContext<ContextValue<ButtonProps, FocusableRefValue<HTMLButtonElement>>>(null);
export const LinkButtonContext = createContext<ContextValue<ButtonProps, FocusableRefValue<HTMLAnchorElement>>>(null);

const iconOnly = ':has([slot=icon]):not(:has([data-rsp-slot=text]))';
const button = style<ButtonRenderProps & ButtonStyleProps & {isStaticColor: boolean}>({
  ...focusRing(),
  ...staticColor(),
  position: 'relative',
  display: 'flex',
  alignItems: {
    default: 'baseline',
    [iconOnly]: 'center'
  },
  justifyContent: 'center',
  textAlign: 'start',
  columnGap: 'text-to-visual',
  font: 'control',
  fontWeight: 'bold',
  userSelect: 'none',
  minHeight: 'control',
  minWidth: {
    [iconOnly]: 'control'
  },
  borderRadius: 'pill',
  boxSizing: 'border-box',
  width: 'fit',
  textDecoration: 'none', // for link buttons
  paddingX: {
    default: 'pill',
    [iconOnly]: 0
  },
  paddingY: 0,
  aspectRatio: {
    [iconOnly]: 'square'
  },
  transition: 'default',
  borderStyle: 'solid',
  borderWidth: {
    fillStyle: {
      fill: 0,
      outline: 2
    },
    variant: {
      premium: 0,
      genai: 0
    }
  },
  '--labelPadding': {
    type: 'paddingTop',
    value: centerPadding()
  },
  '--iconMargin': {
    type: 'marginTop',
    value: {
      default: fontRelative(-2),
      [iconOnly]: 0
    }
  },
  borderColor: {
    variant: {
      primary: baseColor('gray-800'),
      secondary: baseColor('gray-300')
    },
    isDisabled: 'disabled',
    isStaticColor: {
      variant: {
        primary: baseColor('transparent-overlay-800'),
        secondary: baseColor('transparent-overlay-300')
      },
      isDisabled: 'transparent-overlay-300'
    },
    forcedColors: {
      default: 'ButtonBorder',
      isHovered: 'Highlight',
      isDisabled: 'GrayText'
    }
  },
  backgroundColor: {
    fillStyle: {
      fill: {
        variant: {
          primary: 'neutral',
          secondary: baseColor('gray-100'),
          accent: 'accent',
          negative: 'negative',
          premium: 'gray-100',
          genai: 'gray-100'
        },
        isDisabled: 'disabled'
      },
      outline: {
        variant: {
          premium: 'gray-100',
          genai: 'gray-100'
        },
        default: 'transparent',
        isHovered: 'gray-100',
        isPressed: 'gray-100',
        isFocusVisible: 'gray-100',
        isDisabled: {
          default: 'transparent',
          variant: {
            premium: 'gray-100',
            genai: 'gray-100'
          }
        }
      }
    },
    isStaticColor: {
      fillStyle: {
        fill: {
          variant: {
            primary: baseColor('transparent-overlay-800'),
            secondary: baseColor('transparent-overlay-100'),
            premium: 'transparent-overlay-100',
            genai: 'transparent-overlay-100'
          },
          isDisabled: 'transparent-overlay-100'
        },
        outline: {
          variant: {
            premium: 'transparent-overlay-100',
            genai: 'transparent-overlay-100'
          },
          default: 'transparent',
          isHovered: 'transparent-overlay-100',
          isPressed: 'transparent-overlay-100',
          isFocusVisible: 'transparent-overlay-100',
          isDisabled: {
            default: 'transparent',
            variant: {
              premium: 'transparent-overlay-100',
              genai: 'transparent-overlay-100'
            }
          }
        }
      }
    },
    forcedColors: {
      fillStyle: {
        fill: {
          default: 'ButtonText',
          isHovered: 'Highlight',
          isDisabled: 'GrayText'
        },
        outline: 'ButtonFace'
      }
    }
  },
  color: {
    fillStyle: {
      fill: {
        variant: {
          primary: 'gray-25',
          secondary: 'neutral',
          accent: 'white',
          negative: 'white',
          premium: 'white',
          genai: 'white'
        },
        isDisabled: 'disabled'
      },
      outline: {
        default: 'neutral',
        variant: {
          premium: 'white',
          genai: 'white'
        },
        isDisabled: 'disabled'
      }
    },
    isStaticColor: {
      fillStyle: {
        fill: {
          variant: {
            primary: 'auto',
            secondary: baseColor('transparent-overlay-800'),
            premium: 'white',
            genai: 'white'
          }
        },
        outline: {
          variant: {
            premium: 'white',
            genai: 'white'
          },
          default: baseColor('transparent-overlay-800')
        }
      },
      isDisabled: 'transparent-overlay-400'
    },
    forcedColors: {
      fillStyle: {
        fill: {
          default: 'ButtonFace',
          isDisabled: 'HighlightText'
        },
        outline: {
          default: 'ButtonText',
          isDisabled: 'GrayText'
        }
      }
    }
  },
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  outlineColor: {
    default: 'focus-ring',
    isStaticColor: 'transparent-overlay-1000',
    forcedColors: 'Highlight'
  },
  forcedColorAdjust: 'none',
  disableTapHighlight: true
}, getAllowedOverrides());

// Put the gradient background on a separate element from the button to work around a Safari
// bug where transitions of custom properties cause layout flickering if any properties use rems. 🤣
// https://bugs.webkit.org/show_bug.cgi?id=285622
const gradient = style({
  position: 'absolute',
  inset: 0,
  zIndex: -1,
  transition: 'default',
  borderRadius: '[inherit]',
  backgroundImage: {
    variant: {
      premium: {
        default: linearGradient('to bottom right', ['fuchsia-900', 0], ['indigo-900', 66], ['blue-900', 100]),
        isHovered: linearGradient('to bottom right', ['fuchsia-1000', 0], ['indigo-1000', 66], ['blue-1000', 100]),
        isPressed: linearGradient('to bottom right', ['fuchsia-1000', 0], ['indigo-1000', 66], ['blue-1000', 100]),
        isFocusVisible: linearGradient('to bottom right', ['fuchsia-1000', 0], ['indigo-1000', 66], ['blue-1000', 100])
      },
      genai: {
        default: linearGradient('to bottom right', ['red-900', 0], ['magenta-900', 33], ['indigo-900', 100]),
        isHovered: linearGradient('to bottom right', ['red-1000', 0], ['magenta-1000', 33], ['indigo-1000', 100]),
        isPressed: linearGradient('to bottom right', ['red-1000', 0], ['magenta-1000', 33], ['indigo-1000', 100]),
        isFocusVisible: linearGradient('to bottom right', ['red-1000', 0], ['magenta-1000', 33], ['indigo-1000', 100])
      }
    },
    isDisabled: 'none',
    forcedColors: 'none'
  },
  // Force gradient colors to remain static between light and dark theme.
  colorScheme: {
    variant: {
      premium: 'light',
      genai: 'light'
    }
  }
});

/**
 * Buttons allow users to perform an action.
 * They have multiple styles for various needs, and are ideal for calling attention to
 * where a user needs to do something in order to move forward in a flow.
 */
export const Button = forwardRef(function Button(props: ButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, ButtonContext);
  props = useFormProps(props);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  let {
    isPending,
    variant = 'primary',
    fillStyle = 'fill',
    size = 'M',
    staticColor
  } = props;
  let domRef = useFocusableRef(ref);
  let overlayTriggerState = useContext(OverlayTriggerStateContext);

  let [isProgressVisible, setIsProgressVisible] = useState(false);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isPending) {
      // Start timer when isPending is set to true.
      timeout = setTimeout(() => {
        setIsProgressVisible(true);
      }, 1000);
    } else {
      // Exit loading state when isPending is set to false. */
      setIsProgressVisible(false);
    }
    return () => {
      // Clean up on unmount or when user removes isPending prop before entering loading state.
      clearTimeout(timeout);
    };
  }, [isPending]);

  return (
    <RACButton
      {...props}
      ref={domRef}
      style={pressScale(domRef, props.UNSAFE_style)}
      className={renderProps => (props.UNSAFE_className || '') + button({
        ...renderProps,
        // Retain hover styles when an overlay is open.
        isHovered: renderProps.isHovered || overlayTriggerState?.isOpen || false,
        isDisabled: renderProps.isDisabled || isProgressVisible,
        variant,
        fillStyle,
        size,
        staticColor,
        isStaticColor: !!staticColor
      }, props.styles)}>
      {(renderProps) => (<>
        {variant === 'genai' || variant === 'premium' 
          ? (
            <span
              className={gradient({
                ...renderProps,
                // Retain hover styles when an overlay is open.
                isHovered: renderProps.isHovered || overlayTriggerState?.isOpen || false,
                isDisabled: renderProps.isDisabled || isProgressVisible,
                variant
              })} />
             )
          : null}
        <Provider
          values={[
            [SkeletonContext, null],
            [TextContext, {
              styles: style({
                paddingY: '--labelPadding',
                order: 1,
                opacity: {
                  default: 1,
                  isProgressVisible: 0
                }
              })({isProgressVisible}),
              // @ts-ignore data-attributes allowed on all JSX elements, but adding to DOMProps has been problematic in the past
              'data-rsp-slot': 'text'
            }],
            [IconContext, {
              render: centerBaseline({slot: 'icon', styles: style({order: 0})}),
              styles: style({
                size: fontRelative(20),
                marginStart: '--iconMargin',
                flexShrink: 0,
                opacity: {
                  default: 1,
                  isProgressVisible: 0
                }
              })({isProgressVisible})
            }]
          ]}>
          {typeof props.children === 'string' ? <Text>{props.children}</Text> : props.children}
          {isPending &&
            <div
              className={style({
                position: 'absolute',
                top: '[50%]',
                left: '[50%]',
                transform: 'translate(-50%, -50%)',
                opacity: {
                  default: 0,
                  isProgressVisible: 1
                }
              })({isProgressVisible, isPending})}>
              <ProgressCircle
                isIndeterminate
                aria-label={stringFormatter.format('button.pending')}
                size="S"
                staticColor={staticColor}
                styles={style({
                  size: {
                    size: {
                      S: 14,
                      M: 18,
                      L: 20,
                      XL: 24
                    }
                  }
                })({size})} />
            </div>
          }
        </Provider>
      </>)}
    </RACButton>
  );
});

/**
 * A LinkButton combines the functionality of a link with the appearance of a button. Useful for allowing users to navigate to another page.
 */
export const LinkButton = forwardRef(function LinkButton(props: LinkButtonProps, ref: FocusableRef<HTMLAnchorElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, LinkButtonContext);
  props = useFormProps(props);
  let domRef = useFocusableRef(ref);
  let overlayTriggerState = useContext(OverlayTriggerStateContext);

  return (
    <Link
      {...props}
      ref={domRef}
      style={pressScale(domRef, props.UNSAFE_style)}
      className={renderProps => (props.UNSAFE_className || '') + button({
        ...renderProps,
        // Retain hover styles when an overlay is open.
        isHovered: renderProps.isHovered || overlayTriggerState?.isOpen || false,
        variant: props.variant || 'primary',
        fillStyle: props.fillStyle || 'fill',
        size: props.size || 'M',
        staticColor: props.staticColor,
        isStaticColor: !!props.staticColor,
        isPending: false
      }, props.styles)}>
      <Provider
        values={[
          [SkeletonContext, null],
          [TextContext, {
            styles: style({paddingY: '--labelPadding', order: 1}),
            // @ts-ignore data-attributes allowed on all JSX elements, but adding to DOMProps has been problematic in the past
            'data-rsp-slot': 'text'
          }],
          [IconContext, {
            render: centerBaseline({slot: 'icon', styles: style({order: 0})}),
            styles: style({size: fontRelative(20), marginStart: '--iconMargin', flexShrink: 0})
          }]
        ]}>
        {typeof props.children === 'string' ? <Text>{props.children}</Text> : props.children}
      </Provider>
    </Link>
  );
});
