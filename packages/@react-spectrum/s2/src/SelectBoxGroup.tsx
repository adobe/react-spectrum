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
  GridList,
  GridListItem,
  ContextValue,
  Text
} from 'react-aria-components';
import {DOMRef, DOMRefValue, HelpTextProps, Orientation, SpectrumLabelableProps, Key, Selection} from '@react-types/shared';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import React, {createContext, forwardRef, ReactElement, ReactNode, useMemo, useId, useEffect, useRef} from 'react';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';
import {useControlledState} from '@react-stately/utils';
import {SelectBoxRenderPropsContext} from './SelectBox';

export type SelectBoxValueType = string | string[];

export interface SelectBoxGroupProps extends StyleProps, SpectrumLabelableProps, HelpTextProps {
  /**
   * The SelectBox elements contained within the SelectBoxGroup.
   */
  children: ReactNode,
  /**
   * Handler that is called when the selection changes.
   */
  onSelectionChange: (val: SelectBoxValueType) => void,
  /**
   * The selection mode for the SelectBoxGroup.
   * @default 'single'
   */
  selectionMode?: 'single' | 'multiple',
  /**
   * The current selected value (controlled).
   */
  value?: SelectBoxValueType,
  /**
   * The default selected value.
   */
  defaultValue?: SelectBoxValueType,
  /**
   * The size of the SelectBoxGroup.
   * @default 'M'
   */
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL',
  /**
   * The axis the SelectBox elements should align with.
   * @default 'vertical'
   */
  orientation?: Orientation,
  /**
   * Whether the SelectBoxGroup should be displayed with an emphasized style.
   */
  isEmphasized?: boolean,
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
   * Whether the SelectBoxGroup is required.
   */
  isRequired?: boolean,
  /**
   * Whether the SelectBoxGroup is disabled.
   */
  isDisabled?: boolean,
  /**
   * The name of the form field.
   */
  name?: string,
  /**
   * The error message to display when validation fails.
   */
  errorMessage?: ReactNode,
  /**
   * Whether the SelectBoxGroup is in an invalid state.
   */
  isInvalid?: boolean
}

interface SelectBoxContextValue {
  allowMultiSelect?: boolean,
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL',
  orientation?: Orientation,
  isEmphasized?: boolean,
  isDisabled?: boolean,
  selectedKeys?: Selection,
  onSelectionChange?: (keys: Selection) => void
}

const convertValueToSelection = (value: SelectBoxValueType | undefined, selectionMode: 'single' | 'multiple'): Selection => {
  if (value === undefined) {
    return selectionMode === 'multiple' ? new Set() : new Set();
  }
  
  if (Array.isArray(value)) {
    return new Set(value);
  }
  
  return selectionMode === 'multiple' ? new Set([value]) : new Set([value]);
};

const convertSelectionToValue = (selection: Selection, selectionMode: 'single' | 'multiple'): SelectBoxValueType => {
  // Handle 'all' selection
  if (selection === 'all') {
    return selectionMode === 'multiple' ? [] : '';
  }
  
  const keys = Array.from(selection).map(key => String(key));
  
  if (selectionMode === 'multiple') {
    return keys;
  }
  
  return keys[0] || '';
};

export const SelectBoxContext = createContext<SelectBoxContextValue>({
  size: 'M',
  orientation: 'vertical'
});

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
  },
  // Override default GridList styles to work with our grid layout
  '&[role="grid"]': {
    display: 'grid'
  }
}, getAllowedOverrides());

const containerStyles = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8
}, getAllowedOverrides());

const errorMessageStyles = style({
  color: 'negative',
  font: 'ui-sm'
}, getAllowedOverrides());

interface FormIntegrationProps {
  name?: string,
  value: SelectBoxValueType,
  isRequired?: boolean,
  isInvalid?: boolean
}

// Hidden form inputs for form integration
function FormIntegration({name, value, isRequired, isInvalid}: FormIntegrationProps) {
  if (!name) return null;

  if (Array.isArray(value)) {
    return (
      <>
        {value.map((val, index) => (
          <input
            key={index}
            type="hidden"
            name={name}
            value={val}
            required={isRequired && index === 0}
            aria-invalid={isInvalid}
          />
        ))}
        {value.length === 0 && isRequired && (
          <input
            type="hidden"
            name={name}
            value=""
            required
            aria-invalid={isInvalid}
          />
        )}
      </>
    );
  }

  return (
    <input
      type="hidden"
      name={name}
      value={value || ''}
      required={isRequired}
      aria-invalid={isInvalid}
    />
  );
}

/**
 * SelectBox groups allow users to select one or more options from a list.
 * All possible options are exposed up front for users to compare.
 * Built with GridList for automatic grid-based keyboard navigation.
 */
