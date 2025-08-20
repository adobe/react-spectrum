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
import {
  ContextValue,
  DEFAULT_SLOT,
  ListBox,
  ListBoxItem,
  ListBoxProps,
  Provider
} from 'react-aria-components';
import {DOMRef, DOMRefValue, GlobalDOMAttributes, Orientation} from '@react-types/shared';
import {focusRing, style} from '../style' with {type: 'macro'};
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {IllustrationContext} from '../src/Icon';
import {pressScale} from './pressScale';
import React, {createContext, forwardRef, ReactNode, useContext, useMemo, useRef} from 'react';
import {TextContext} from './Content';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface SelectBoxGroupProps<T> extends StyleProps, Omit<ListBoxProps<T>, keyof GlobalDOMAttributes | 'layout' | 'dragAndDropHooks' | 'renderEmptyState' | 'dependencies' | 'items' | 'children' | 'selectionMode'>{
  /**
   * The SelectBox elements contained within the SelectBoxGroup.
   */
  children: ReactNode,
  /**
   * The selection mode for the SelectBoxGroup.
   * @default 'single'
   */
  selectionMode?: 'single' | 'multiple',
  /**
   * Whether the SelectBoxGroup is disabled.
   */
  isDisabled?: boolean
}

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

interface SelectBoxContextValue {
  allowMultiSelect?: boolean,
  orientation?: Orientation,
  isDisabled?: boolean
}

export const SelectBoxContext = createContext<SelectBoxContextValue>({orientation: 'vertical'});
export const SelectBoxGroupContext = createContext<ContextValue<Partial<SelectBoxGroupProps<any>>, DOMRefValue<HTMLDivElement>>>(null);

const labelOnly = ':has([slot=label]):not(:has([slot=description]))';
const noIllustration = ':not(:has([slot=illustration]))';
const selectBoxStyles = style({
  ...focusRing(),
  display: 'grid',
  gridAutoRows: '1fr',
  position: 'relative',
  font: 'ui',
  boxSizing: 'border-box',
  overflow: 'hidden',
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
  padding: {
    default: 16,
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
  gridTemplateAreas: {
    orientation: {
      vertical: [
        'illustration',
        '.',
        'label'
      ],
      horizontal: {
        default: [
          'illustration . label',
          'illustration . description'
        ],
        [labelOnly]: [
          'illustration . label'
        ]
      }
    }
  },
  gridTemplateRows: {
    orientation: {
      vertical: ['min-content', 8, 'min-content'],
      horizontal: {
        default: ['min-content', 'min-content'],
        [noIllustration]: ['min-content']
      }
    }
  },
  gridTemplateColumns: {
    orientation: {
      horizontal: ['min-content', 12, '1fr']
    }
  },
  alignContent: {
    orientation: {
      vertical: 'center'
    }
  },
  borderRadius: 'lg',
  borderStyle: 'solid',
  borderColor: {
    default: 'transparent',
    isSelected: 'gray-900',
    isDisabled: 'transparent'
  },
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
  transition: 'default'
}, getAllowedOverrides());

const illustrationContainer = style({
  gridArea: 'illustration',
  alignSelf: 'center',
  justifySelf: 'center',
  minSize: 48,
  color: {
    isDisabled: 'disabled'
  },
  opacity: {
    isDisabled: 0.4
  }
});

const descriptionText = style({
  gridArea: 'description',
  alignSelf: 'center',
  display: {
    default: 'block',
    orientation: {
      vertical: 'none'
    }
  },
  overflow: 'hidden',
  textAlign: {
    default: 'center',
    orientation: {
      horizontal: 'start'
    }
  },
  color: {
    default: 'neutral',
    isDisabled: 'disabled'
  }
});

const labelText = style({
  gridArea: 'label',
  alignSelf: 'center',
  justifySelf: {
    default: 'center',
    orientation: {
      horizontal: 'start'
    }
  },
  width: '100%',
  overflow: 'hidden',
  minWidth: 0,
  textAlign: {
    default: 'center',
    orientation: {
      horizontal: 'start'
    }
  },
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
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

const gridStyles = style<{orientation?: Orientation}>({
  display: 'grid',
  gridAutoRows: '1fr',
  gap: 16,
  gridTemplateColumns: {
    orientation: {
      horizontal: 'repeat(auto-fit, minmax(368px, 1fr))',
      vertical: 'repeat(auto-fit, minmax(170px, 1fr))'
    }
  }
}, getAllowedOverrides());

/**
 * SelectBox is a single selectable item in a SelectBoxGroup.
 */
export function SelectBox(props: SelectBoxProps): ReactNode {
  let {children, value, isDisabled: individualDisabled = false, UNSAFE_style, UNSAFE_className, styles, ...otherProps} = props;
  
  let {
    orientation = 'vertical',
    isDisabled: groupDisabled = false
  } = useContext(SelectBoxContext);

  const isDisabled = individualDisabled || groupDisabled;
  const ref = useRef<HTMLDivElement>(null);

  return (
    <ListBoxItem
      id={value}
      textValue={value}
      isDisabled={isDisabled}
      ref={ref}
      className={renderProps => (UNSAFE_className || '') + selectBoxStyles({
        ...renderProps,
        orientation
      }, styles)}
      style={pressScale(ref, UNSAFE_style)}
      {...otherProps}>
      {({isSelected, isHovered, isDisabled}) => {
        return (
          <>
            {(isSelected || (!isDisabled && isHovered)) && (
            <div 
              className={style({
                position: 'absolute',
                top: 12,
                left: 12,
                pointerEvents: 'none'
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
            <Provider
              values={[
                [IllustrationContext, {
                  size: 'S',
                  styles: illustrationContainer({size: 'S', orientation, isDisabled})
                }],
                [TextContext, {
                  slots: {
                    [DEFAULT_SLOT]: {
                      styles: labelText({orientation, isDisabled})
                    },
                    label: {
                      styles: labelText({orientation, isDisabled})
                    },
                    description: {
                      styles: descriptionText({orientation, isDisabled})
                    }
                  }
                }]
              ]}>
              {children}
            </Provider>
          </>
        );
      }}
    </ListBoxItem>
  );
}

/*
 * SelectBoxGroup allows users to select one or more options from a list.
 */
export const SelectBoxGroup = /*#__PURE__*/ forwardRef(function SelectBoxGroup<T>(props: SelectBoxGroupProps<T>, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, SelectBoxGroupContext);

  let {
    children,
    selectionMode = 'single',
    orientation = 'vertical',
    isDisabled = false,
    UNSAFE_className,
    UNSAFE_style,
    ...otherProps
  } = props;

  const selectBoxContextValue = useMemo(
    () => {
      const contextValue = {
        orientation,
        isDisabled
      };
      return contextValue;
    },
    [orientation, isDisabled]
  );

  return (
    <ListBox
      selectionMode={selectionMode}
      {...otherProps}
      layout="grid"
      className={(UNSAFE_className || '') + gridStyles({orientation})}
      style={UNSAFE_style}>
      <SelectBoxContext.Provider value={selectBoxContextValue}>
        {children}
      </SelectBoxContext.Provider>
    </ListBox>
  );
});
