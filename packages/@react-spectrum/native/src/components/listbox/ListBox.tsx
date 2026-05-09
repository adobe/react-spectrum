import React, {forwardRef, useCallback} from 'react';
import {ScrollView, type ScrollViewProps} from 'react-native';
import {useListState} from 'react-stately/useListState';
import type {Key, Node} from '@react-types/shared';
import type {ListProps} from 'react-stately/useListState';
import {Pressable, Text, View} from '../../primitives';
import {cn} from '../../styles/cn';

export type ListBoxSelectionMode = 'none' | 'single' | 'multiple';

export interface ListBoxProps<T extends object>
  extends Omit<ListProps<T>, 'onSelectionChange'> {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
  disabledKeys?: Iterable<Key>;
  label?: React.ReactNode;
  onSelectionChange?: (keys: Set<Key>) => void;
  renderItem?: (node: Node<T>) => React.ReactNode;
  scrollViewProps?: ScrollViewProps;
  selectionMode?: ListBoxSelectionMode;
  testID?: string;
}

export interface ListBoxItemProps {
  children?: React.ReactNode;
  className?: string;
  isDisabled?: boolean;
  isFocused?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
  testID?: string;
  textValue?: string;
}

export function ListBoxItem({
  children,
  className,
  isDisabled,
  isFocused,
  isSelected,
  onPress,
  testID,
  textValue
}: ListBoxItemProps) {
  return (
    <Pressable
      accessibilityLabel={textValue}
      accessibilityRole="menuitem"
      accessibilityState={{
        disabled: isDisabled || undefined,
        selected: isSelected || undefined
      }}
      className={cn(
        'flex-row items-center gap-300 px-300 py-250',
        isSelected && 'bg-accentSubtle',
        isFocused && 'bg-hover',
        isDisabled && 'opacity-disabled',
        className
      )}
      isDisabled={isDisabled}
      onPress={onPress}
      testID={testID}>
      {isSelected && (
        <Text className="text-200 font-bold text-accent">✓</Text>
      )}
      {typeof children === 'string' ? (
        <Text className="flex-1 text-200 text-text">{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

function defaultRenderItem<T extends object>(node: Node<T>) {
  return (
    <Text className="flex-1 text-200 text-text">
      {node.textValue || String(node.key)}
    </Text>
  );
}

export function ListBox<T extends object = object>(
  props: ListBoxProps<T>
) {
  let {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    className,
    disabledKeys: disabledKeysProp,
    label,
    onSelectionChange,
    renderItem,
    scrollViewProps,
    selectionMode = 'none',
    testID,
    ...listProps
  } = props;

  let state = useListState({
    ...listProps,
    selectionMode: selectionMode === 'none' ? undefined : selectionMode,
    onSelectionChange(keys) {
      let keySet = keys === 'all' ? new Set(Array.from(state.collection).map(n => n.key)) : keys;
      onSelectionChange?.(keySet);
    }
  });

  let handleItemPress = useCallback(
    (key: Key) => {
      if (selectionMode !== 'none') {
        state.selectionManager.toggleSelection(key);
      }
    },
    [selectionMode, state.selectionManager]
  );

  return (
    <View className={cn('flex-1', className)} testID={testID}>
      {label != null && (
        <Text className="mb-200 text-200 font-medium text-text">
          {label}
        </Text>
      )}
      <ScrollView
        accessibilityLabel={ariaLabel}
        accessibilityLabelledBy={ariaLabelledby}
        accessibilityRole="menu"
        {...scrollViewProps}>
        {Array.from(state.collection).map(node => {
          let isSelected = state.selectionManager.isSelected(node.key);
          let isDisabled =
            state.disabledKeys.has(node.key) ||
            (disabledKeysProp ? Array.from(disabledKeysProp).includes(node.key) : false);

          return (
            <ListBoxItem
              isDisabled={isDisabled}
              isSelected={isSelected}
              key={node.key}
              onPress={() => handleItemPress(node.key)}
              testID={`listbox-item-${String(node.key)}`}
              textValue={node.textValue}>
              {renderItem ? renderItem(node) : defaultRenderItem(node)}
            </ListBoxItem>
          );
        })}
      </ScrollView>
    </View>
  );
}
