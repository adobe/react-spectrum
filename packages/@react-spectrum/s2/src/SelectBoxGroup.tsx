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
  ListBoxItem,
  Text
} from 'react-aria-components';
import {DOMRef, DOMRefValue, HelpTextProps, Orientation, Selection, SpectrumLabelableProps} from '@react-types/shared';
import {FieldLabel} from './Field';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import React, {createContext, forwardRef, ReactElement, ReactNode, useEffect, useMemo} from 'react';
import {SelectBoxRenderPropsContext} from './SelectBox';
import {style} from '../style' with {type: 'macro'};
import {useControlledState} from '@react-stately/utils';
import {useDOMRef} from '@react-spectrum/utils';
import {useId} from '@react-aria/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface SelectBoxGroupProps extends StyleProps, SpectrumLabelableProps, HelpTextProps {
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
   * Whether the SelectBoxGroup is required.
   */
  isRequired?: boolean,
  /**
   * Whether the SelectBoxGroup is disabled.
   */
  isDisabled?: boolean,
  /**
   * Whether to hide the selection checkbox for all SelectBoxes.
   */
  isCheckboxHidden?: boolean,
  /**
   * Whether to hide the label/text content for all SelectBoxes.
   */
  isLabelHidden?: boolean,
  /**
   * Whether to hide the illustration/icon for all SelectBoxes.
   */
  isIllustrationHidden?: boolean,
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
  isInvalid?: boolean,
  /**
   * Contextual help text for the SelectBoxGroup.
   */
  contextualHelp?: ReactNode
}

interface SelectBoxContextValue {
  allowMultiSelect?: boolean,
  orientation?: Orientation,
  isDisabled?: boolean,
  isCheckboxHidden?: boolean,
  isLabelHidden?: boolean,
  isIllustrationHidden?: boolean,
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

const errorMessageStyles = style({
  color: 'negative',
  font: 'ui-sm'
}, getAllowedOverrides());

interface FormIntegrationProps {
  name?: string,
  selectedKeys: Selection,
  selectionMode: 'single' | 'multiple',
  isRequired?: boolean,
  isInvalid?: boolean
}
/**
 * SelectBox groups allow users to select one or more options from a list.
 * All possible options are exposed up front for users to compare.
 * Built with ListBox for automatic grid-based keyboard navigation.
 */
export const SelectBoxGroup = /*#__PURE__*/ forwardRef(function SelectBoxGroup(props: SelectBoxGroupProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, SelectBoxGroupContext);
  
  let {
    label,
    contextualHelp,
    children,
    onSelectionChange,
    selectedKeys: controlledSelectedKeys,
    defaultSelectedKeys,
    selectionMode = 'single',
    orientation = 'vertical',
    numColumns = 2,
    gutterWidth = 'default',
    isRequired = false,
    isDisabled = false,
    isCheckboxHidden = false,
    isLabelHidden = false,
    isIllustrationHidden = false,
    name,
    errorMessage,
    isInvalid = false,
    UNSAFE_style
  } = props;

  const domRef = useDOMRef(ref);
  const gridId = useId();
  const errorId = useId();

  const [selectedKeys, setSelectedKeys] = useControlledState(
    controlledSelectedKeys,
    defaultSelectedKeys || new Set(),
    onSelectionChange
  );


  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    
    const selectionSize = selectedKeys === 'all' ? 1 : selectedKeys.size;
    if (isRequired && selectionSize === 0) {
      errors.push('Selection is required');
    }
    
    return errors;
  }, [isRequired, selectedKeys]);

  const hasValidationErrors = isInvalid || validationErrors.length > 0;
  const childrenArray = React.Children.toArray(children).filter((x) => x);
  
  const disabledKeys = useMemo(() => {
    if (isDisabled) {
      return 'all';
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
  
  useEffect(() => {
    if (childrenArray.length <= 0) {
      console.error('Invalid content. SelectBox must have at least one item.');
    }
    if (childrenArray.length > 9) {
      console.error('Invalid content. SelectBox cannot have more than 9 children.');
    }
  }, [childrenArray.length]);

  const selectBoxContextValue = useMemo(
    () => {
      const contextValue = {
        allowMultiSelect: selectionMode === 'multiple',
        orientation,
        isDisabled,
        isCheckboxHidden,
        isLabelHidden,
        isIllustrationHidden,
        selectedKeys,
        onSelectionChange: setSelectedKeys
      };
      return contextValue;
    },
    [selectionMode, orientation, isDisabled, isCheckboxHidden, isLabelHidden, isIllustrationHidden, selectedKeys, setSelectedKeys]
  );

  return (
    <div
      className={containerStyles(null, props.styles)}
      style={UNSAFE_style}
      ref={domRef}>
      
      <FormIntegration
        name={name}
        selectedKeys={selectedKeys}
        selectionMode={selectionMode}
        isRequired={isRequired}
        isInvalid={hasValidationErrors} />
      
      {label && (
        <FieldLabel
          id={gridId}
          isRequired={isRequired}
          contextualHelp={contextualHelp}>
          {label}
        </FieldLabel>
      )}
      
      <ListBox
        layout="grid"
        selectionMode={selectionMode}
        selectedKeys={selectedKeys}
        onSelectionChange={isDisabled ? () => {} : setSelectedKeys}
        disabledKeys={disabledKeys}
        aria-labelledby={label ? gridId : undefined}
        aria-describedby={hasValidationErrors && errorMessage ? errorId : undefined}
        aria-invalid={hasValidationErrors}
        aria-required={isRequired}
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
            <ListBoxItem key={childValue} id={childValue} textValue={textValue} aria-label={textValue} className={style({outlineStyle: 'none'})}>
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

function FormIntegration({name, selectedKeys, selectionMode, isRequired, isInvalid}: FormIntegrationProps) {
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
            value={val}
            required={isRequired && index === 0}
            aria-invalid={isInvalid} />
        ))}
        {values.length === 0 && isRequired && (
          <input
            type="hidden"
            name={name}
            value=""
            required
            aria-invalid={isInvalid} />
        )}
      </>
    );
  }

  return (
    <input
      type="hidden"
      name={name}
      value={values[0] || ''}
      required={isRequired}
      aria-invalid={isInvalid} />
  );
}
