import React, {forwardRef, useCallback, useMemo, useState} from 'react';
import {TextInput as RNTextInput, type TextInputProps as RNTextInputProps} from 'react-native';
import {mapAccessibilityProps} from '../../accessibility';
import {Pressable, Text, View} from '../../primitives';
import {useProvider, useProviderProps} from '../../provider';
import {cn} from '../../styles/cn';
import {Field} from './Field';
import {textAreaInputVariants, textFieldInputVariants} from './styles';
import type {SearchFieldProps, TextAreaProps, TextFieldBaseProps, TextFieldProps} from './types';

const UniwindTextInput = RNTextInput as any;

function useInputValue(props: TextFieldBaseProps) {
  let {defaultValue, onChange, onChangeText, value} = props;
  let [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '');
  let isControlled = value !== undefined;
  let currentValue = isControlled ? value : uncontrolledValue;

  let setValue = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onChange?.(nextValue);
      onChangeText?.(nextValue);
    },
    [isControlled, onChange, onChangeText]
  );

  return {currentValue, setValue};
}

function getStringLabel(label: TextFieldBaseProps['label']) {
  return typeof label === 'string' ? label : undefined;
}

function TextInputField(
  rawProps: TextFieldBaseProps & {isSearch?: boolean; multiline?: boolean; onClear?: () => void},
  ref: React.ForwardedRef<React.ElementRef<typeof RNTextInput>>
) {
  let props = useProviderProps(rawProps);
  let {
    accessibilityHint,
    accessibilityLabel,
    'aria-describedby': ariaDescribedby,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    alignSelf,
    backgroundColor,
    borderColor,
    borderRadius,
    borderWidth,
    className,
    defaultValue,
    description,
    errorMessage,
    flex,
    flexGrow,
    flexShrink,
    height,
    inputClassName,
    inputStyle,
    isHidden,
    isDisabled,
    isInvalid,
    isReadOnly,
    isRequired,
    isSearch,
    isSelected,
    label,
    margin,
    marginBottom,
    marginEnd,
    marginStart,
    marginTop,
    marginX,
    marginY,
    maxHeight,
    maxWidth,
    minHeight,
    minWidth,
    multiline,
    necessityIndicator,
    onBlur,
    onChange,
    onChangeText,
    onClear,
    onFocus,
    overflow,
    padding,
    paddingBottom,
    paddingEnd,
    paddingStart,
    paddingTop,
    paddingX,
    paddingY,
    style,
    validationState,
    value,
    width,
    ...inputProps
  } = props;
  let provider = useProvider();
  let [isFocused, setFocused] = useState(false);
  let {currentValue, setValue} = useInputValue(props);
  let resolvedDisabled = !!(isDisabled || provider.isDisabled);
  let resolvedReadOnly = !!(isReadOnly || provider.isReadOnly);
  let resolvedRequired = !!(isRequired || provider.isRequired);
  let resolvedInvalid = !!(isInvalid || validationState === 'invalid');
  let editable = !(resolvedDisabled || resolvedReadOnly);
  let helpText = resolvedInvalid ? errorMessage : description;
  let inputAccessibilityLabel = accessibilityLabel ?? ariaLabel ?? getStringLabel(label);
  let inputAccessibilityHint =
    accessibilityHint ?? (typeof helpText === 'string' ? helpText : undefined);
  let placeholderTextColor = useMemo(
    () => provider.theme.colors.textMuted,
    [provider.theme.colors.textMuted]
  );
  let handleFocus = useCallback(
    (event: Parameters<NonNullable<TextFieldBaseProps['onFocus']>>[0]) => {
      setFocused(true);
      onFocus?.(event);
    },
    [onFocus]
  );
  let handleBlur = useCallback(
    (event: Parameters<NonNullable<TextFieldBaseProps['onBlur']>>[0]) => {
      setFocused(false);
      onBlur?.(event);
    },
    [onBlur]
  );
  let handleClear = useCallback(() => {
    setValue('');
    onClear?.();
  }, [onClear, setValue]);
  let inputClassNames = multiline
    ? textAreaInputVariants({
        isFocused,
        isInvalid: resolvedInvalid,
        isReadOnly: resolvedReadOnly
      })
    : textFieldInputVariants({
        isFocused,
        isInvalid: resolvedInvalid,
        isReadOnly: resolvedReadOnly
      });
  let input = (
    <UniwindTextInput
      {...inputProps}
      {...mapAccessibilityProps({
        accessibilityHint: inputAccessibilityHint,
        accessibilityLabel: inputAccessibilityLabel,
        'aria-describedby': ariaDescribedby,
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledby,
        isDisabled: resolvedDisabled,
        isInvalid: resolvedInvalid,
        isReadOnly: resolvedReadOnly,
        isRequired: resolvedRequired
      })}
      accessibilityRole="text"
      autoCapitalize={isSearch ? 'none' : inputProps.autoCapitalize}
      className={cn(inputClassNames, isSearch && 'pr-1000', inputClassName)}
      clearButtonMode={
        isSearch ? (inputProps.clearButtonMode ?? 'while-editing') : inputProps.clearButtonMode
      }
      editable={editable}
      multiline={multiline}
      onBlur={handleBlur}
      onChangeText={setValue}
      onFocus={handleFocus}
      placeholderTextColor={inputProps.placeholderTextColor ?? placeholderTextColor}
      ref={ref}
      returnKeyType={isSearch ? (inputProps.returnKeyType ?? 'search') : inputProps.returnKeyType}
      style={inputStyle}
      textContentType={
        isSearch ? (inputProps.textContentType ?? 'none') : inputProps.textContentType
      }
      value={currentValue}
    />
  );

  return (
    <Field
      {...{
        'aria-describedby': ariaDescribedby,
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledby
      }}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? ariaLabel}
      alignSelf={alignSelf}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      className={className}
      description={description}
      errorMessage={errorMessage}
      flex={flex}
      flexGrow={flexGrow}
      flexShrink={flexShrink}
      height={height}
      isHidden={isHidden}
      isDisabled={resolvedDisabled}
      isInvalid={resolvedInvalid}
      isReadOnly={resolvedReadOnly}
      isRequired={resolvedRequired}
      label={label}
      margin={margin}
      marginBottom={marginBottom}
      marginEnd={marginEnd}
      marginStart={marginStart}
      marginTop={marginTop}
      marginX={marginX}
      marginY={marginY}
      maxHeight={maxHeight}
      maxWidth={maxWidth}
      minHeight={minHeight}
      minWidth={minWidth}
      necessityIndicator={necessityIndicator}
      overflow={overflow}
      padding={padding}
      paddingBottom={paddingBottom}
      paddingEnd={paddingEnd}
      paddingStart={paddingStart}
      paddingTop={paddingTop}
      paddingX={paddingX}
      paddingY={paddingY}
      style={style}
      validationState={validationState}
      width={width}>
      {isSearch ? (
        <View className="relative">
          {input}
          {currentValue ? (
            <Pressable
              accessibilityLabel="Clear search"
              accessibilityRole="button"
              className="absolute bottom-0 right-200 top-0 min-h-1000 w-800 items-center justify-center"
              isDisabled={resolvedDisabled || resolvedReadOnly}
              onPress={handleClear}>
              <Text className="text-300 text-textMuted">x</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        input
      )}
    </Field>
  );
}

export const TextField = forwardRef<React.ElementRef<typeof RNTextInput>, TextFieldProps>(
  function TextField(props, ref) {
    return TextInputField(props, ref);
  }
);

export const TextArea = forwardRef<React.ElementRef<typeof RNTextInput>, TextAreaProps>(
  function TextArea(props, ref) {
    return TextInputField(
      {
        numberOfLines: props.numberOfLines ?? 4,
        textAlignVertical: props.textAlignVertical ?? 'top',
        ...props,
        multiline: true
      },
      ref
    );
  }
);

export const SearchField = forwardRef<React.ElementRef<typeof RNTextInput>, SearchFieldProps>(
  function SearchField(props, ref) {
    return TextInputField({...props, isSearch: true}, ref);
  }
);
