import React, {useCallback} from 'react';
import {useListState} from 'react-stately/useListState';
import {useMenuTriggerState} from 'react-stately/useMenuTriggerState';
import type {Key} from '@react-types/shared';
import type {CollectionBase} from '@react-types/shared';
import {Pressable, Text, View} from '../../primitives';
import {cn} from '../../styles/cn';
import {Tray} from '../tray/Tray';
import {ActionButton} from '../button/ActionButton';
import type {ActionButtonProps} from '../button/types';

export interface MenuItemProps {
  children?: React.ReactNode;
  className?: string;
  isDestructive?: boolean;
  isDisabled?: boolean;
  onAction?: () => void;
  testID?: string;
  textValue?: string;
}

export function MenuItem({
  children,
  className,
  isDestructive,
  isDisabled,
  onAction,
  testID,
  textValue
}: MenuItemProps) {
  return (
    <Pressable
      accessibilityLabel={textValue}
      accessibilityRole="menuitem"
      accessibilityState={{disabled: isDisabled || undefined}}
      className={cn(
        'min-h-[44px] flex-row items-center px-300 py-250',
        isDestructive ? 'bg-surface' : 'bg-surface',
        isDisabled && 'opacity-disabled',
        className
      )}
      isDisabled={isDisabled}
      onPress={onAction}
      testID={testID}>
      <Text
        className={cn(
          'text-200',
          isDestructive ? 'text-negative' : 'text-text'
        )}>
        {children}
      </Text>
    </Pressable>
  );
}

export interface MenuProps<T extends object> extends CollectionBase<T> {
  'aria-label'?: string;
  className?: string;
  disabledKeys?: Iterable<Key>;
  isOpen: boolean;
  onAction?: (key: Key) => void;
  onClose?: () => void;
  onOpenChange?: (isOpen: boolean) => void;
}

export function Menu<T extends object = object>(props: MenuProps<T>) {
  let {
    'aria-label': ariaLabel,
    className,
    disabledKeys,
    isOpen,
    onAction,
    onClose,
    onOpenChange,
    ...collectionProps
  } = props;

  let state = useListState({...collectionProps, selectionMode: undefined});

  let handleClose = useCallback(() => {
    onClose?.();
    onOpenChange?.(false);
  }, [onClose, onOpenChange]);

  let disabledSet = disabledKeys ? new Set(disabledKeys) : new Set<Key>();

  return (
    <Tray isOpen={isOpen} onOpenChange={handleClose}>
      <View
        accessibilityLabel={ariaLabel}
        accessibilityRole={'menu' as never}
        className={className}>
        {Array.from(state.collection).map(node => (
          <MenuItem
            isDisabled={disabledSet.has(node.key)}
            isDestructive={(node.value as any)?.isDestructive}
            key={node.key}
            onAction={() => {
              onAction?.(node.key);
              handleClose();
            }}
            testID={`menu-item-${String(node.key)}`}
            textValue={node.textValue}>
            {node.rendered}
          </MenuItem>
        ))}
      </View>
    </Tray>
  );
}

export interface MenuTriggerProps<T extends object>
  extends Omit<MenuProps<T>, 'isOpen' | 'children'> {
  children: React.ReactElement;
  defaultOpen?: boolean;
  menuChildren?: MenuProps<T>['children'];
  onOpenChange?: (isOpen: boolean) => void;
}

export function MenuTrigger<T extends object = object>({
  children,
  defaultOpen,
  menuChildren,
  onOpenChange,
  ...menuProps
}: MenuTriggerProps<T>) {
  let state = useMenuTriggerState({defaultOpen, onOpenChange});

  let trigger = React.cloneElement(children, {
    onPress: () => state.open(),
    accessibilityExpanded: state.isOpen,
    accessibilityHasPopup: true
  } as any);

  return (
    <>
      {trigger}
      <Menu
        {...menuProps}
        isOpen={state.isOpen}
        onOpenChange={isOpen => {
          if (!isOpen) {
            state.close();
          }
          onOpenChange?.(isOpen);
        }}>
        {menuChildren as any}
      </Menu>
    </>
  );
}

export interface ActionMenuProps<T extends object>
  extends Omit<MenuProps<T>, 'isOpen' | 'children'>,
    Pick<ActionButtonProps, 'isDisabled' | 'isQuiet'> {
  'aria-label'?: string;
  buttonClassName?: string;
  defaultOpen?: boolean;
  label?: React.ReactNode;
  menuChildren?: MenuProps<T>['children'];
  onOpenChange?: (isOpen: boolean) => void;
  testID?: string;
}

export function ActionMenu<T extends object = object>({
  'aria-label': ariaLabel = 'Actions',
  buttonClassName,
  defaultOpen,
  isDisabled,
  isQuiet,
  label = '•••',
  menuChildren,
  onOpenChange,
  testID,
  ...menuProps
}: ActionMenuProps<T>) {
  return (
    <MenuTrigger
      defaultOpen={defaultOpen}
      menuChildren={menuChildren}
      onOpenChange={onOpenChange}
      {...menuProps}>
      <ActionButton
        accessibilityLabel={ariaLabel}
        className={buttonClassName}
        isDisabled={isDisabled}
        isQuiet={isQuiet}
        testID={testID}>
        {label}
      </ActionButton>
    </MenuTrigger>
  );
}
