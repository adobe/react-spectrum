'use client';
import {Button} from './Button';
import {Check, ChevronRight, Dot} from 'lucide-react';
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuSection as AriaMenuSection,
  MenuTrigger as AriaMenuTrigger,
  SubmenuTrigger as AriaSubmenuTrigger,
  MenuItemProps,
  MenuProps,
  MenuSectionProps,
  MenuTriggerProps,
  SubmenuTriggerProps,
} from 'react-aria-components';
import {Popover} from './Popover';
import { Text } from './Content';
import React from 'react';
import './Menu.css';

export interface MenuButtonProps<T extends object>
  extends MenuProps<T>, Omit<MenuTriggerProps, 'children'> {
  label?: string;
}

export function MenuButton<T extends object>(
  { label, children, ...props }: MenuButtonProps<T>
) {
  return (
    <MenuTrigger {...props}>
      <Button>{label}</Button>
      <Popover hideArrow>
        <Menu {...props}>
          {children}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}

export function MenuTrigger(props: MenuTriggerProps) {
  return <AriaMenuTrigger {...props} />;
}

export function Menu<T extends object>(props: MenuProps<T>) {
  return (
    <AriaMenu
      {...props} >
      {props.children}
    </AriaMenu>
  );
}

export function MenuItem(
  props: Omit<MenuItemProps, 'children'> & { children?: React.ReactNode }
) {
  let textValue = props.textValue ||
    (typeof props.children === 'string' ? props.children : undefined);
  return (
    (
      <AriaMenuItem {...props} textValue={textValue}>
        {({ hasSubmenu, isSelected, selectionMode }) => (
          <>
            {isSelected && selectionMode === 'multiple' ? <Check /> : null}
            {isSelected && selectionMode === 'single' ? <Dot /> : null}
            {typeof props.children === 'string' ? <Text slot="label">{props.children}</Text> : props.children}
            {hasSubmenu && (
              <ChevronRight />
            )}
          </>
        )}
      </AriaMenuItem>
    )
  );
}

export function MenuSection<T extends object>(props: MenuSectionProps<T>) {
  return <AriaMenuSection {...props} />;
}

export function SubmenuTrigger(
  props: SubmenuTriggerProps
) {
  let [trigger, menu] = React.Children.toArray(props.children) as [React.ReactElement, React.ReactElement];
  return (
    <AriaSubmenuTrigger {...props}>
      {trigger}
      <Popover hideArrow offset={-2} crossOffset={-4}>
        {menu}
      </Popover>
    </AriaSubmenuTrigger>
  );
}
