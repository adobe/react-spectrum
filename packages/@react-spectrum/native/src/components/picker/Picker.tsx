import React, {forwardRef, useCallback} from 'react';
import {Pressable as RNPressable} from 'react-native';
import {useSelectState} from 'react-stately/useSelectState';
import type {Key} from '@react-types/shared';
import type {CollectionBase} from '@react-types/shared';
import {Pressable, Text, View} from '../../primitives';
import {useProvider, useProviderProps} from '../../provider';
import {cn} from '../../styles/cn';
import {Tray} from '../tray/Tray';
import {ListBox} from '../listbox/ListBox';
import {Field} from '../textfield/Field';
import type {NecessityIndicator, ValidationState} from '../textfield/types';

export interface PickerProps<T extends object> extends CollectionBase<T> {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
  defaultSelectedKey?: Key;
  description?: React.ReactNode;
  disabledKeys?: Iterable<Key>;
  errorMessage?: React.ReactNode;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  label?: React.ReactNode;
  necessityIndicator?: NecessityIndicator;
  onOpenChange?: (isOpen: boolean) => void;
  onSelectionChange?: (key: Key) => void;
  placeholder?: string;
  selectedKey?: Key | null;
  testID?: string;
  validationState?: ValidationState;
}

export const Picker = forwardRef<
  React.ElementRef<typeof RNPressable>,
  PickerProps<object>
>(function Picker(rawProps, ref) {
  let props = useProviderProps(rawProps);
  let {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    className,
    description,
    disabledKeys,
    errorMessage,
    isDisabled,
    isInvalid,
    isRequired,
    label,
    necessityIndicator,
    onOpenChange,
    onSelectionChange,
    placeholder = 'Select an option',
    testID,
    validationState,
    ...collectionProps
  } = props;

  let provider = useProvider();
  let resolvedDisabled = !!(isDisabled || provider.isDisabled);
  let resolvedInvalid = !!(isInvalid || validationState === 'invalid');

  let state = useSelectState({
    ...collectionProps,
    onSelectionChange(key) {
      if (key != null) {
        onSelectionChange?.(key);
      }
      state.close();
    }
  });

  let handleOpen = useCallback(() => {
    if (!resolvedDisabled) {
      state.open();
      onOpenChange?.(true);
    }
  }, [onOpenChange, resolvedDisabled, state]);

  let handleTrayClose = useCallback(() => {
    state.close();
    onOpenChange?.(false);
  }, [onOpenChange, state]);

  let selectedItem = state.selectedKey != null
    ? state.collection.getItem(state.selectedKey)
    : null;

  let displayValue = selectedItem?.textValue ?? String(selectedItem?.key ?? '');

  return (
    <Field
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={className}
      description={description}
      errorMessage={errorMessage}
      isDisabled={resolvedDisabled}
      isInvalid={resolvedInvalid}
      isRequired={isRequired}
      label={label}
      necessityIndicator={necessityIndicator}
      validationState={validationState}>
      <Pressable
        accessibilityLabel={ariaLabel ?? (typeof label === 'string' ? label : placeholder)}
        accessibilityRole="combobox"
        accessibilityState={{
          disabled: resolvedDisabled || undefined,
          expanded: state.isOpen || undefined
        }}
        className={cn(
          'flex-row items-center justify-between rounded-md border border-border',
          'bg-surface px-300 py-250 min-h-[44px]',
          resolvedInvalid && 'border-negative',
          resolvedDisabled && 'opacity-disabled'
        )}
        isDisabled={resolvedDisabled}
        onPress={handleOpen}
        ref={ref}
        testID={testID}>
        <Text
          className={cn(
            'flex-1 text-200',
            selectedItem ? 'text-text' : 'text-textMuted'
          )}>
          {selectedItem ? displayValue : placeholder}
        </Text>
        <Text className="text-200 text-textMuted">▾</Text>
      </Pressable>

      <Tray isOpen={state.isOpen} onOpenChange={handleTrayClose}>
        {label != null && (
          <Text className="mb-300 text-200 font-medium text-text">
            {typeof label === 'string' ? label : null}
          </Text>
        )}
        <ListBox
          {...collectionProps}
          aria-label={ariaLabel ?? (typeof label === 'string' ? label : 'Options')}
          disabledKeys={disabledKeys}
          onSelectionChange={keys => {
            let key = Array.from(keys)[0];
            if (key != null) {
              onSelectionChange?.(key);
            }
            state.close();
            onOpenChange?.(false);
          }}
          selectedKeys={state.selectedKey != null ? [state.selectedKey] : []}
          selectionMode="single"
        />
      </Tray>
    </Field>
  );
});
