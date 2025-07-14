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

import {Checkbox as AriaCheckbox, Radio as AriaRadio, CheckboxProps, ContextValue, RadioProps} from 'react-aria-components';
import {Checkbox} from './Checkbox';
import {FocusableRef, FocusableRefValue} from '@react-types/shared';
import {focusRing, style} from '../style' with {type: 'macro'};
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import React, {createContext, forwardRef, ReactNode, useContext, useRef} from 'react';
import {SelectBoxContext} from './SelectBoxGroup';
import {useFocusableRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

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
  isDisabled?: boolean,
  /**
   * Whether the SelectBox is selected (controlled).
   */
  isSelected?: boolean,
  /**
   * Handler called when the SelectBox selection changes.
   */
  onChange?: (isSelected: boolean) => void
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
  
  // Vertical orientation (default) - Fixed square dimensions
  width: {
    default: {
      size: {
        XS: 100,
        S: 128,
        M: 136,
        L: 160,
        XL: 192
      }
    },
    orientation: {
      horizontal: {
        size: {
          XS: 'auto',
          S: 'auto',
          M: 'auto',
          L: 'auto',
          XL: 'auto'
        }
      }
    }
  },
  
  height: {
    default: {
      size: {
        XS: 100,
        S: 128,
        M: 136,
        L: 160,
        XL: 192
      }
    },
    orientation: {
      horizontal: {
        size: {
          XS: 'auto',
          S: 'auto',
          M: 'auto',
          L: 'auto',
          XL: 'auto'
        }
      }
    }
  },
  
  minWidth: {
    orientation: {
      horizontal: 160
    }
  },
  
  maxWidth: {
    orientation: {
      horizontal: 272
    }
  },

  padding: {
    size: {
      XS: 12,
      S: 16,
      M: 20,
      L: 24,
      XL: 28
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
  let {children, value, isDisabled = false, isSelected, onChange, UNSAFE_className = '', UNSAFE_style} = props;
  let inputRef = useRef<HTMLInputElement | null>(null);
  let domRef = useFocusableRef(ref, inputRef);
  
  let groupContext = useContext(SelectBoxContext);
  let {
    allowMultiSelect = false,
    size = 'M',
    orientation = 'vertical'
  } = groupContext;

  const Selector = allowMultiSelect ? AriaCheckbox : AriaRadio;
  
  // Handle controlled selection
  const handleSelectionChange = (selected: boolean) => {
    if (onChange) {
      onChange(selected);
    }
  };
  
  return (
    <Selector
      value={value}
      isDisabled={isDisabled}
      isSelected={isSelected}
      onChange={handleSelectionChange}
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
                size={size} />
            </div>
          )}
          {children}
        </>
      )}
    </Selector>
  );
});
