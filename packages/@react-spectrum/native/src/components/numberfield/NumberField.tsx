import React, {forwardRef, useCallback} from 'react';
import {TextInput as RNTextInput} from 'react-native';
import {useNumberFieldState} from 'react-stately/useNumberFieldState';
import type {NumberFieldProps} from 'react-stately/useNumberFieldState';
import {Pressable, Text, View} from '../../primitives';
import {useProvider, useProviderProps} from '../../provider';
import {cn} from '../../styles/cn';
import {Field} from '../textfield/Field';
import {textFieldInputVariants} from '../textfield/styles';
import type {NecessityIndicator, ValidationState} from '../textfield/types';

const UniwindTextInput = RNTextInput as any;

export interface NativeNumberFieldProps
  extends Omit<NumberFieldProps, 'locale'> {
  'aria-label'?: string;
  className?: string;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  label?: React.ReactNode;
  locale?: string;
  necessityIndicator?: NecessityIndicator;
  testID?: string;
  validationState?: ValidationState;
}

export const NumberField = forwardRef<
  React.ElementRef<typeof RNTextInput>,
  NativeNumberFieldProps
>(function NumberField(rawProps, ref) {
  let props = useProviderProps(rawProps);
  let {
    'aria-label': ariaLabel,
    className,
    description,
    errorMessage,
    isDisabled,
    isInvalid,
    isRequired,
    label,
    locale,
    necessityIndicator,
    testID,
    validationState,
    ...stateProps
  } = props;

  let provider = useProvider();
  let resolvedLocale = locale ?? provider.locale ?? 'en-US';
  let resolvedDisabled = !!(isDisabled || provider.isDisabled);
  let resolvedInvalid = !!(isInvalid || validationState === 'invalid');

  let state = useNumberFieldState({
    ...stateProps,
    isDisabled: resolvedDisabled,
    locale: resolvedLocale
  });

  let handleCommit = useCallback(() => {
    state.commit();
  }, [state]);

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
        <Pressable
          accessibilityLabel="Decrease"
          accessibilityRole="button"
          className="min-h-[44px] min-w-[44px] items-center justify-center px-300"
          isDisabled={resolvedDisabled}
          onPress={() => state.decrement()}
          testID={testID ? `${testID}-decrement` : undefined}>
          <Text className="text-300 font-medium text-textMuted">−</Text>
        </Pressable>

        <UniwindTextInput
          accessibilityLabel={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
          accessibilityRole="text"
          className={cn(
            textFieldInputVariants({
              isFocused: false,
              isInvalid: resolvedInvalid,
              isReadOnly: false
            }),
            'flex-1 border-0 text-center'
          )}
          editable={!resolvedDisabled}
          keyboardType="numeric"
          onBlur={handleCommit}
          onChangeText={(text: string) => state.setInputValue(text)}
          ref={ref}
          testID={testID}
          value={state.inputValue}
        />

        <Pressable
          accessibilityLabel="Increase"
          accessibilityRole="button"
          className="min-h-[44px] min-w-[44px] items-center justify-center px-300"
          isDisabled={resolvedDisabled}
          onPress={() => state.increment()}
          testID={testID ? `${testID}-increment` : undefined}>
          <Text className="text-300 font-medium text-textMuted">+</Text>
        </Pressable>
      </View>
    </Field>
  );
});
