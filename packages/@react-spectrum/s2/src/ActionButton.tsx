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

import {ActionButtonGroupContext} from './ActionButtonGroup';
import {AvatarContext} from './Avatar';
import {baseColor, focusRing, fontRelative, lightDark, style} from '../style' with { type: 'macro' };
import {ButtonProps, ButtonRenderProps, ContextValue, OverlayTriggerStateContext, Provider, Button as RACButton, useSlottedContext} from 'react-aria-components';
import {centerBaseline} from './CenterBaseline';
import {control, getAllowedOverrides, staticColor, StyleProps} from './style-utils' with { type: 'macro' };
import {createContext, forwardRef, ReactNode, useContext} from 'react';
import {FocusableRef, FocusableRefValue, GlobalDOMAttributes} from '@react-types/shared';
import {IconContext} from './Icon';
import {ImageContext} from './Image';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {NotificationBadgeContext} from './NotificationBadge';
import {pressScale} from './pressScale';
import {ProgressCircle} from './ProgressCircle';
import {SkeletonContext} from './Skeleton';
import {Text, TextContext} from './Content';
import {useFocusableRef} from '@react-spectrum/utils';
import {useFormProps} from './Form';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {usePendingState} from './Button';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface ActionButtonStyleProps {
  /**
   * The size of the ActionButton.
   *
   * @default 'M'
   */
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL',
  /** The static color style to apply. Useful when the ActionButton appears over a color background. */
  staticColor?: 'black' | 'white' | 'auto',
  /** Whether the button should be displayed with a [quiet style](https://spectrum.adobe.com/page/action-button/#Quiet). */
  isQuiet?: boolean
}

interface ToggleButtonStyleProps {
  /** Whether the ActionButton should be selected (controlled). */
  isSelected?: boolean,
  /** Whether the button should be displayed with an [emphasized style](https://spectrum.adobe.com/page/action-button/#Emphasis). */
  isEmphasized?: boolean
}

interface ActionGroupItemStyleProps {
  density?: 'regular' | 'compact',
  orientation?: 'horizontal' | 'vertical',
  isJustified?: boolean
}

export interface ActionButtonProps extends Omit<ButtonProps, 'className' | 'style' | 'children' | 'onHover' | 'onHoverStart' | 'onHoverEnd' | 'onHoverChange' | 'onClick' | keyof GlobalDOMAttributes>, StyleProps, ActionButtonStyleProps {
  /** The content to display in the ActionButton. */
  children: ReactNode
}

