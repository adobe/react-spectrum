import {ButtonRenderProps, Button as RACButton, ButtonProps as RACButtonProps, Provider, Link, LinkProps} from 'react-aria-components';
import {FocusableRef} from '@react-types/shared';
import {style, baseColor, fontRelative} from '../style/spectrum-theme' with {type: 'macro'};
import {StyleProps, centerPadding, focusRing, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {createContext, ReactNode, forwardRef, useContext} from 'react';
import {pressScale} from './pressScale';
import {useFocusableRef} from '@react-spectrum/utils';
import {IconContext} from './Icon';
import {centerBaseline} from './CenterBaseline';
import {mergeProps} from 'react-aria';
import {Text, TextContext} from './Content';

interface ButtonStyleProps {
  /**
   * The [visual style](https://spectrum.adobe.com/page/button/#Options) of the button.
   *
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'accent' | 'negative',
  /**
   * The background style of the Button.
   *
   * @default 'fill'
   */
  treatment?: 'fill' | 'outline',
  /**
   * The size of the Button.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /** The static color style to apply. Useful when the Button appears over a color background. */
  staticColor?: 'white' | 'black'
}

export interface ButtonProps extends Omit<RACButtonProps, 'className' | 'style' | 'children'>, StyleProps, ButtonStyleProps {
  /** The content to display in the Button. */
  children?: ReactNode
}

export interface LinkButtonProps extends Omit<LinkProps, 'className' | 'style' | 'children'>, StyleProps, ButtonStyleProps {
  /** The content to display in the Button. */
  children?: ReactNode
}

interface ButtonContextValue extends ButtonStyleProps, StyleProps {
  /** Whether the Button is disabled. */
  isDisabled?: boolean
}

export const ButtonContext = createContext<ButtonContextValue>({});

const button = style<ButtonRenderProps & ButtonStyleProps>({
  ...focusRing(),
  display: 'flex',
  alignItems: {
    default: 'baseline',
    ':has([slot=icon]:only-child)': 'center'
  },
  justifyContent: 'center',
  textAlign: 'start',
  columnGap: 'text-to-visual',
  fontFamily: 'sans',
  fontWeight: 'bold',
  fontSize: 'control',
  userSelect: 'none',
  minHeight: 'control',
  minWidth: {
    ':has([slot=icon]:only-child)': 'control'
  },
  borderRadius: 'pill',
  boxSizing: 'border-box',
  width: 'fit',
  textDecoration: 'none', // for link buttons
  paddingX: {
    default: 'pill',
    ':has([slot=icon]:only-child)': 0
  },
  paddingY: 0,
  aspectRatio: {
    ':has([slot=icon]:only-child)': 'square'
  },
  transition: 'default',
  borderStyle: 'solid',
  borderWidth: {
    treatment: {
      fill: 0,
      outline: 2
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
      ':has([slot=icon]:only-child)': 0
    }
  },
  borderColor: {
    variant: {
      primary: baseColor('gray-800'),
      secondary: baseColor('gray-300')
    },
    isDisabled: 'disabled',
    staticColor: {
      white: {
        variant: {
          primary: baseColor('transparent-white-800'),
          secondary: baseColor('transparent-white-300')
        },
        isDisabled: 'transparent-white-300'
      },
      black: {
        variant: {
          primary: baseColor('transparent-black-800'),
          secondary: baseColor('transparent-black-300')
        },
        isDisabled: 'transparent-black-300'
      }
    },
    forcedColors: {
      default: 'ButtonBorder',
      isHovered: 'Highlight',
      isDisabled: 'GrayText'
    }
  },
  backgroundColor: {
    treatment: {
      fill: {
        variant: {
          primary: 'neutral',
          secondary: baseColor('gray-100'),
          accent: 'accent',
          negative: 'negative'
        },
        isDisabled: 'disabled'
      },
      outline: {
        default: 'transparent',
        isHovered: 'gray-100',
        isPressed: 'gray-100',
        isFocusVisible: 'gray-100'
      }
    },
    staticColor: {
      white: {
        treatment: {
          fill: {
            variant: {
              primary: baseColor('transparent-white-800'),
              secondary: baseColor('transparent-white-100')
            },
            isDisabled: 'transparent-white-100'
          },
          outline: {
            default: 'transparent',
            isHovered: 'transparent-white-100',
            isPressed: 'transparent-white-100',
            isFocusVisible: 'transparent-white-100'
          }
        }
      },
      black: {
        treatment: {
          fill: {
            variant: {
              primary: baseColor('transparent-black-800'),
              secondary: baseColor('transparent-black-100')
            },
            isDisabled: 'transparent-black-100'
          },
          outline: {
            default: 'transparent',
            isHovered: 'transparent-black-100',
            isPressed: 'transparent-black-100',
            isFocusVisible: 'transparent-black-100'
          }
        }
      }
    },
    forcedColors: {
      treatment: {
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
    treatment: {
      fill: {
        variant: {
          primary: 'gray-25',
          secondary: 'neutral',
          accent: 'white',
          negative: 'white'
        },
        isDisabled: 'disabled'
      },
      outline: {
        default: 'neutral',
        isDisabled: 'disabled'
      }
    },
    staticColor: {
      white: {
        treatment: {
          fill: {
            variant: {
              primary: 'black',
              secondary: baseColor('transparent-white-800')
            }
          },
          outline: baseColor('transparent-white-800')
        },
        isDisabled: 'transparent-white-400'
      },
      black: {
        treatment: {
          fill: {
            variant: {
              primary: 'white',
              secondary: baseColor('transparent-black-800')
            }
          },
          outline: baseColor('transparent-black-800')
        },
        isDisabled: 'transparent-black-400'
      }
    },
    forcedColors: {
      treatment: {
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
    staticColor: {
      white: 'white',
      black: 'black'
    },
    forcedColors: 'Highlight'
  },
  forcedColorAdjust: 'none',
  disableTapHighlight: true
}, getAllowedOverrides());

function Button(props: ButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  let domRef = useFocusableRef(ref);
  let ctx = useContext(ButtonContext);
  props = mergeProps(ctx, props);

  return (
    <RACButton
      {...props}
      ref={domRef}
      style={pressScale(domRef, props.UNSAFE_style)}
      className={renderProps => (props.UNSAFE_className || '') + button({
        ...renderProps,
        variant: props.variant || 'primary',
        treatment: props.treatment || 'fill',
        size: props.size || 'M',
        staticColor: props.staticColor
      }, props.styles)}>
      <Provider
        values={[
          [TextContext, {className: style({paddingY: '--labelPadding', order: 1})}],
          [IconContext, {
            render: centerBaseline({slot: 'icon', className: style({order: 0})}),
            styles: style({size: fontRelative(20), marginStart: '--iconMargin', flexShrink: 0})
          }]
        ]}>
        {typeof props.children === 'string' ? <Text>{props.children}</Text> : props.children}
      </Provider>
    </RACButton>
  );
}

/**
 * Buttons allow users to perform an action.
 * They have multiple styles for various needs, and are ideal for calling attention to
 * where a user needs to do something in order to move forward in a flow.
 */
let _Button = forwardRef(Button);
export {_Button as Button};

function LinkButton(props: LinkButtonProps, ref: FocusableRef<HTMLAnchorElement>) {
  let domRef = useFocusableRef(ref);
  let ctx = useContext(ButtonContext);
  props = mergeProps(ctx, props);

  return (
    <Link
      {...props}
      ref={domRef}
      style={pressScale(domRef, props.UNSAFE_style)}
      className={renderProps => (props.UNSAFE_className || '') + button({
        ...renderProps,
        variant: props.variant || 'primary',
        treatment: props.treatment || 'fill',
        size: props.size || 'M',
        staticColor: props.staticColor
      }, props.styles)}>
      <Provider
        values={[
          [TextContext, {className: style({paddingY: '--labelPadding', order: 1})}],
          [IconContext, {
            render: centerBaseline({slot: 'icon', className: style({order: 0})}),
            styles: style({size: fontRelative(20), marginStart: '--iconMargin', flexShrink: 0})
          }]
        ]}>
        {typeof props.children === 'string' ? <Text>{props.children}</Text> : props.children}
      </Provider>
    </Link>
  );
}

/**
 * A LinkButton combines the functionality of a link with the appearance of a button. Useful for allowing users to navigate to another page.
 */
let _LinkButton = forwardRef(LinkButton);
export {_LinkButton as LinkButton};
