/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Radio as AriaRadio, Checkbox as AriaCheckbox, ContextValue, RadioProps, CheckboxProps} from 'react-aria-components';
import {FocusableRef, FocusableRefValue, SpectrumLabelableProps, HelpTextProps} from '@react-types/shared';
import {Checkbox} from './Checkbox';
import {forwardRef, ReactNode, useContext, useRef, createContext} from 'react';
import {useFocusableRef} from '@react-spectrum/utils';
import {SelectBoxContext} from './SelectBoxGroup';
import {style, focusRing, baseColor} from '../style' with {type: 'macro'};
import {controlFont, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {useSpectrumContextProps} from './useSpectrumContextProps';
import React from 'react';

export interface SelectBoxProps extends 
  Omit<CheckboxProps & RadioProps, 'className' | 'style' | 'children'>, StyleProps {
  /**
   * The value of the SelectBox.
   */
  value: string,
  /**
   * The label for the element.
   */
  children?: ReactNode,
  /**
   * Whether the SelectBox is disabled.
   */
  isDisabled?: boolean
}

export const SelectBoxItemContext = createContext<ContextValue<Partial<SelectBoxProps>, FocusableRefValue<HTMLLabelElement>>>(null);

// Simple basic styling with proper dark mode support
const selectBoxStyles = style({
  ...focusRing(),
  display: 'flex',
  flexDirection: 'column',
  lineHeight: 'title',
  justifyContent: 'center',
  flexShrink: 0,
  alignItems: 'center',
  fontFamily: 'sans',
  font: 'ui',
  //vertical orientation
  size: {
    default: {
      size: {
        S: 120,
        M: 170,
        L: 220,
        XL: 270
      }
    },
    //WIP horizontal orientation
    orientation: {
      horizontal: {
        size: {
          S: 280,
          M: 368,
          L: 420,
          XL: 480
        }
      }
    }
  },
  minWidth: {
    default: {
      size: {
        S: 100,
        M: 144,
        L: 180,
        XL: 220
      }
    },
    orientation: {
      horizontal: {
        size: {
          S: 160,
          M: 188,
          L: 220,
          XL: 250
        }
      }
    }
  },
  maxWidth: {
    default: {
      size: {
        S: 140,
        M: 200,
        L: 260,
        XL: 320
      }
    },
    orientation: {
      horizontal: {
        size: {
          S: 360,
          M: 420,
          L: 480,
          XL: 540
        }
      }
    }
  },
  minHeight: {
    default: {
      size: {
        S: 100,
        M: 144,
        L: 180,
        XL: 220
      }
    },
    orientation: {
      horizontal: 80
    }
  },
  maxHeight: {
    default: {
      size: {
        S: 140,
        M: 200,
        L: 260,
        XL: 320
      }
    },
    orientation: {
      horizontal: 240
    }
  },
  padding: {
    size: {
      S: 16,
      M: 24,
      L: 32,
      XL: 40
    }
  },
  borderRadius: 'lg',
  backgroundColor: 'layer-2',
  boxShadow: {
    default: 'emphasized',
    isHovered: 'elevated',
    isSelected: 'elevated',
    forcedColors: 'none'
  },
  position: 'relative',
  borderWidth: 2,
  borderStyle: {
    default: 'solid',
    isSelected: 'solid'
  },
  borderColor: {
    default: 'transparent',
    isSelected: 'gray-900',
    isFocusVisible: 'transparent'
  },
  transition: 'default'
}, getAllowedOverrides());

const checkboxContainer = style({
  position: 'absolute',
  top: 16,
  left: 16
}, getAllowedOverrides());

/**
 * SelectBox components allow users to select options from a list.
 * They can behave as radio buttons (single selection) or checkboxes (multiple selection).
 */
export const SelectBox = /*#__PURE__*/ forwardRef(function SelectBox(props: SelectBoxProps, ref: FocusableRef<HTMLLabelElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, SelectBoxItemContext);
  let {children, value, isDisabled = false, UNSAFE_className = '', UNSAFE_style} = props;
  let inputRef = useRef<HTMLInputElement | null>(null);
  let domRef = useFocusableRef(ref, inputRef);
  
  let groupContext = useContext(SelectBoxContext);
  let {
    allowMultiSelect = false,
    size = 'M',
    orientation = 'vertical'
  } = groupContext || {};

  const Selector = allowMultiSelect ? AriaCheckbox : AriaRadio;
  
  return (
    <Selector
      value={value}
      isDisabled={isDisabled}
      ref={domRef}
      inputRef={inputRef}
      style={UNSAFE_style}
      className={renderProps => UNSAFE_className + selectBoxStyles({...renderProps, size, orientation}, props.styles)}>
      {renderProps => (
        <>
          {(renderProps.isSelected || renderProps.isHovered) && (
            <div className={checkboxContainer({...renderProps, size}, props.styles)}>
              <Checkbox 
                value={value}
                isSelected={renderProps.isSelected}
                isDisabled={isDisabled}
                size={size}
              />
            </div>
          )}
          {children}
        </>
      )}
    </Selector>
  );
});