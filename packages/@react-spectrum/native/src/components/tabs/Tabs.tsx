import React from 'react';
import {ScrollView} from 'react-native';
import {useTabListState} from 'react-stately/useTabListState';
import type {TabListProps} from 'react-stately/useTabListState';
import type {Key} from '@react-types/shared';
import type {CollectionBase} from '@react-types/shared';
import {Pressable, Text, View} from '../../primitives';
import {cn} from '../../styles/cn';

export type TabsOrientation = 'horizontal' | 'vertical';

export interface TabsProps<T extends object>
  extends Omit<CollectionBase<T>, 'children'>,
    Omit<TabListProps<T>, 'children'> {
  'aria-label'?: string;
  children?: CollectionBase<T>['children'];
  className?: string;
  defaultSelectedKey?: Key;
  disabledKeys?: Iterable<Key>;
  isDisabled?: boolean;
  onSelectionChange?: (key: Key) => void;
  orientation?: TabsOrientation;
  panelClassName?: string;
  selectedKey?: Key;
  testID?: string;
}

export function Tabs<T extends object = object>(props: TabsProps<T>) {
  let {
    'aria-label': ariaLabel,
    className,
    orientation = 'horizontal',
    panelClassName,
    testID,
    ...stateProps
  } = props;

  let state = useTabListState(stateProps as any);
  let selectedItem = state.selectedItem;

  let isVertical = orientation === 'vertical';

  return (
    <View
      className={cn(isVertical ? 'flex-row' : 'flex-col', className)}
      testID={testID}>
      <ScrollView
        accessibilityLabel={ariaLabel}
        accessibilityRole={'tablist' as never}
        horizontal={!isVertical}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        <View className={cn(isVertical ? 'flex-col border-r border-border' : 'flex-row border-b border-border')}>
          {Array.from(state.collection).map(item => {
            let isSelected = state.selectedKey === item.key;
            let isDisabled = state.disabledKeys.has(item.key);

            return (
              <Pressable
                accessibilityRole={'tab' as never}
                accessibilityState={{
                  disabled: isDisabled || undefined,
                  selected: isSelected || undefined
                }}
                className={cn(
                  'min-h-[44px] items-center justify-center px-400 py-250',
                  isSelected
                    ? isVertical
                      ? 'border-r-2 border-accent bg-accentSubtle'
                      : 'border-b-2 border-accent'
                    : 'border-transparent',
                  isDisabled && 'opacity-disabled'
                )}
                isDisabled={isDisabled}
                key={item.key}
                onPress={() => state.setSelectedKey(item.key)}
                testID={`tab-${String(item.key)}`}>
                <Text
                  className={cn(
                    'text-200',
                    isSelected ? 'font-medium text-accent' : 'text-textMuted'
                  )}>
                  {item.textValue || String(item.key)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View
        accessibilityRole={'tabpanel' as never}
        className={cn('flex-1 py-300', panelClassName)}>
        {selectedItem?.rendered ?? null}
      </View>
    </View>
  );
}
