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

import {
  ContextValue,
  ListBox,
  ListBoxItem
} from 'react-aria-components';
import {DOMRef, DOMRefValue, Orientation, Selection} from '@react-types/shared';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import React, {createContext, forwardRef, ReactElement, ReactNode, useEffect, useMemo} from 'react';
import {SelectBoxRenderPropsContext} from './SelectBox';
import {style} from '../style' with {type: 'macro'};
import {useControlledState} from '@react-stately/utils';
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface SelectBoxGroupProps extends StyleProps {
  /**
   * The SelectBox elements contained within the SelectBoxGroup.
   */
  children: ReactNode,
  /**
   * Handler that is called when the selection changes.
   */
  onSelectionChange?: (selection: Selection) => void,
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
   * The axis the SelectBox elements should align with.
   * @default 'vertical'
   */
  orientation?: Orientation,
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
  isCheckboxSelection?: boolean,
  /**
   * The name of the form field for form submission.
   */
  name?: string,
  /**
   * Defines a string value that labels the SelectBoxGroup.
   */
  'aria-label'?: string,
  /**
   * Identifies the element (or elements) that labels the SelectBoxGroup.
   */
  'aria-labelledby'?: string
}

interface SelectBoxContextValue {
  allowMultiSelect?: boolean,
  orientation?: Orientation,
  isDisabled?: boolean,
  isCheckboxSelection?: boolean,
  selectedKeys?: Selection,
  onSelectionChange?: (keys: Selection) => void
}

export const SelectBoxContext = createContext<SelectBoxContextValue>({orientation: 'vertical'});
export const SelectBoxGroupContext = createContext<ContextValue<Partial<SelectBoxGroupProps>, DOMRefValue<HTMLDivElement>>>(null);

const gridStyles = style({
  display: 'grid',
  gridAutoRows: '1fr',
  gap: {
    gutterWidth: {
      default: 16,
      compact: 8,
      spacious: 24
    }
  }
}, getAllowedOverrides());

const containerStyles = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8
}, getAllowedOverrides());

interface FormIntegrationProps {
  name?: string,
  selectedKeys: Selection,
  selectionMode: 'single' | 'multiple'
}

/**
 * SelectBox groups allow users to select one or more options from a list.
 * All possible options are exposed up front for users to compare.
 * Built with ListBox for automatic grid-based keyboard navigation.
 */
export const SelectBoxGroup = /*#__PURE__*/ forwardRef(function SelectBoxGroup(props: SelectBoxGroupProps, ref: DOMRef<HTMLDivElement>) {
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
    isCheckboxSelection = false,
    name,
    UNSAFE_style,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby
  } = props;

  const domRef = useDOMRef(ref);

  const [selectedKeys, setSelectedKeys] = useControlledState(
    controlledSelectedKeys,
    defaultSelectedKeys || new Set(),
    onSelectionChange
  );

  const childrenArray = React.Children.toArray(children).filter((x) => x);
  
  const disabledKeys = useMemo(() => {
    const disabled = new Set<string>();
    
    childrenArray.forEach((child, index) => {
      if (React.isValidElement(child)) {
        const childElement = child as ReactElement<{value?: string, isDisabled?: boolean}>;
        const childValue = childElement.props?.value || String(index);
        
        if (isDisabled || childElement.props?.isDisabled) {
          disabled.add(childValue);
        }
      }
    });
    
    return disabled.size > 0 ? disabled : undefined;
  }, [isDisabled, childrenArray]);
  
  useEffect(() => {
    if (childrenArray.length > 9) {
      console.error('Invalid content. SelectBoxGroup cannot have more than 9 children.');
    }
  }, [childrenArray.length]);

  const selectBoxContextValue = useMemo(
    () => {
      const contextValue = {
        allowMultiSelect: selectionMode === 'multiple',
        orientation,
        isDisabled,
        isCheckboxSelection,
        selectedKeys,
        onSelectionChange: setSelectedKeys
      };
      
      return contextValue;
    },
    [selectionMode, orientation, isDisabled, isCheckboxSelection, selectedKeys, setSelectedKeys]
  );

  return (
    <div
      className={containerStyles(null, props.styles)}
      style={UNSAFE_style}
      ref={domRef}>
      
      <FormIntegration
        name={name}
        selectedKeys={selectedKeys}
        selectionMode={selectionMode} />
      
      <ListBox
        layout="grid"
        selectionMode={selectionMode}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        disabledKeys={disabledKeys}
        aria-label={ariaLabel || 'Select options'}
        aria-labelledby={ariaLabelledby}
        className={gridStyles({gutterWidth, orientation}, props.styles)}
        style={{
          gridTemplateColumns: `repeat(${numColumns}, 1fr)`
        }}>
        
        {childrenArray.map((child, index) => {
          if (!React.isValidElement(child)) {return null;}
          
          const childElement = child as ReactElement<{value?: string}>;
          const childValue = childElement.props?.value || String(index);
          
          const getTextValue = (element: ReactElement): string => {
            const elementProps = (element as any).props;
            const children = React.Children.toArray(elementProps.children) as ReactElement[];
            const textSlot = children.find((child: any) => 
              React.isValidElement(child) && (child as any).props?.slot === 'text'
            );
            
            if (React.isValidElement(textSlot)) {
              return String((textSlot as any).props.children || '');
            }
            
            const textContent = children
              .filter((child: any) => typeof child === 'string')
              .join(' ');
            
            return textContent || childValue;
          };
          
          const textValue = getTextValue(childElement);
          
          return (
            <ListBoxItem key={childValue} id={childValue} textValue={textValue} aria-label={textValue}>
              {(renderProps) => (
                <SelectBoxContext.Provider value={selectBoxContextValue}>
                  <SelectBoxRenderPropsContext.Provider 
                    value={{
                      isHovered: renderProps.isHovered,
                      isFocusVisible: renderProps.isFocusVisible,
                      isPressed: renderProps.isPressed
                    }}>
                    {child}
                  </SelectBoxRenderPropsContext.Provider>
                </SelectBoxContext.Provider>
              )}
            </ListBoxItem>
          );
        })}
      </ListBox>
    </div>
  );
});

function FormIntegration({name, selectedKeys, selectionMode}: FormIntegrationProps) {
  if (!name) {
    return null;
  }

  const values = selectedKeys === 'all' ? [] : Array.from(selectedKeys).map(String);

  if (selectionMode === 'multiple') {
    return (
      <>
        {values.map((val, index) => (
          <input
            key={index}
            type="hidden"
            name={name}
            value={val} />
        ))}
        {values.length === 0 && (
          <input
            type="hidden"
            name={name}
            value="" />
        )}
      </>
    );
  }
  return (
    <input
      type="hidden"
      name={name}
      value={values[0] || ''} />
  );
}
