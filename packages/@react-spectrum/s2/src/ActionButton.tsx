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
import {baseColor, focusRing, fontRelative, style} from '../style' with { type: 'macro' };
import {ButtonProps, ButtonRenderProps, ContextValue, OverlayTriggerStateContext, Provider, Button as RACButton, useSlottedContext} from 'react-aria-components';
import {centerBaseline} from './CenterBaseline';
import {createContext, forwardRef, ReactNode, useContext} from 'react';
import {FocusableRef, FocusableRefValue} from '@react-types/shared';
import {getAllowedOverrides, staticColor, StyleProps} from './style-utils' with { type: 'macro' };
import {IconContext} from './Icon';
import {pressScale} from './pressScale';
import {SkeletonContext} from './Skeleton';
import {Text, TextContext} from './Content';
import {useFocusableRef} from '@react-spectrum/utils';
import {useFormProps} from './Form';
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

export interface ActionButtonProps extends Omit<ButtonProps, 'className' | 'style' | 'children' | 'onHover' | 'onHoverStart' | 'onHoverEnd' | 'onHoverChange' | 'isPending'>, StyleProps, ActionButtonStyleProps {
  /** The content to display in the ActionButton. */
  children?: ReactNode
}

// These styles handle both ActionButton and ToggleButton
const iconOnly = ':has([slot=icon], [slot=avatar]):not(:has([data-rsp-slot=text]))';
export const btnStyles = style<ButtonRenderProps & ActionButtonStyleProps & ToggleButtonStyleProps & ActionGroupItemStyleProps & {isInGroup: boolean, isStaticColor: boolean}>({
  ...focusRing(),
  ...staticColor(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  columnGap: 'text-to-visual',
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
  font: 'control',
  fontWeight: 'medium',
  userSelect: 'none',
  height: 'control',
  minWidth: 'control',
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
      default: 'neutral',
      isEmphasized: 'accent',
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
    default: 'neutral',
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
  paddingX: {
    default: 'edge-to-text',
    [iconOnly]: 0
  },
  paddingY: 0,
  borderTopStartRadius: {
    default: 'control',
    density: {
      compact: {
        default: 'none',
        ':first-child': 'control'
      }
    }
  },
  borderTopEndRadius: {
    default: 'control',
    density: {
      compact: {
        default: 'none',
        orientation: {
          horizontal: {
            ':last-child': 'control'
          },
          vertical: {
            ':first-child': 'control'
          }
        }
      }
    }
  },
  borderBottomStartRadius: {
    default: 'control',
    density: {
      compact: {
        default: 'none',
        orientation: {
          horizontal: {
            ':first-child': 'control'
          },
          vertical: {
            ':last-child': 'control'
          }
        }
      }
    }
  },
  borderBottomEndRadius: {
    default: 'control',
    density: {
      compact: {
        default: 'none',
        ':last-child': 'control'
      }
    }
  },
  '--iconMargin': {
    type: 'marginTop',
    value: {
      default: fontRelative(-2),
      [iconOnly]: 0
    }
  },
  zIndex: {
    isFocusVisible: 2
  },
  disableTapHighlight: true
}, getAllowedOverrides());

// Matching icon sizes. TBD.
const avatarSize = {
  XS: 14,
  S: 16,
  M: 20,
  L: 22,
  X: 26
} as const;

export const ActionButtonContext = createContext<ContextValue<ActionButtonProps, FocusableRefValue<HTMLButtonElement>>>(null);

/**
 * ActionButtons allow users to perform an action.
 * They’re used for similar, task-based options within a workflow, and are ideal for interfaces where buttons aren’t meant to draw a lot of attention.
 */
export const ActionButton = forwardRef(function ActionButton(props: ActionButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, ActionButtonContext);
  props = useFormProps(props as any);
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
    size = props.size || 'M',
    isDisabled = props.isDisabled
  } = ctx || {};

  return (
    <RACButton
      {...props}
      isDisabled={isDisabled}
      ref={domRef}
      style={pressScale(domRef, props.UNSAFE_style)}
      className={renderProps => (props.UNSAFE_className || '') + btnStyles({
        ...renderProps,
        // Retain hover styles when an overlay is open.
        isHovered: renderProps.isHovered || overlayTriggerState?.isOpen || false,
        staticColor,
        isStaticColor: !!staticColor,
        size,
        isQuiet,
        density,
        isJustified,
        orientation,
        isInGroup
      }, props.styles)}>
      <Provider
        values={[
          [SkeletonContext, null],
          [TextContext, {styles: style({paddingY: '--labelPadding', order: 1, truncate: true})}],
          [IconContext, {
            render: centerBaseline({slot: 'icon', styles: style({order: 0})}),
            styles: style({size: fontRelative(20), marginStart: '--iconMargin', flexShrink: 0})
          }],
          [AvatarContext, {
            size: avatarSize[size],
            styles: style({marginStart: '--iconMargin', flexShrink: 0, order: 0})
          }]
        ]}>
        {typeof props.children === 'string' ? <Text>{props.children}</Text> : props.children}
      </Provider>
    </RACButton>
  );
});
