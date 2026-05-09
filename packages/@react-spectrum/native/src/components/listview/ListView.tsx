import React, {useCallback} from 'react';
import {ScrollView} from 'react-native';
import {useListState} from 'react-stately/useListState';
import type {ListProps} from 'react-stately/useListState';
import type {Key, Node} from '@react-types/shared';
import {Pressable, Text, View} from '../../primitives';
import {cn} from '../../styles/cn';

export type ListViewSelectionMode = 'none' | 'single' | 'multiple';

export interface ListViewProps<T extends object>
  extends Omit<ListProps<T>, 'onSelectionChange'> {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
  disabledKeys?: Iterable<Key>;
  label?: React.ReactNode;
  onAction?: (key: Key) => void;
  onSelectionChange?: (keys: Set<Key>) => void;
  renderItem?: (node: Node<T>) => React.ReactNode;
  selectionMode?: ListViewSelectionMode;
  testID?: string;
}

export interface ListViewItemProps {
  children?: React.ReactNode;
  className?: string;
  isDisabled?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
  showCheckbox?: boolean;
  testID?: string;
  textValue?: string;
}

export function ListViewItem({
  children,
  className,
  isDisabled,
  isSelected,
  onPress,
  showCheckbox,
  testID,
  textValue
}: ListViewItemProps) {
  return (
    <Pressable
      accessibilityLabel={textValue}
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled || undefined,
        selected: isSelected || undefined
      }}
      className={cn(
        'flex-row items-center gap-300 px-300 min-h-[44px]',
        'border-b border-border',
        isSelected && 'bg-accentSubtle',
        isDisabled && 'opacity-disabled',
        className
      )}
      isDisabled={isDisabled}
      onPress={onPress}
      testID={testID}>
      {showCheckbox && (
        <View
          className={cn(
            'h-5 w-5 items-center justify-center rounded border border-border',
            isSelected && 'border-accent bg-accentSubtle'
          )}>
          {isSelected && (
            <Text className="text-200 font-bold text-accent">✓</Text>
          )}
        </View>
      )}
      <View className="flex-1 py-200">
        {typeof children === 'string' ? (
          <Text className="text-200 text-text">{children}</Text>
        ) : (
          children
        )}
      </View>
      <Text className="text-textMuted text-200">›</Text>
    </Pressable>
  );
}

function defaultRenderItem<T extends object>(node: Node<T>) {
  return (
    <Text className="text-200 text-text">
      {node.textValue || String(node.key)}
    </Text>
  );
}

export function ListView<T extends object = object>(props: ListViewProps<T>) {
  let {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    className,
    disabledKeys: disabledKeysProp,
    label,
    onAction,
    onSelectionChange,
    renderItem,
    selectionMode = 'none',
    testID,
    ...listProps
  } = props;

  let state = useListState({
    ...listProps,
    selectionMode: selectionMode === 'none' ? undefined : selectionMode,
    onSelectionChange(keys) {
      let keySet =
        keys === 'all'
          ? new Set(Array.from(state.collection).map(n => n.key))
          : keys;
      onSelectionChange?.(keySet);
    }
  });

  let handleItemPress = useCallback(
    (key: Key) => {
      if (selectionMode !== 'none') {
        state.selectionManager.toggleSelection(key);
      }
      onAction?.(key);
    },
    [selectionMode, state.selectionManager, onAction]
  );

  let showCheckbox = selectionMode !== 'none';

  return (
    <View className={cn('flex-1', className)} testID={testID}>
      {label != null && (
        <Text className="mb-200 text-200 font-medium text-text">{label}</Text>
      )}
      <ScrollView
        accessibilityLabel={ariaLabel}
        accessibilityLabelledBy={ariaLabelledby}
        accessibilityRole="list">
        {Array.from(state.collection).map(node => {
          let isSelected = state.selectionManager.isSelected(node.key);
          let isDisabled =
            state.disabledKeys.has(node.key) ||
            (disabledKeysProp
              ? Array.from(disabledKeysProp).includes(node.key)
              : false);

          return (
            <ListViewItem
              isDisabled={isDisabled}
              isSelected={isSelected}
              key={node.key}
              onPress={() => handleItemPress(node.key)}
              showCheckbox={showCheckbox}
              testID={`listview-item-${String(node.key)}`}
              textValue={node.textValue}>
              {renderItem ? renderItem(node) : defaultRenderItem(node)}
            </ListViewItem>
          );
        })}
      </ScrollView>
    </View>
  );
}
