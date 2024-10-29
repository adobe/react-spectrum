/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2024 Adobe
 * All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 **************************************************************************/

import {CheckboxGroup, Label, Provider, RadioGroup} from 'react-aria-components';
import {IconContext, TextContext} from '@react-spectrum/s2';
import React, {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import {style}  from '../style' with {type: 'macro'};

/**
 * Ensures the return value is a string.
 * @param { string | string[] | undefined } value Possible options for selection.
 * @returns { string }
 */
function unwrapValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

/**
 * Ensures the return value is an array or undefined.
 * @param {string | string[] | undefined} value Possible options for selection.
 * @returns { [] | undefined }
 */
function ensureArray(value: string | string[]): string[] {
  if (Array.isArray(value)) {
    return value;
  }
  return value ? [value] : [];
}

export {unwrapValue, ensureArray};

export type SelectBoxValueType = string | string[];
export interface SelectBoxGroupProps {
  children?: ReactNode,
  defaultValue?: SelectBoxValueType,
  label?: ReactNode,
  isDisabled?: boolean,
  isRequired?: boolean,
  onSelectionChange: (val: SelectBoxValueType) => void,
  orientation?: 'horizontal' | 'vertical',
  selectionMode?: 'single' | 'multiple',
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL',
  value?: SelectBoxValueType
}

export interface SelectorGroupProps {
  children: ReactNode,
  className: string,
  defaultValue?: SelectBoxValueType,
  isDisabled?: boolean,
  isRequired?: boolean,
  onChange: (val: SelectBoxValueType) => void,
  selectionMode: 'single' | 'multiple',
  value?: SelectBoxValueType
}
export interface SelectBoxProps {
  value: string,
  children?: ReactNode,
  isDisabled?: boolean
}

interface SelectBoxGroupContext {
  orientation?: 'horizontal' | 'vertical',
  selectedValue?: SelectBoxValueType,
  selectionMode?: 'single' | 'multiple',
  validationState?: 'valid' | 'invalid',
  value?: SelectBoxValueType,
  size: 'XS' | 'S' | 'M' | 'L' | 'XL'
}

export const SelectBoxContext = React.createContext<SelectBoxGroupContext>({
  value: undefined,
  size: 'M',
  orientation: 'vertical'
});

export function useSelectBoxGroupProvider() {
  return useContext(SelectBoxContext);
}

const SelectorGroup = forwardRef(function SelectorGroupComponent(
  {
    children,
    className,
    defaultValue,
    isDisabled,
    isRequired,
    onChange,
    selectionMode,
    value
  }: SelectorGroupProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const props = {
    isRequired,
    isDisabled,
    className,
    children,
    onChange,
    ref
  };

  return selectionMode === 'single' ? (
    <RadioGroup {...props} value={unwrapValue(value)} defaultValue={unwrapValue(defaultValue)} />
  ) : (
    <CheckboxGroup {...props} value={ensureArray(value)} defaultValue={ensureArray(defaultValue)} />
  );
});

function SelectBoxGroup(
  props: SelectBoxGroupProps,
  ref: ForwardedRef<HTMLDivElement>
): React.ReactElement {
  const {
    children,
    defaultValue,
    isDisabled = false,
    isRequired = false,
    label,
    onSelectionChange,
    orientation = 'vertical',
    selectionMode = 'multiple',
    size = 'M',
    value: valueProp
  } = props;

  const [value, setValue] = useState<string | string[] | undefined>(defaultValue || valueProp);

  useEffect(() => {
    if (value !== undefined) {
      onSelectionChange(value);
    }
  }, [onSelectionChange, value]);

  const selectBoxContextValue = useMemo(
    () => ({
      orientation,
      selectionMode,
      selectedValue: value,
      size: size,
      value
    }),
    [orientation, selectionMode, size, value]
  );

  // When one box grows, the rest should grow, too.
  // setting autoRows to 1fr so that different rows split the space evenly
  return (
    <SelectorGroup
      className=""
      defaultValue={ensureArray(defaultValue)}
      onChange={setValue}
      isRequired={isRequired}
      isDisabled={isDisabled}
      ref={ref}
      selectionMode={selectionMode}
      value={ensureArray(value)}>
      <Provider
        values={[
          [IconContext, {}],
          [
            TextContext,
            {
              slots: {
                description: {},
                label: {}
              }
            }
          ]
        ]}>
        <span>
          <Label slot="label">{label}</Label>
        </span>
        <div
          className={style({
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(3, auto)',
            justifyContent: 'start'
          })}>
          <SelectBoxContext.Provider value={selectBoxContextValue}>
            {children}
          </SelectBoxContext.Provider>
        </div>
      </Provider>
    </SelectorGroup>
  );
}

const _SelectBoxGroup = forwardRef(SelectBoxGroup);
export {_SelectBoxGroup as SelectBoxGroup};
