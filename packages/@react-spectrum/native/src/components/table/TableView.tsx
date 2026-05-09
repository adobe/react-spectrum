import React, {useCallback, useState} from 'react';
import {ScrollView} from 'react-native';
import type {Key} from '@react-types/shared';
import {Pressable, Text, View} from '../../primitives';
import {cn} from '../../styles/cn';

export type TableViewSelectionMode = 'none' | 'single' | 'multiple';
export type SortDirection = 'ascending' | 'descending';

export interface TableViewColumn {
  key: string;
  label: string;
  width?: number;
}

export interface TableViewSortDescriptor {
  column: string;
  direction: SortDirection;
}

export interface TableViewProps<T extends Record<string, unknown> = Record<string, unknown>> {
  'aria-label'?: string;
  className?: string;
  columns: TableViewColumn[];
  disabledKeys?: Iterable<Key>;
  items: T[];
  label?: React.ReactNode;
  onAction?: (key: Key) => void;
  onSelectionChange?: (keys: Set<Key>) => void;
  onSortChange?: (descriptor: TableViewSortDescriptor) => void;
  rowKey?: keyof T;
  selectedKeys?: Iterable<Key>;
  selectionMode?: TableViewSelectionMode;
  sortDescriptor?: TableViewSortDescriptor;
  testID?: string;
}

function resolveRowKey<T extends Record<string, unknown>>(
  item: T,
  index: number,
  rowKey?: keyof T
): Key {
  if (rowKey && rowKey in item) {
    return String(item[rowKey]);
  }
  if ('id' in item) {
    return String(item['id']);
  }
  if ('key' in item) {
    return String(item['key']);
  }
  return String(index);
}

export function TableView<T extends Record<string, unknown> = Record<string, unknown>>(
  props: TableViewProps<T>
) {
  let {
    'aria-label': ariaLabel,
    className,
    columns,
    disabledKeys: disabledKeysProp,
    items,
    label,
    onAction,
    onSelectionChange,
    onSortChange,
    rowKey,
    selectedKeys: selectedKeysProp,
    selectionMode = 'none',
    sortDescriptor: sortDescriptorProp,
    testID
  } = props;

  // Internal selection state (uncontrolled fallback)
  let [internalSelected, setInternalSelected] = useState<Set<Key>>(
    selectedKeysProp ? new Set(Array.from(selectedKeysProp) as Key[]) : new Set()
  );

  let selectedKeys =
    selectedKeysProp != null
      ? new Set(Array.from(selectedKeysProp) as Key[])
      : internalSelected;

  let disabledKeys = disabledKeysProp
    ? new Set(Array.from(disabledKeysProp) as Key[])
    : new Set<Key>();

  let [internalSort, setInternalSort] = useState<TableViewSortDescriptor | null>(null);
  let sortDescriptor = sortDescriptorProp ?? internalSort;

  let handleHeaderPress = useCallback(
    (columnKey: string) => {
      let direction: SortDirection =
        sortDescriptor?.column === columnKey &&
        sortDescriptor?.direction === 'ascending'
          ? 'descending'
          : 'ascending';
      let next: TableViewSortDescriptor = {column: columnKey, direction};
      setInternalSort(next);
      onSortChange?.(next);
    },
    [sortDescriptor, onSortChange]
  );

  let handleRowPress = useCallback(
    (key: Key) => {
      if (disabledKeys.has(key)) {
        return;
      }
      if (selectionMode !== 'none') {
        let next = new Set(selectedKeys);
        if (selectionMode === 'single') {
          if (next.has(key)) {
            next.delete(key);
          } else {
            next.clear();
            next.add(key);
          }
        } else {
          if (next.has(key)) {
            next.delete(key);
          } else {
            next.add(key);
          }
        }
        setInternalSelected(next);
        onSelectionChange?.(next);
      }
      onAction?.(key);
    },
    [selectionMode, selectedKeys, disabledKeys, onSelectionChange, onAction]
  );

  let showCheckbox = selectionMode !== 'none';

  return (
    <View className={cn('flex-1', className)} testID={testID}>
      {label != null && (
        <Text className="mb-200 text-200 font-medium text-text">{label}</Text>
      )}
      <ScrollView
        accessibilityLabel={ariaLabel}
        accessibilityRole="list"
        horizontal
        showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header row */}
          <View
            className="flex-row border-b-2 border-border bg-surface"
            testID={testID ? `${testID}-header` : undefined}>
            {showCheckbox && (
              <View className="w-10 items-center justify-center px-300 py-200" />
            )}
            {columns.map(col => {
              let isSorted = sortDescriptor?.column === col.key;
              let sortIcon =
                isSorted
                  ? sortDescriptor?.direction === 'ascending'
                    ? ' ▲'
                    : ' ▼'
                  : '';
              return (
                <Pressable
                  className={cn(
                    'flex-row items-center gap-200 px-300 py-200 min-h-[44px]',
                    isSorted && 'bg-accentSubtle'
                  )}
                  key={col.key}
                  onPress={() => handleHeaderPress(col.key)}
                  style={col.width ? {width: col.width} : {minWidth: 80}}
                  testID={testID ? `${testID}-col-${col.key}` : undefined}>
                  <Text className="text-200 font-medium text-text">
                    {col.label}
                    {sortIcon}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Data rows */}
          {items.map((item, index) => {
            let key = resolveRowKey(item, index, rowKey);
            let isSelected = selectedKeys.has(key);
            let isDisabled = disabledKeys.has(key);

            return (
              <Pressable
                accessibilityRole="none"
                accessibilityState={{
                  disabled: isDisabled || undefined,
                  selected: isSelected || undefined
                }}
                className={cn(
                  'flex-row border-b border-border',
                  isSelected && 'bg-accentSubtle',
                  isDisabled && 'opacity-disabled'
                )}
                isDisabled={isDisabled}
                key={key}
                onPress={() => handleRowPress(key)}
                testID={`tableview-row-${String(key)}`}>
                {showCheckbox && (
                  <View className="w-10 items-center justify-center px-300 py-200">
                    <View
                      className={cn(
                        'h-5 w-5 items-center justify-center rounded border border-border',
                        isSelected && 'border-accent bg-accentSubtle'
                      )}>
                      {isSelected && (
                        <Text className="text-200 font-bold text-accent">✓</Text>
                      )}
                    </View>
                  </View>
                )}
                {columns.map(col => (
                  <View
                    className="px-300 py-200 min-h-[44px] justify-center"
                    key={col.key}
                    style={col.width ? {width: col.width} : {minWidth: 80}}
                    testID={`tableview-cell-${String(key)}-${col.key}`}>
                    <Text className="text-200 text-text">
                      {item[col.key] != null ? String(item[col.key]) : ''}
                    </Text>
                  </View>
                ))}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