// These styles handle both ActionButton and ToggleButton
const iconOnly = ':has([slot=icon], [slot=avatar]):not(:has([data-rsp-slot=text]))';
const avatarOnly = ':has([slot=avatar]):not(:has([slot=icon], [data-rsp-slot=text]))';
const textOnly = ':has([data-rsp-slot=text]):not(:has([slot=icon], [slot=avatar]))';
const controlStyle = control({shape: 'default', icon: true});
export const btnStyles = style<ButtonRenderProps & ActionButtonStyleProps & ToggleButtonStyleProps & ActionGroupItemStyleProps & {isInGroup: boolean, isStaticColor: boolean}>({
  ...focusRing(),
  ...staticColor(),
  ...controlStyle,
  position: 'relative',
  justifyContent: 'center',
  flexShrink: {
    default: 1,
    isInGroup: 0
  },
  flexGrow: {
    isJustified: 1
  },
  flexBasis: {
    isJustified: 0
  },
  fontWeight: 'medium',
  userSelect: 'none',
  transition: 'default',
  forcedColorAdjust: 'none',
  backgroundColor: {
    default: {
      ...baseColor('gray-100'),
      default: {
        default: 'gray-100',
        isQuiet: 'transparent'
      }
    },
    isSelected: {
      default: baseColor('neutral'),
      isEmphasized: {
        default: lightDark('accent-900', 'accent-700'),
        isHovered: lightDark('accent-1000', 'accent-600'),
        isPressed: lightDark('accent-1000', 'accent-600'),
        isFocusVisible: lightDark('accent-1000', 'accent-600')
      },
      isDisabled: {
        default: 'gray-100',
        isQuiet: 'transparent'
      }
    },
    isStaticColor: {
      ...baseColor('transparent-overlay-100'),
      default: {
        default: 'transparent-overlay-100',
        isQuiet: 'transparent'
      },
      isSelected: {
        default: baseColor('transparent-overlay-800'),
        isDisabled: {
          default: 'transparent-overlay-100',
          isQuiet: 'transparent'
        }
      }
    },
    forcedColors: {
      default: 'ButtonFace',
      isSelected: {
        default: 'Highlight',
        isDisabled: 'ButtonFace'
      }
    }
  },
  color: {
    default: baseColor('neutral'),
    isSelected: {
      default: 'gray-25',
      isEmphasized: 'white'
    },
    isDisabled: 'disabled',
    isStaticColor: {
      default: baseColor('transparent-overlay-800'),
      isSelected: 'auto',
      isDisabled: 'transparent-overlay-400'
    },
    forcedColors: {
      default: 'ButtonText',
      isSelected: 'HighlightText',
      isDisabled: {
        default: 'GrayText'
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
  borderStyle: 'none',
  borderTopStartRadius: {
    default: controlStyle.borderRadius,
    density: {
      compact: {
        default: 'none',
        ':first-child': controlStyle.borderRadius
      }
    }
  },
  borderTopEndRadius: {
    default: controlStyle.borderRadius,
    density: {
      compact: {
        default: 'none',
        orientation: {
          horizontal: {
            ':last-child': controlStyle.borderRadius
          },
          vertical: {
            ':first-child': controlStyle.borderRadius
          }
        }
      }
    }
  },
  borderBottomStartRadius: {
    default: controlStyle.borderRadius,
    density: {
      compact: {
        default: 'none',
        orientation: {
          horizontal: {
            ':first-child': controlStyle.borderRadius
          },
          vertical: {
            ':last-child': controlStyle.borderRadius
          }
        }
      }
    }
  },
  borderBottomEndRadius: {
    default: controlStyle.borderRadius,
    density: {
      compact: {
        default: 'none',
        ':last-child': controlStyle.borderRadius
      }
    }
  },
  zIndex: {
    isFocusVisible: 2
  },
  disableTapHighlight: true,
  '--badgeTop': {
    type: 'top',
    value: {
      default: 'calc(self(height)/2 - var(--iconWidth)/2)',
      [textOnly]: 0
    }
  },
  '--iconWidth': {
    type: 'width',
    value: fontRelative(20)
  },
  '--badgePosition': {
    type: 'width',
    value: {
      default: 'calc(self(paddingStart) + var(--iconWidth))',
      [iconOnly]: 'calc(self(minWidth)/2 + var(--iconWidth)/2)',
      [textOnly]: 'full'
    }
  },
  paddingX: {
    default: controlStyle.paddingX,
    [avatarOnly]: 0
  },
  // `control` sets this, but we need to override it for avatar only buttons.
  '--iconMargin': {
    type: 'marginStart',
    value: {
      default: fontRelative(-2),
      [iconOnly]: 0,
      [avatarOnly]: 0
    }
  }
}, getAllowedOverrides());

// Matching icon sizes. TBD.
const avatarSize: Record<NonNullable<ActionButtonStyleProps['size']>, number> = {
  XS: 14,
  S: 16,
  M: 20,
  L: 22,
  XL: 26
} as const;

export const ActionButtonContext = createContext<ContextValue<Partial<ActionButtonProps>, FocusableRefValue<HTMLButtonElement>>>(null);

/**
 * ActionButtons allow users to perform an action.
 * They're used for similar, task-based options within a workflow, and are ideal for interfaces where buttons aren't meant to draw a lot of attention.
 */
export const ActionButton = forwardRef(function ActionButton(props: ActionButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, ActionButtonContext);
  props = useFormProps(props as any);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  let {isPending = false} = props;
  let domRef = useFocusableRef(ref);
  let overlayTriggerState = useContext(OverlayTriggerStateContext);
  let ctx = useSlottedContext(ActionButtonGroupContext);
  let isInGroup = !!ctx;
  let {
    density = 'regular',
    isJustified,
    orientation = 'horizontal',
    staticColor = props.staticColor,
    isQuiet = props.isQuiet,
    size = props.size || 'M'
  } = ctx || {};

  let {isProgressVisible} = usePendingState(isPending);

  return (
    <RACButton
      {...props}
      ref={domRef}
      style={pressScale(domRef, props.UNSAFE_style)}
      className={renderProps => (props.UNSAFE_className || '') + btnStyles({
        ...renderProps,
        // Retain hover styles when an overlay is open.
        isHovered: renderProps.isHovered || overlayTriggerState?.isOpen || false,
        isDisabled: renderProps.isDisabled || isProgressVisible,
        staticColor,
        isStaticColor: !!staticColor,
        size,
        isQuiet,
        density,
        isJustified,
        orientation,
        isInGroup
      }, props.styles)}>
      {({isDisabled}) => (
        <>
          <Provider
            values={[
              [SkeletonContext, null],
              [TextContext, {styles:
                style({
                  order: 1,
                  truncate: true,
                  visibility: {
                    isProgressVisible: 'hidden'
                  }
                })({isProgressVisible})
              }],
              [IconContext, {
                render: centerBaseline({slot: 'icon', styles: style({order: 0})}),
                styles: style({
                  size: fontRelative(20),
                  marginStart: '--iconMargin',
                  flexShrink: 0,
                  visibility: {
                    isProgressVisible: 'hidden'
                  }
                })({isProgressVisible})
              }],
              [AvatarContext, {
                size: avatarSize[size],
                styles: style({
                  marginStart: '--iconMargin',
                  flexShrink: 0,
                  order: 0
                })
              }],
              [ImageContext, {
                styles: style({
                  visibility: {
                    isProgressVisible: 'hidden'
                  }
                })({isProgressVisible})
              }],
              [NotificationBadgeContext, {
                staticColor: staticColor,
                size: props.size === 'XS' ? undefined : props.size,
                isDisabled: isDisabled,
                styles: style({
                  position: 'absolute',
                  top: '--badgeTop',
                  insetStart: '--badgePosition',
                  marginTop: 'calc((self(height) * -1)/2)',
                  marginStart: 'calc((self(height) * -1)/2)',
                  visibility: {
                    isProgressVisible: 'hidden'
                  }
                })({isProgressVisible})
              }]
            ]}>
            {typeof props.children === 'string' ? <Text>{props.children}</Text> : props.children}
            {isPending &&
              <div
                className={style({
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  visibility: {
                    default: 'hidden',
                    isProgressVisible: 'visible'
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
                        XS: 12,
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
        </>
      )}
    </RACButton>
  );
});
