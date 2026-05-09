import React, {useCallback} from 'react';
import {ScrollView} from 'react-native';
import {useTreeState} from 'react-stately/useTreeState';
import type {TreeProps} from 'react-stately/useTreeState';
import type {Key, Node} from '@react-types/shared';
import {Pressable, Text, View} from '../../primitives';
import {cn} from '../../styles/cn';

export type TreeViewSelectionMode = 'none' | 'single' | 'multiple';

export interface TreeViewProps<T extends object>
  extends Omit<TreeProps<T>, 'onSelectionChange'> {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
  label?: React.ReactNode;
  onAction?: (key: Key) => void;
  onSelectionChange?: (keys: Set<Key>) => void;
  selectionMode?: TreeViewSelectionMode;
  testID?: string;
}

interface TreeViewNodeProps<T extends object> {
  depth: number;
  isExpanded: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  node: Node<T>;
  onAction?: (key: Key) => void;
  onPress: (key: Key) => void;
  onToggle: (key: Key) => void;
  showCheckbox: boolean;
  testIDPrefix?: string;
}

function TreeViewNode<T extends object>({
  depth,
  isDisabled,
  isExpanded,
  isSelected,
  node,
  onAction,
  onPress,
  onToggle,
  showCheckbox,
  testIDPrefix
}: TreeViewNodeProps<T>) {
  let hasChildren = node.hasChildNodes;
  let indent = depth * 16;

  return (
    <Pressable
      accessibilityLabel={node.textValue}
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled || undefined,
        expanded: hasChildren ? isExpanded : undefined,
        selected: isSelected || undefined
      }}
      className={cn(
        'flex-row items-center gap-300 pr-300 min-h-[44px]',
        'border-b border-border',
        isSelected && 'bg-accentSubtle',
        isDisabled && 'opacity-disabled'
      )}
      isDisabled={isDisabled}
      onPress={() => {
        onPress(node.key);
        onAction?.(node.key);
      }}
      style={{paddingLeft: 12 + indent}}
      testID={`${testIDPrefix ?? 'treeview'}-item-${String(node.key)}`}>
      {/* Expand/collapse toggle */}
      <View className="w-5 items-center justify-center">
        {hasChildren ? (
          <Pressable
            accessibilityLabel={isExpanded ? 'Collapse' : 'Expand'}
            accessibilityRole="button"
            onPress={e => {
              // Stop propagation by handling toggle separately
              onToggle(node.key);
            }}
            testID={`${testIDPrefix ?? 'treeview'}-toggle-${String(node.key)}`}>
            <Text className="text-200 text-textMuted">
              {isExpanded ? '▼' : '▶'}
            </Text>
          </Pressable>
        ) : (
          <Text className="text-200 text-textMuted"> </Text>
        )}
      </View>

      {/* Selection checkbox */}
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

      <Text className="flex-1 text-200 text-text py-200">
        {node.textValue || String(node.key)}
      </Text>
    </Pressable>
  );
}

function renderNodes<T extends object>(
  nodes: Iterable<Node<T>>,
  depth: number,
  state: ReturnType<typeof useTreeState<T>>,
  onPress: (key: Key) => void,
  onToggle: (key: Key) => void,
  onAction: ((key: Key) => void) | undefined,
  showCheckbox: boolean,
  testIDPrefix: string | undefined
): React.ReactNode[] {
  let elements: React.ReactNode[] = [];

  for (let node of nodes) {
    if (node.type === 'section') {
      // Render section heading if it has a rendered value
      if (node.rendered) {
        elements.push(
          <View
            className="px-300 py-200 bg-surface border-b border-border"
            key={`section-${String(node.key)}`}>
            <Text className="text-200 font-medium text-textMuted">
              {typeof node.rendered === 'string' ? node.rendered : node.textValue}
            </Text>
          </View>
        );
      }
      // Always render children of sections
      if (node.hasChildNodes) {
        elements.push(
          ...renderNodes(
            node.childNodes,
            depth,
            state,
            onPress,
            onToggle,
            onAction,
            showCheckbox,
            testIDPrefix
          )
        );
      }
      continue;
    }

    let isExpanded = state.expandedKeys.has(node.key);
    let isSelected = state.selectionManager.isSelected(node.key);
    let isDisabled = state.disabledKeys.has(node.key);

    elements.push(
      <TreeViewNode
        depth={depth}
        isDisabled={isDisabled}
        isExpanded={isExpanded}
        isSelected={isSelected}
        key={node.key}
        node={node}
        onAction={onAction}
        onPress={onPress}
        onToggle={onToggle}
        showCheckbox={showCheckbox}
        testIDPrefix={testIDPrefix}
      />
    );

    // Render children when expanded
    if (isExpanded && node.hasChildNodes) {
      elements.push(
        ...renderNodes(
          node.childNodes,
          depth + 1,
          state,
          onPress,
          onToggle,
          onAction,
          showCheckbox,
          testIDPrefix
        )
      );
    }
  }

  return elements;
}

export function TreeView<T extends object = object>(props: TreeViewProps<T>) {
  let {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    className,
    label,
    onAction,
    onSelectionChange,
    selectionMode = 'none',
    testID,
    ...treeProps
  } = props;

  let state = useTreeState({
    ...treeProps,
    selectionMode: selectionMode === 'none' ? undefined : selectionMode,
    onSelectionChange(keys) {
      let keySet =
        keys === 'all'
          ? new Set(Array.from(state.collection).map(n => n.key))
          : keys;
      onSelectionChange?.(keySet);
    }
  });

  let handlePress = useCallback(
    (key: Key) => {
      if (selectionMode !== 'none') {
        state.selectionManager.toggleSelection(key);
      }
    },
    [selectionMode, state.selectionManager]
  );

  let handleToggle = useCallback(
    (key: Key) => {
      state.toggleKey(key);
    },
    [state]
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
        {renderNodes(
          state.collection,
          0,
          state,
          handlePress,
          handleToggle,
          onAction,
          showCheckbox,
          testID
        )}
      </ScrollView>
    </View>
  );
}
