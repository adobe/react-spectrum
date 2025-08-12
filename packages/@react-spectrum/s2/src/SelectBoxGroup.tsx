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
import {DOMRef, DOMRefValue, GlobalDOMAttributes, Orientation, Selection} from '@react-types/shared';
import {focusRing, style} from '../style' with {type: 'macro'};
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {IllustrationContext} from '../src/Icon';
import React, {createContext, forwardRef, ReactNode, useContext, useMemo} from 'react';
import {TextContext} from './Content';
import {useControlledState} from '@react-stately/utils';
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
   * The currently selected keys in the collection (controlled).
   */
  selectedKeys?: Selection,
  /**
   * The initial selected keys in the collection (uncontrolled).
   */
  defaultSelectedKeys?: Selection,
  /**
   * Number of columns to display the SelectBox elements in.
   * @default 2
   */
  numColumns?: number,
  /**
   * Gap between grid items.
   * @default 'default'
   */
  gutterWidth?: 'default' | 'compact' | 'spacious',
  /**
   * Whether the SelectBoxGroup is disabled.
   */
  isDisabled?: boolean,
  /**
   * Whether to show selection checkboxes for all SelectBoxes.
   * @default false
   */
  showCheckbox?: boolean
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
  isDisabled?: boolean,
  showCheckbox?: boolean,
  selectedKeys?: Selection,
  onSelectionChange?: (keys: Selection) => void
}

export const SelectBoxContext = createContext<SelectBoxContextValue>({orientation: 'vertical'});
export const SelectBoxGroupContext = createContext<ContextValue<Partial<SelectBoxGroupProps<any>>, DOMRefValue<HTMLDivElement>>>(null);

const labelOnly = ':has([slot=label]):not(:has([slot=description]))';
const noIllustration = ':not(:has([slot=illustration]))';
const selectBoxStyles = style({
  ...focusRing(),
  outlineOffset: {
    isFocusVisible: -2
  },
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
  transition: 'default',
  cursor: {
    default: 'pointer',
    isDisabled: 'default'
  }
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

const gridStyles = style({
  display: 'grid',
  outline: 'none',
  gridAutoRows: '1fr',
  gap: {
    gutterWidth: {
      default: 16,
      compact: 8,
      spacious: 24
    }
  }
}, getAllowedOverrides());

/**
 * SelectBox is a single selectable item in a SelectBoxGroup.
 */
export function SelectBox(props: SelectBoxProps): ReactNode {
  let {children, value, isDisabled: individualDisabled = false, UNSAFE_style} = props;
  
  let {
    orientation = 'vertical',
    isDisabled: groupDisabled = false,
    showCheckbox = false
  } = useContext(SelectBoxContext);

  const size = 'M';
  const isDisabled = individualDisabled || groupDisabled;

  return (
    <ListBoxItem
      id={value}
      isDisabled={isDisabled}
      textValue={value}
      className={renderProps => (props.UNSAFE_className || '') + selectBoxStyles({
        size, 
        orientation, 
        ...renderProps
      }, props.styles)}
      style={UNSAFE_style}>
      {(renderProps) => (
        <>
          {showCheckbox && (renderProps.isSelected || (!renderProps.isDisabled && renderProps.isHovered)) && (
            <div 
              className={style({
                position: 'absolute',
                top: 12,
                left: 12
              })}
              aria-hidden="true">
              <div
                className={box({
                  isSelected: renderProps.isSelected,
                  isDisabled: renderProps.isDisabled,
                  size: 'M'
                } as any)}>
                {renderProps.isSelected && (
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
                styles: illustrationContainer({size: 'S', orientation, isDisabled: renderProps.isDisabled})
              }],
              [TextContext, {
                slots: {
                  [DEFAULT_SLOT]: {
                    styles: labelText({orientation, isDisabled: renderProps.isDisabled})
                  },
                  label: {
                    styles: labelText({orientation, isDisabled: renderProps.isDisabled})
                  },
                  description: {
                    styles: descriptionText({orientation, isDisabled: renderProps.isDisabled})
                  }
                }
              }]
            ]}>
            {children}
          </Provider>
        </>
      )}
    </ListBoxItem>
  );
}

/**
 * SelectBoxGroup allows users to select one or more options from a list.
 */
export const SelectBoxGroup = /*#__PURE__*/ forwardRef(function SelectBoxGroup<T>(props: SelectBoxGroupProps<T>, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, SelectBoxGroupContext);

  let {
    children,
    onSelectionChange,
    selectedKeys: controlledSelectedKeys,
    defaultSelectedKeys,
    selectionMode = 'single',
    orientation = 'vertical',
    numColumns = 2,
    gutterWidth = 'default',
    isDisabled = false,
    showCheckbox = false,
    UNSAFE_className,
    UNSAFE_style
  } = props;

  const [selectedKeys, setSelectedKeys] = useControlledState(
    controlledSelectedKeys,
    defaultSelectedKeys || new Set(),
    onSelectionChange
  );

  const selectBoxContextValue = useMemo(
    () => {
      const contextValue = {
        allowMultiSelect: selectionMode === 'multiple',
        orientation,
        isDisabled,
        showCheckbox,
        selectedKeys,
        onSelectionChange: setSelectedKeys
      };
      
      return contextValue;
    },
    [selectionMode, orientation, isDisabled, showCheckbox, selectedKeys, setSelectedKeys]
  );

  return (
    <ListBox
      layout="grid"
      selectionMode={selectionMode}
      selectedKeys={selectedKeys}
      onSelectionChange={setSelectedKeys}
      className={(UNSAFE_className || '') + gridStyles({gutterWidth, orientation}, props.styles)}
      aria-label="SelectBoxGroup"
      aria-labelledby="SelectBoxGroup"
      style={{
        gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
        ...UNSAFE_style
      }}>
      <SelectBoxContext.Provider value={selectBoxContextValue}>
        {children}
      </SelectBoxContext.Provider>
    </ListBox>
  );
});