export const SelectBoxGroup = /*#__PURE__*/ forwardRef(function SelectBoxGroup(props: SelectBoxGroupProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, SelectBoxGroupContext);
  
  let {
    label,
    children,
    onSelectionChange,
    defaultValue,
    selectionMode = 'single',
    size = 'M',
    orientation = 'vertical',
    isEmphasized,
    numColumns = 2,
    gutterWidth = 'default',
    isRequired = false,
    isDisabled = false,
    name,
    errorMessage,
    isInvalid = false,
    UNSAFE_style
  } = props;

  const domRef = useDOMRef(ref);
  const gridId = useId();
  const errorId = useId();

  // Convert between our API and GridList selection API
  const [selectedKeys, setSelectedKeys] = useControlledState(
    props.value !== undefined ? convertValueToSelection(props.value, selectionMode) : undefined,
    convertValueToSelection(defaultValue, selectionMode),
    (selection) => {
      const value = convertSelectionToValue(selection, selectionMode);

      onSelectionChange(value);
    }
  );



  // Handle validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    
    const selectionSize = selectedKeys === 'all' ? 1 : selectedKeys.size;
    if (isRequired && selectionSize === 0) {
      errors.push('Selection is required');
    }
    
    return errors;
  }, [isRequired, selectedKeys]);

  const hasValidationErrors = isInvalid || validationErrors.length > 0;

  // Extract SelectBox children and convert to GridListItems
  const childrenArray = React.Children.toArray(children).filter((x) => x);
  
  // Build disabled keys set for individual disabled items
  const disabledKeys = useMemo(() => {
    if (isDisabled) {
      return 'all'; // Entire group is disabled
    }
    
    const disabled = new Set<string>();
    childrenArray.forEach((child, index) => {
      if (React.isValidElement(child)) {
        const childElement = child as ReactElement<{value?: string, isDisabled?: boolean}>;
        const childValue = childElement.props?.value || String(index);
        if (childElement.props?.isDisabled) {
          disabled.add(childValue);
        }
      }
    });
    
    return disabled.size > 0 ? disabled : undefined;
  }, [isDisabled, childrenArray]);
  
  // Validate children count
  useEffect(() => {
    if (childrenArray.length <= 0) {
      console.error('Invalid content. SelectBox must have at least one item.');
    }
    if (childrenArray.length > 9) {
      console.error('Invalid content. SelectBox cannot have more than 9 children.');
    }
  }, [childrenArray.length]);

  // Context value for child SelectBox components
  const selectBoxContextValue = useMemo(
    () => {
      const contextValue = {
        allowMultiSelect: selectionMode === 'multiple',
        size,
        orientation,
        isEmphasized,
        isDisabled,
        selectedKeys,
        onSelectionChange: setSelectedKeys
      };
      return contextValue;
    },
    [selectionMode, size, orientation, isEmphasized, isDisabled, selectedKeys, setSelectedKeys]
  );

  const currentValue = convertSelectionToValue(selectedKeys, selectionMode);

  return (
    <div
      className={containerStyles(null, props.styles)}
      style={UNSAFE_style}
      ref={domRef}>
      
      {/* Form integration */}
      <FormIntegration
        name={name}
        value={currentValue}
        isRequired={isRequired}
        isInvalid={hasValidationErrors}
      />
      
      {/* Label */}
      {label && (
        <Text slot="label" id={`${gridId}-label`}>
          {label}
          {isRequired && <span aria-label="required"> *</span>}
        </Text>
      )}
      
      {/* Grid List with automatic grid navigation */}
      <GridList
        layout="grid"
        selectionMode={selectionMode}
        selectedKeys={selectedKeys}
        onSelectionChange={isDisabled ? () => {} : setSelectedKeys}
        disabledKeys={disabledKeys}
        aria-labelledby={label ? `${gridId}-label` : undefined}
        aria-describedby={hasValidationErrors && errorMessage ? errorId : undefined}
        aria-invalid={hasValidationErrors}
        aria-required={isRequired}
        className={gridStyles({gutterWidth, orientation}, props.styles)}
        style={{
          gridTemplateColumns: `repeat(${numColumns}, 1fr)`
        }}>
        
        {childrenArray.map((child, index) => {
          if (!React.isValidElement(child)) return null;
          
          const childElement = child as ReactElement<{value?: string}>;
          const childValue = childElement.props?.value || String(index);
          
          // Extract text content for accessibility
          const getTextValue = (element: ReactElement): string => {
            const elementProps = (element as any).props;
            const children = React.Children.toArray(elementProps.children) as ReactElement[];
            const textSlot = children.find((child: any) => 
              React.isValidElement(child) && (child as any).props?.slot === 'text'
            );
            
            if (React.isValidElement(textSlot)) {
              return String((textSlot as any).props.children || '');
            }
            
            // Fallback to any text content
            const textContent = children
              .filter((child: any) => typeof child === 'string')
              .join(' ');
            
            return textContent || childValue;
          };
          
          const textValue = getTextValue(childElement);
          
          // Convert SelectBox to GridListItem with render props
          return (
            <GridListItem key={childValue} id={childValue} textValue={textValue} className={style({outlineStyle: 'none'})}>
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
            </GridListItem>
          );
        })}
      </GridList>
      
      {/* Error message */}
      {hasValidationErrors && errorMessage && (
        <Text
          slot="errorMessage"
          id={errorId}
          className={errorMessageStyles(null, props.styles)}>
          {errorMessage}
        </Text>
      )}
    </div>
  );
});
