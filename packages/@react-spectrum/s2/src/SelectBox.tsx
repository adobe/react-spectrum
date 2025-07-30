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

import {box, iconStyles} from './Checkbox';
import Checkmark from '../ui-icons/Checkmark';
import {ContextValue} from 'react-aria-components';
import {FocusableRef, FocusableRefValue} from '@react-types/shared';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import React, {createContext, forwardRef, ReactNode, useContext, useRef} from 'react';
import {SelectBoxContext} from './SelectBoxGroup';
import {style} from '../style' with {type: 'macro'};
import {useFocusableRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';
import { IllustrationContext } from './Icon';

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
  isDisabled?: boolean,
  /**
   * Whether to hide the selection checkbox.
   * @default false
   */
  isCheckboxHidden?: boolean,
  /**
   * Whether to hide the label/text content.
   * @default false
   */
  isLabelHidden?: boolean,
  /**
   * Whether to hide the illustration/icon.
   * @default false
   */
  isIllustrationHidden?: boolean
}

export const SelectBoxSpectrumContext = createContext<ContextValue<Partial<SelectBoxProps>, FocusableRefValue<HTMLDivElement>>>(null);

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

  marginBottom: {
    default: 8,
    orientation: {
      horizontal: 0
    }
  },
  marginEnd: {
    default: 0,
    orientation: {
      horizontal: 8
    }
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
    default: 'neutral',
    isDisabled: {
      default: 'gray-600',
      forcedColors: 'GrayText'
    }
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
  [props, ref] = useSpectrumContextProps(props, ref, SelectBoxSpectrumContext);
  let {
    children, 
    value, 
    isDisabled: individualDisabled = false, 
    isCheckboxHidden = false,
    isLabelHidden = false,
    isIllustrationHidden = false,
    UNSAFE_style
  } = props;
  let divRef = useRef<HTMLDivElement | null>(null);
  let domRef = useFocusableRef(ref, divRef);
  
  let contextValue = useContext(SelectBoxContext);
  let {
    orientation = 'vertical',
    selectedKeys,
    isDisabled: groupDisabled = false,
    isCheckboxHidden: groupIsCheckboxHidden = false,
    isLabelHidden: groupIsLabelHidden = false,
    isIllustrationHidden: groupIsIllustrationHidden = false
  } = contextValue;

  let renderProps = useContext(SelectBoxRenderPropsContext);

  const size = 'M'; // Only medium size is supported
  const isDisabled = individualDisabled || groupDisabled;
  const isSelected = selectedKeys === 'all' || (selectedKeys && selectedKeys.has(value));
  
  const childrenArray = React.Children.toArray(children);
  const illustrationSlot = childrenArray.find((child: any) => child?.props?.slot === 'illustration');
  const textSlot = childrenArray.find((child: any) => child?.props?.slot === 'text');
  const descriptionSlot = childrenArray.find((child: any) => child?.props?.slot === 'description');
  const otherChildren = childrenArray.filter((child: any) => 
    !['illustration', 'text', 'description'].includes(child?.props?.slot)
  );

  const hasIcon = !!illustrationSlot;
  const hasDescription = !!descriptionSlot;
  
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
      
      {!(isCheckboxHidden || groupIsCheckboxHidden) && (isSelected || (!isDisabled && renderProps.isHovered)) && orientation === 'vertical' && (
        <div 
          className={style({
            position: 'absolute',
            top: 16,
            left: 16
          })}
          aria-hidden="true">
          <div
            className={box({
              isSelected: isSelected || false,
              isDisabled,
              isIndeterminate: false,
              isHovered: false,
              isFocused: false,
              isFocusVisible: false,
              isPressed: false,
              isReadOnly: false,
              isRequired: false,
              isInvalid: false,
              size: 'M',
              isEmphasized: false
            })}>
            {isSelected && (
              <Checkmark 
                size="S" 
                className={iconStyles} />
            )}
          </div>
        </div>
      )}
      
      {orientation === 'horizontal' ? (
        // Horizontal layout with all combinations
        <>
          {hasIcon && !(isIllustrationHidden || groupIsIllustrationHidden) && (
            <div className={iconContainer({size, orientation, isDisabled})}>
              <IllustrationContext.Provider value={{size: 'S'}}>
                {illustrationSlot}
              </IllustrationContext.Provider>
            </div>
          )}
          
          {(hasIcon && !(isIllustrationHidden || groupIsIllustrationHidden)) || hasDescription ? (
            // Standard horizontal layout with icon and/or description
            <div className={contentContainer({size, orientation}, props.styles)}>
              <div className={textContainer({size, orientation, isDisabled}, props.styles)}>
                {!(isLabelHidden || groupIsLabelHidden) && textSlot}
                
                {hasDescription && (
                  <div className={descriptionText({size, orientation, isDisabled})}>
                    {descriptionSlot}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Text-only horizontal layout
            !(isLabelHidden || groupIsLabelHidden) && (
              <div 
                className={style({
                  display: 'flex',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexGrow: 1,
                  textAlign: 'center',
                  paddingInline: 'edge-to-text'
                })}>
                <div className={textContainer({size, orientation, isDisabled}, props.styles)}>
                  {textSlot}
                </div>
              </div>
            )
          )}
        </>
      ) : (
        // Vertical layout with icon and/or description
        <>
          {hasIcon && !(isIllustrationHidden || groupIsIllustrationHidden) && (
            <div className={iconContainer({size, orientation, isDisabled})}>
              <IllustrationContext.Provider value={{size: 'S'}}>
                {illustrationSlot}
              </IllustrationContext.Provider>
            </div>
          )}
          
          {!(isLabelHidden || groupIsLabelHidden) && (
            <div className={textContainer({size, orientation, isDisabled})}>
              {textSlot}
            </div>
          )}
          
          {hasDescription && (
            <div 
              className={style({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                marginTop: 'text-to-visual'
              })}>
              <div className={descriptionText({size, orientation, isDisabled})}>
                {descriptionSlot}
              </div>
            </div>
          )}
        </>
      )}
      
      {otherChildren}
    </div>
  );
});

export {SelectBoxRenderPropsContext};
