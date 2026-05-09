import React, {useCallback, useState} from 'react';
import {TextInput as RNTextInput} from 'react-native';
import {Text, View} from '../../primitives';
import {cn} from '../../styles/cn';
import {ColorSwatch} from './ColorSwatch';

export interface ColorFieldProps {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  className?: string;
  testID?: string;
}

const UniwindTextInput = RNTextInput as any;

export function ColorField({
  defaultValue = '',
  value,
  onChange,
  label,
  isDisabled = false,
  isInvalid = false,
  className,
  testID
}: ColorFieldProps) {
  let isControlled = value !== undefined;
  let [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  let inputValue = isControlled ? (value as string) : uncontrolledValue;

  let handleChange = useCallback(
    (next: string) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  // Determine if inputValue is a valid CSS color for the swatch preview.
  // We accept #rrggbb, #rgb, and rgba(...) formats.
  let isValidColor =
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(inputValue) ||
    /^rgba?\(/.test(inputValue);
  let swatchColor = isValidColor ? inputValue : '#cccccc';

  return (
    <View className={cn('gap-100', className)} testID={testID}>
      {label ? (
        <Text className="text-100 font-medium text-text">{label}</Text>
      ) : null}
      <View
        className={cn(
          'flex-row items-center gap-200 rounded border border-border bg-surface px-300 py-200',
          isInvalid && 'border-negative',
          isDisabled && 'opacity-disabled'
        )}>
        <UniwindTextInput
          accessibilityLabel={label ?? 'Color value'}
          accessibilityRole="text"
          autoCapitalize="none"
          autoCorrect={false}
          className="flex-1 text-200 text-text"
          editable={!isDisabled}
          onChangeText={handleChange}
          placeholder="#000000"
          testID={testID ? `${testID}-input` : undefined}
          value={inputValue}
        />
        <ColorSwatch color={swatchColor} size="S" />
      </View>
    </View>
  );
}
