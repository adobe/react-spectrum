'use client';
import {Check, ChevronRight, Dot, Info} from 'lucide-react';
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
import React, {createContext, useContext} from 'react';
import './Menu.css';

export let UnavailableContext = createContext(false);

export function MenuTrigger(props: MenuTriggerProps) {
  let [trigger, menu] = React.Children.toArray(props.children) as [React.ReactElement, React.ReactElement];
  return (
    <AriaMenuTrigger {...props}>
      {trigger}
      <Popover>
        {menu}
      </Popover>
    </AriaMenuTrigger>
  )
}

export function Menu<T extends object>(props: MenuProps<T>) {
  return (
    <AriaMenu
      {...props} >
      {props.children}
    </AriaMenu>
  );
}

export function MenuItem(props: Omit<MenuItemProps, 'children'> & { children?: React.ReactNode }) {
  let textValue = props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  let isUnavailable = useContext(UnavailableContext);
  return (
    (
      <AriaMenuItem {...props} textValue={textValue}>
        {({ hasSubmenu, isSelected, selectionMode }) => (
          <>
            {isSelected && selectionMode === 'multiple' ? <Check /> : null}
            {isSelected && selectionMode === 'single' ? <Dot /> : null}
            {typeof props.children === 'string' ? <Text slot="label">{props.children}</Text> : props.children}
            {hasSubmenu && !isUnavailable && <ChevronRight />}
            {hasSubmenu && isUnavailable && <Info />}
          </>
        )}
      </AriaMenuItem>
    )
  );
}

export function MenuSection<T extends object>(props: MenuSectionProps<T>) {
  return <AriaMenuSection {...props} />;
}

export function SubmenuTrigger(props: SubmenuTriggerProps) {
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

export interface UnavailableMenuItemTriggerProps {
  isUnavailable?: boolean,
  children: React.ReactElement[]
}

export function UnavailableMenuItemTrigger(props: UnavailableMenuItemTriggerProps) {
  let { isUnavailable = false, children } = props;
  if (isUnavailable) {
    return (
      <UnavailableContext.Provider value={isUnavailable}>
        <AriaSubmenuTrigger>
          {children[0]}
          <Popover hideArrow offset={-2} crossOffset={-4} className="unavailable">
            {children[1]}
          </Popover>
        </AriaSubmenuTrigger>
      </UnavailableContext.Provider>
    );
  }
  return children[0];
}
