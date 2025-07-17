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

import {Checkbox} from './Checkbox';
import {FocusableRef} from '@react-types/shared';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import React, {createContext, forwardRef, ReactNode, useContext, useRef} from 'react';
import {SelectBoxContext} from './SelectBoxGroup';
import {style} from '../style' with {type: 'macro'};
import {useFocusableRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface SelectBoxProps extends StyleProps {
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

export const SelectBoxItemContext = createContext<any>(null);

const selectBoxStyles = style({
  display: 'flex',
  flexDirection: {
    default: 'column',
    orientation: {
      horizontal: 'row'
    }
  },
  lineHeight: 'title',
  justifyContent: 'center',
  flexShrink: 0,
  alignItems: 'center',
  font: 'ui',
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
      horizontal: 'auto'
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
      horizontal: 'auto'
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
  backgroundColor: {
    default: 'layer-2',
    isSelected: 'layer-2',
    isDisabled: 'layer-1'
  },
  color: {
    isEmphasized: 'gray-900',
    isDisabled: 'disabled'
  },
  boxShadow: {
    default: 'emphasized',
    isHovered: 'elevated',
    isSelected: 'elevated',
    forcedColors: 'none',
    isDisabled: 'emphasized'
  },
  outlineStyle: 'none',
  position: 'relative',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: {
    default: 'transparent',
    isSelected: 'gray-900',
    isFocusVisible: 'blue-900',
    isDisabled: 'transparent'
  },
  transition: 'default',
  gap: {
    orientation: {
      horizontal: 'text-to-visual'
    }
  },
  cursor: {
    default: 'pointer',
    isDisabled: 'default'
  }
}, getAllowedOverrides());

const contentContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: {
    default: 'center',
    orientation: {
      horizontal: 'start'
    }
  },
  justifyContent: 'center',
  textAlign: {
    default: 'center',
    orientation: {
      horizontal: 'start'
    }
  },
  flex: {
    orientation: {
      horizontal: 1
    }
  }
}, getAllowedOverrides());

const iconContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  size: {
    XS: 16,
    S: 20,
    M: 24,
    L: 28,
    XL: 32
  },
  flexShrink: 0,
  color: {
    isDisabled: 'disabled'
  },
  opacity: {
    isDisabled: 0.4
  }
});

const textContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: {
    default: 'center',
    orientation: {
      horizontal: 'start'
    }
  },
  gap: 'text-to-visual',
  color: {
    isDisabled: 'disabled'
  }
}, getAllowedOverrides());

const descriptionText = style({
  display: {
    default: 'none',
    orientation: {
      horizontal: 'block'
    }
  },
  font: 'ui-sm',
  color: {
    default: 'gray-600',
    isDisabled: 'disabled'
  },
  lineHeight: 'body'
});

const checkboxContainer = style({
  position: 'absolute',
  top: 16,
  left: 16
});

const SelectBoxRenderPropsContext = createContext<{
  isHovered?: boolean,
  isFocusVisible?: boolean,
  isPressed?: boolean
}>({});

/**
 * SelectBox components allow users to select options from a list.
 * Works as content within a GridListItem for automatic grid navigation.
 */
export const SelectBox = /*#__PURE__*/ forwardRef(function SelectBox(props: SelectBoxProps, ref: FocusableRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, SelectBoxItemContext);
  let {children, value, isDisabled: individualDisabled = false, UNSAFE_style} = props;
  let divRef = useRef<HTMLDivElement | null>(null);
  let domRef = useFocusableRef(ref, divRef);
  
  let contextValue = useContext(SelectBoxContext);
  let {
    size = 'M',
    orientation = 'vertical',
    selectedKeys,
    isDisabled: groupDisabled = false
  } = contextValue;

  let renderProps = useContext(SelectBoxRenderPropsContext);

  const isDisabled = individualDisabled || groupDisabled;
  const isSelected = selectedKeys === 'all' || (selectedKeys && selectedKeys.has(value));
  const showCheckbox = isSelected || (!isDisabled && renderProps.isHovered);
  
  return (
    <div
      ref={domRef}
      className={selectBoxStyles({
        size, 
        orientation, 
        isDisabled,
        isSelected,
        isHovered: renderProps.isHovered || false,
        isFocusVisible: renderProps.isFocusVisible || false
      }, props.styles)}
      style={UNSAFE_style}>
      
      {showCheckbox && (
        <div className={checkboxContainer}>
          <div style={{pointerEvents: 'none'}}>
            <Checkbox 
              isSelected={isSelected}
              isDisabled={isDisabled}
              size={size === 'XS' ? 'S' : size}
              isReadOnly />
          </div>
        </div>
      )}
      {orientation === 'horizontal' ? (
        <>
          {React.Children.toArray(children).find((child: any) => child?.props?.slot === 'icon') && (
            <div className={iconContainer({size, orientation, isDisabled})}>
              {React.Children.toArray(children).find((child: any) => child?.props?.slot === 'icon')}
            </div>
          )}
          
          <div className={contentContainer({size, orientation}, props.styles)}>
            <div className={textContainer({size, orientation, isDisabled}, props.styles)}>
              {React.Children.toArray(children).find((child: any) => child?.props?.slot === 'text')}
              
              {React.Children.toArray(children).find((child: any) => child?.props?.slot === 'description') && (
                <div className={descriptionText({size, orientation, isDisabled})}>
                  {React.Children.toArray(children).find((child: any) => child?.props?.slot === 'description')}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {React.Children.toArray(children).find((child: any) => child?.props?.slot === 'icon') && (
            <div className={iconContainer({size, orientation, isDisabled})}>
              {React.Children.toArray(children).find((child: any) => child?.props?.slot === 'icon')}
            </div>
          )}
          
          <div className={textContainer({size, orientation, isDisabled})}>
            {React.Children.toArray(children).find((child: any) => child?.props?.slot === 'text')}
          </div>
        </>
      )}
      
      {React.Children.toArray(children).filter((child: any) => 
        !['icon', 'text', 'description'].includes(child?.props?.slot)
      )}
    </div>
  );
});

export {SelectBoxRenderPropsContext};
