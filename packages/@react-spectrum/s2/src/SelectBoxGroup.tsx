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
  CheckboxGroup as AriaCheckboxGroup,
  RadioGroup as AriaRadioGroup,
  ContextValue
} from 'react-aria-components';
import {DOMRef, DOMRefValue, HelpTextProps, Orientation, SpectrumLabelableProps} from '@react-types/shared';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import React, {createContext, forwardRef, ReactElement, ReactNode, useMemo, useState} from 'react';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

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
  value: SelectBoxValueType,
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
  isDisabled?: boolean
}

interface SelectBoxContextValue {
  allowMultiSelect?: boolean,
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL',
  orientation?: Orientation,
  isEmphasized?: boolean
}

const unwrapValue = (value: SelectBoxValueType | undefined): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const ensureArray = (value: SelectBoxValueType | undefined): string[] => {
  if (value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
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
  }
}, getAllowedOverrides());


interface SelectorGroupProps {
  allowMultiSelect: boolean,
  children: ReactNode,
  UNSAFE_className?: string,
  UNSAFE_style?: React.CSSProperties,
  styles?: StyleProps,
  onChange: (value: SelectBoxValueType) => void,
  value?: SelectBoxValueType,
  defaultValue?: SelectBoxValueType,
  isRequired?: boolean,
  isDisabled?: boolean,
  label?: ReactNode
}

/**
 * SelectBox groups allow users to select one or more options from a list.
 * All possible options are exposed up front for users to compare.
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
    UNSAFE_style
  } = props;

  const allowMultiSelect = selectionMode === 'multiple';
  
  const domRef = useDOMRef(ref);

  const getChildrenToRender = () => {
    const childrenToRender = React.Children.toArray(children).filter((x) => x);
    try {
      const childrenLength = childrenToRender.length;
      if (childrenLength <= 0) {
        throw new Error('Invalid content. SelectBox must have at least a title.');
      }
      if (childrenLength > 9) {
        throw new Error('Invalid content. SelectBox cannot have more than 9 children.');
      }
    } catch (e) {
      console.error(e);
    }
    return childrenToRender;
  };

  // Context value
  const selectBoxContextValue = useMemo(
    () => ({
      allowMultiSelect,
      size,
      orientation,
      isEmphasized
    }),
    [allowMultiSelect, size, orientation, isEmphasized]
  );

  return (
    <SelectorGroup
      allowMultiSelect={allowMultiSelect}
      value={props.value}
      defaultValue={defaultValue}
      onChange={onSelectionChange}
      isRequired={isRequired}
      isDisabled={isDisabled}
      label={label}
      ref={domRef}
      UNSAFE_style={UNSAFE_style}>
      <div
        className={gridStyles({gutterWidth, orientation}, props.styles)}
        style={{
          gridTemplateColumns: `repeat(${numColumns}, 1fr)`
        }}>
        <SelectBoxContext.Provider value={selectBoxContextValue}>
          {getChildrenToRender().map((child) => {
            return child as ReactElement;
          })}
        </SelectBoxContext.Provider>
      </div>
    </SelectorGroup>
  );
});

const SelectorGroup = forwardRef<HTMLDivElement, SelectorGroupProps>(function SelectorGroupComponent({
  allowMultiSelect,
  children,
  UNSAFE_className,
  onChange,
  value,
  defaultValue,
  UNSAFE_style,
  isRequired,
  isDisabled,
  label
}, ref) {
  const baseProps = { 
    isRequired,
    isDisabled,
    UNSAFE_className,
    UNSAFE_style,
    children,
    onChange,
    ref
  };

  return allowMultiSelect ? (
    <AriaCheckboxGroup
      {...baseProps}
      value={value ? ensureArray(value) : undefined}
      defaultValue={defaultValue ? ensureArray(defaultValue) : undefined}
      aria-label={label ? String(label) : undefined} />
  ) : (
    <AriaRadioGroup
      {...baseProps}
      value={value ? unwrapValue(value) : undefined}
      defaultValue={defaultValue ? unwrapValue(defaultValue) : undefined}
      aria-label={label ? String(label) : undefined} />
  );
});