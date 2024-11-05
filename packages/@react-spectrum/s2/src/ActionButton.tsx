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

import {baseColor, focusRing, fontRelative, style} from '../style' with { type: 'macro' };
import {ButtonProps, ButtonRenderProps, ContextValue, OverlayTriggerStateContext, Provider, Button as RACButton} from 'react-aria-components';
import {centerBaseline} from './CenterBaseline';
import {createContext, forwardRef, ReactNode, useContext} from 'react';
import {FocusableRef, FocusableRefValue} from '@react-types/shared';
import {getAllowedOverrides, StyleProps} from './style-utils' with { type: 'macro' };
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
  staticColor?: 'black' | 'white',
  /** Whether the button should be displayed with a [quiet style](https://spectrum.adobe.com/page/action-button/#Quiet). */
  isQuiet?: boolean
}

interface ToggleButtonStyleProps {
  /** Whether the ActionButton should be selected (controlled). */
  isSelected?: boolean,
  /** Whether the button should be displayed with an [emphasized style](https://spectrum.adobe.com/page/action-button/#Emphasis). */
  isEmphasized?: boolean
}

export interface ActionButtonProps extends Omit<ButtonProps, 'className' | 'style' | 'children' | 'onHover' | 'onHoverStart' | 'onHoverEnd' | 'onHoverChange' | 'isPending'>, StyleProps, ActionButtonStyleProps {
  /** The content to display in the ActionButton. */
  children?: ReactNode
}

// These styles handle both ActionButton and ToggleButton
export const btnStyles = style<ButtonRenderProps & ActionButtonStyleProps & ToggleButtonStyleProps>({
  ...focusRing(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  columnGap: 'text-to-visual',
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
    staticColor: {
      white: {
        ...baseColor('transparent-white-100'),
        default: {
          default: 'transparent-white-100',
          isQuiet: 'transparent'
        },
        isSelected: {
          default: baseColor('transparent-white-800'),
          isDisabled: {
            default: 'transparent-white-100',
            isQuiet: 'transparent'
          }
        }
      },
      black: {
        ...baseColor('transparent-black-100'),
        default: {
          default: 'transparent-black-100',
          isQuiet: 'transparent'
        },
        isSelected: {
          default: baseColor('transparent-black-800'),
          isDisabled: {
            default: 'transparent-black-100',
            isQuiet: 'transparent'
          }
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
    staticColor: {
      white: {
        default: baseColor('transparent-white-800'),
        isSelected: 'black',
        isDisabled: 'transparent-white-400'
      },
      black: {
        default: baseColor('transparent-black-800'),
        isSelected: 'white',
        isDisabled: 'transparent-black-400'
      }
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
    staticColor: {
      white: 'white',
      black: 'black'
    },
    forcedColors: 'Highlight'
  },
  borderStyle: 'none',
  paddingX: {
    default: 'edge-to-text',
    ':has([slot=icon]:only-child)': 0
  },
  paddingY: 0,
  borderRadius: 'control',
  '--iconMargin': {
    type: 'marginTop',
    value: {
      default: fontRelative(-2),
      ':has([slot=icon]:only-child)': 0
    }
  },
  disableTapHighlight: true
}, getAllowedOverrides());

export const ActionButtonContext = createContext<ContextValue<ActionButtonProps, FocusableRefValue<HTMLButtonElement>>>(null);

function ActionButton(props: ActionButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, ActionButtonContext);
  props = useFormProps(props as any);
  let domRef = useFocusableRef(ref);
  let overlayTriggerState = useContext(OverlayTriggerStateContext);

  return (
    <RACButton
      {...props}
      ref={domRef}
      style={pressScale(domRef, props.UNSAFE_style)}
      className={renderProps => (props.UNSAFE_className || '') + btnStyles({
        ...renderProps,
        // Retain hover styles when an overlay is open.
        isHovered: renderProps.isHovered || overlayTriggerState?.isOpen || false,
        staticColor: props.staticColor,
        size: props.size || 'M',
        isQuiet: props.isQuiet
      }, props.styles)}>
      <Provider
        values={[
          [SkeletonContext, null],
          [TextContext, {styles: style({paddingY: '--labelPadding', order: 1, truncate: true})}],
          [IconContext, {
            render: centerBaseline({slot: 'icon', styles: style({order: 0})}),
            styles: style({size: fontRelative(20), marginStart: '--iconMargin', flexShrink: 0})
          }]
        ]}>
        {typeof props.children === 'string' ? <Text>{props.children}</Text> : props.children}
      </Provider>
    </RACButton>
  );
}

/**
 * ActionButtons allow users to perform an action.
 * They’re used for similar, task-based options within a workflow, and are ideal for interfaces where buttons aren’t meant to draw a lot of attention.
 */
let _ActionButton = forwardRef(ActionButton);
export {_ActionButton as ActionButton};
