import React, {forwardRef, useCallback, useRef} from 'react';
import {TextInput as RNTextInput} from 'react-native';
import {useComboBoxState} from 'react-stately/useComboBoxState';
import type {Key} from '@react-types/shared';
import type {CollectionBase} from '@react-types/shared';
import {Pressable, Text, View} from '../../primitives';
import {useProvider, useProviderProps} from '../../provider';
import {cn} from '../../styles/cn';
import {Tray} from '../tray/Tray';
import {ListBox} from '../listbox/ListBox';
import {Field} from '../textfield/Field';
import {textFieldInputVariants} from '../textfield/styles';
import type {NecessityIndicator, ValidationState} from '../textfield/types';

const UniwindTextInput = RNTextInput as any;

export interface ComboBoxProps<T extends object>
  extends Omit<CollectionBase<T>, 'children'> {
  'aria-label'?: string;
  children?: CollectionBase<T>['children'];
  className?: string;
  defaultInputValue?: string;
  defaultSelectedKey?: Key;
  description?: React.ReactNode;
  disabledKeys?: Iterable<Key>;
  errorMessage?: React.ReactNode;
  inputValue?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  items?: Iterable<T>;
  label?: React.ReactNode;
  necessityIndicator?: NecessityIndicator;
  onInputChange?: (value: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
  onSelectionChange?: (key: Key | null) => void;
  placeholder?: string;
  selectedKey?: Key | null;
  testID?: string;
  validationState?: ValidationState;
}

export const ComboBox = forwardRef<
  React.ElementRef<typeof RNTextInput>,
  ComboBoxProps<object>
>(function ComboBox(rawProps, ref) {
  let props = useProviderProps(rawProps);
  let {
    'aria-label': ariaLabel,
    children,
    className,
    defaultInputValue,
    defaultSelectedKey,
    description,
    disabledKeys,
    errorMessage,
    inputValue,
    isDisabled,
    isInvalid,
    isRequired,
    items,
    label,
    necessityIndicator,
    onInputChange,
    onOpenChange,
    onSelectionChange,
    placeholder = 'Search or select',
    selectedKey,
    testID,
    validationState
  } = props;

  let provider = useProvider();
  let resolvedDisabled = !!(isDisabled || provider.isDisabled);
  let resolvedInvalid = !!(isInvalid || validationState === 'invalid');

  let state = useComboBoxState({
    children: children as any,
    defaultInputValue,
    defaultSelectedKey,
    disabledKeys,
    inputValue,
    items: items as any,
    onInputChange,
    onOpenChange,
    onSelectionChange: onSelectionChange as any,
    selectedKey
  });

  let handleFocus = useCallback(() => {
    state.open();
  }, [state]);

  let handleTrayClose = useCallback(() => {
    state.close();
    onOpenChange?.(false);
  }, [onOpenChange, state]);

  return (
    <Field
      aria-label={ariaLabel}
      className={className}
      description={description}
      errorMessage={errorMessage}
      isDisabled={resolvedDisabled}
      isInvalid={resolvedInvalid}
      isRequired={isRequired}
      label={label}
      necessityIndicator={necessityIndicator}
      validationState={validationState}>
      <View
        className={cn(
          'flex-row items-center rounded-md border border-border bg-surface',
          resolvedInvalid && 'border-negative',
          resolvedDisabled && 'opacity-disabled'
        )}>
        <UniwindTextInput
          accessibilityLabel={ariaLabel ?? (typeof label === 'string' ? label : placeholder)}
          accessibilityRole="combobox"
          className={cn(textFieldInputVariants({isFocused: false, isInvalid: resolvedInvalid, isReadOnly: false}), 'flex-1 border-0')}
          editable={!resolvedDisabled}
          onChangeText={(text: string) => {
            state.setInputValue(text);
            onInputChange?.(text);
          }}
          onFocus={handleFocus}
          placeholder={placeholder}
          ref={ref}
          testID={testID}
          value={state.inputValue}
        />
        <Pressable
          accessibilityElementsHidden
          className="px-300 py-250"
          importantForAccessibility="no-hide-descendants"
          onPress={() => (state.isOpen ? state.close() : state.open())}>
          <Text className="text-200 text-textMuted">{state.isOpen ? '▴' : '▾'}</Text>
        </Pressable>
      </View>

      <Tray isOpen={state.isOpen} onOpenChange={handleTrayClose}>
        {label != null && (
          <Text className="mb-300 text-200 font-medium text-text">
            {typeof label === 'string' ? label : null}
          </Text>
        )}
        <ListBox
          aria-label={ariaLabel ?? (typeof label === 'string' ? label : 'Options')}
          disabledKeys={disabledKeys}
          items={state.collection as any}
          onSelectionChange={keys => {
            let key = Array.from(keys)[0];
            if (key != null) {
              let item = state.collection.getItem(key);
              state.setInputValue(item?.textValue ?? String(key));
              state.setSelectedKey(key);
              onSelectionChange?.(key);
            }
            state.close();
            onOpenChange?.(false);
          }}
          selectedKeys={state.selectedKey != null ? [state.selectedKey] : []}
          selectionMode="single">
          {children as any}
        </ListBox>
      </Tray>
    </Field>
  );
});
