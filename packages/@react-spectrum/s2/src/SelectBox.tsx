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
import {IllustrationContext} from '../src/Icon';
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

export const SelectBoxSpectrumContext = createContext<ContextValue<Partial<SelectBoxProps>, FocusableRefValue<HTMLDivElement>>>(null);

const selectBoxStyles = style({
  display: 'flex',
  flexDirection: {
    default: 'column',
    orientation: {
      horizontal: 'row'
    }
  },
  justifyContent: {
    default: 'center',
    orientation: {
      horizontal: 'start'
    }
  },
  alignItems: 'center',
  font: 'ui',
  flexShrink: 0,
  boxSizing: 'border-box',
  overflow: 'hidden',
  position: 'relative',
  // Sizing
  width: {
    default: 170,
    orientation: {
      horizontal: 368
    }
  },
  height: {
    default: 170,
    orientation: {
      horizontal: '100%'
    }
  },
  minWidth: {
    default: 144,
    orientation: {
      horizontal: 188
    }
  },
  maxWidth: {
    default: 170,
    orientation: {
      horizontal: 480
    }
  },
  minHeight: {
    default: 144,
    orientation: {
      horizontal: 80
    }
  },
  maxHeight: {
    default: 170,
    orientation: {
      horizontal: 240
    }
  },
  // Spacing
  padding: {
    default: 24,
    orientation: {
      horizontal: 16
    }
  },
  paddingStart: {
    orientation: {
      horizontal: 24
    }
  },
  paddingEnd: {
    orientation: {
      horizontal: 32
    }
  },
  gap: {
    default: 12,
    orientation: {
      horizontal: 0
    }
  },
  // Visual styling
  borderRadius: 'lg',
  backgroundColor: {
    default: 'layer-2',
    isDisabled: 'layer-1'
  },
  color: {
    isDisabled: 'disabled'
  },
  boxShadow: {
    default: 'emphasized',
    isHovered: 'elevated',
    isSelected: 'elevated',
    forcedColors: 'none',
    isDisabled: 'emphasized'
  },
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: {
    default: 'transparent',
    isSelected: 'gray-900',
    isFocusVisible: 'blue-900',
    isDisabled: 'transparent'
  },
  transition: 'default',
  cursor: {
    default: 'pointer',
    isDisabled: 'default'
  },
  outlineStyle: 'none'
}, getAllowedOverrides());

const contentContainer = style({
  display: 'flex',
  flexDirection: {
    default: 'column',
    orientation: {
      horizontal: 'row'
    }
  },
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: {
    default: 'center',
    orientation: {
      horizontal: 'start'
    }
  },
  gap: {
    default: 8,
    orientation: {
      horizontal: 12
    }
  },
  flex: {
    orientation: {
      horizontal: '1 0 0'
    }
  },
  width: '100%',
  minWidth: 0
}, getAllowedOverrides());

const illustrationContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  size: {
    S: 20,
    M: 24,
    L: 28,
    XL: 32
  },
  flexShrink: 0,
  marginEnd: {
    orientation: {
      horizontal: 12
    }
  },
  color: {
    isDisabled: 'disabled'
  },
  opacity: {
    isDisabled: 0.4
  }
});

const textContainer = style({
  display: 'flex',
  flexDirection: {
    orientation: {
      horizontal: 'column'
    }
  },
  justifyContent: 'center',
  alignItems: {
    default: 'center',
    orientation: {
      horizontal: 'start'
    }
  },
  gap: {
    default: 12,
    orientation: {
      horizontal: 2
    }
  },
  flex: {
    orientation: {
      horizontal: '1 0 0'
    }
  },
  width: '100%',
  minWidth: 0,
  overflow: {
    orientation: {
      horizontal: 'hidden'
    }
  },
  color: {
    default: 'neutral',
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
  alignSelf: {
    orientation: {
      horizontal: 'stretch'
    }
  },
  width: {
    orientation: {
      horizontal: '100%'
    }
  },
  minWidth: {
    orientation: {
      horizontal: 0
    }
  },
  overflow: {
    orientation: {
      horizontal: 'hidden'
    }
  },
  wordWrap: {
    orientation: {
      horizontal: 'break-word'
    }
  },
  font: 'ui',
  color: {
    default: 'neutral',
    isDisabled: 'disabled'
  }
});

const labelText = style({
  display: 'block',
  width: '100%',
  overflow: 'hidden',
  textAlign: {
    default: 'center',
    orientation: {
      horizontal: 'start'
    }
  },
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  alignSelf: {
    orientation: {
      horizontal: 'stretch'
    }
  },
  font: 'ui',
  fontWeight: {
    orientation: {
      horizontal: 'bold'
    }
  },
  color: {
    default: 'neutral',
    isDisabled: 'disabled'
  }
});


const SelectBoxRenderPropsContext = createContext<{
  isHovered?: boolean,
  isFocusVisible?: boolean,
  isPressed?: boolean
}>({});

/**
 * SelectBox components allow users to select options from a list.
 * Works as content within a ListBoxItem.
 */
export const SelectBox = /*#__PURE__*/ forwardRef(function SelectBox(props: SelectBoxProps, ref: FocusableRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, SelectBoxSpectrumContext);
  let {
    children, 
    value, 
    isDisabled: individualDisabled = false, 
    UNSAFE_style
  } = props;
  let divRef = useRef<HTMLDivElement | null>(null);
  let domRef = useFocusableRef(ref, divRef);
  
  let contextValue = useContext(SelectBoxContext);
  let {
    orientation = 'vertical',
    selectedKeys,
    isDisabled: groupDisabled = false,
    isCheckboxSelection = false
  } = contextValue;

  let renderProps = useContext(SelectBoxRenderPropsContext);

  const size = 'M';
  const isDisabled = individualDisabled || groupDisabled;
  const isSelected = selectedKeys === 'all' || (selectedKeys && selectedKeys.has(value));
  
  const childrenArray = React.Children.toArray(children);
  const illustrationSlot = childrenArray.find((child: any) => child?.props?.slot === 'illustration');
  const textSlot = childrenArray.find((child: any) => child?.props?.slot === 'text');
  const descriptionSlot = childrenArray.find((child: any) => child?.props?.slot === 'description');
  const otherChildren = childrenArray.filter((child: any) => 
    !['illustration', 'text', 'description'].includes(child?.props?.slot)
  );

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
      {isCheckboxSelection && (isSelected || (!isDisabled && renderProps.isHovered)) && (
        <div 
          className={style({
            position: 'absolute',
            top: 16,
            left: 16
          })}
          aria-hidden="true">
          <div
            className={box({
              isSelected,
              isDisabled,
              size: 'M'
            } as any)}>
            {isSelected && (
              <Checkmark 
                size="S" 
                className={iconStyles} />
            )}
          </div>
        </div>
      )}
      {!!illustrationSlot && (
        <div className={illustrationContainer({size: 'S', orientation, isDisabled})}>
          <IllustrationContext.Provider value={{size: 'S'}}>
            {illustrationSlot}
          </IllustrationContext.Provider>
        </div>
      )}
      
      <div className={contentContainer({size, orientation}, props.styles)}>
        <div className={textContainer({size, orientation, isDisabled}, props.styles)}>
          <div className={labelText({orientation, isDisabled})}>
            {textSlot}
          </div>
          
          {!!descriptionSlot && (
            <div 
              className={descriptionText({size, orientation, isDisabled})}>
              {descriptionSlot}
            </div>
          )}
        </div>
      </div>
      {otherChildren}
    </div>
  );
});

export {SelectBoxRenderPropsContext};
