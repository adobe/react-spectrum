import React from 'react';
import {View as RNView} from 'react-native';
import {Pressable, Text, View} from '../../primitives';
import {cn} from '../../styles/cn';

// ---------------------------------------------------------------------------
// Tag
// ---------------------------------------------------------------------------

export interface TagProps {
  children?: React.ReactNode;
  onRemove?: () => void;
  isRemovable?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  onPress?: () => void;
  className?: string;
  testID?: string;
}

export function Tag({
  children,
  onRemove,
  isRemovable = false,
  isSelected = false,
  isDisabled = false,
  onPress,
  className,
  testID
}: TagProps) {
  return (
    <View
      className={cn(
        'flex-row items-center rounded-full border border-border px-300 py-100',
        isSelected && 'border-accent bg-accentSubtle',
        isDisabled && 'opacity-disabled',
        className
      )}
      testID={testID}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{disabled: isDisabled, selected: isSelected}}
        isDisabled={isDisabled}
        onPress={onPress}>
        {typeof children === 'string' ? (
          <Text
            className={cn(
              'text-200 text-text',
              isSelected && 'text-accent'
            )}>
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
      {isRemovable && onRemove ? (
        <Pressable
          accessibilityLabel="Remove"
          accessibilityRole="button"
          className="ml-100"
          isDisabled={isDisabled}
          onPress={onRemove}>
          <Text className="text-200 text-textMuted">{'×'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// TagGroup
// ---------------------------------------------------------------------------

export interface TagGroupProps {
  children?: React.ReactNode;
  label?: string;
  onRemove?: (key: string) => void;
  className?: string;
  testID?: string;
}

export function TagGroup({children, label, className, testID}: TagGroupProps) {
  return (
    <View className={cn('gap-100', className)} testID={testID}>
      {label ? (
        <Text className="text-100 font-medium text-text">{label}</Text>
      ) : null}
      <RNView
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8
        }}>
        {children}
      </RNView>
    </View>
  );
}
