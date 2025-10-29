'use client';
import { Check, ChevronRight } from 'lucide-react';
import React from 'react';
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuProps,
  MenuItemProps,
  MenuSection as AriaMenuSection,
  MenuSectionProps as AriaMenuSectionProps,
  MenuTrigger as AriaMenuTrigger,
  SubmenuTrigger as AriaSubmenuTrigger,
  Separator,
  SeparatorProps,
  composeRenderProps,
  Header,
  Collection,
  SubmenuTriggerProps,
  MenuTriggerProps as AriaMenuTriggerProps
} from 'react-aria-components';
import { dropdownItemStyles } from './ListBox';
import { Popover, PopoverProps } from './Popover';

export function Menu<T extends object>(props: MenuProps<T>) {
  return (
    <AriaMenu {...props} className="font-sans p-1 outline outline-0 max-h-[inherit] overflow-auto [clip-path:inset(0_0_0_0_round_.75rem)] empty:text-center empty:pb-2" />
  );
}

export function MenuItem(props: MenuItemProps) {
  let textValue = props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  return (
    <AriaMenuItem textValue={textValue} {...props} className={dropdownItemStyles}>
      {composeRenderProps(props.children, (children, {selectionMode, isSelected, hasSubmenu}) => <>
        {selectionMode !== 'none' && (
          <span className="flex items-center w-4">
            {isSelected && <Check aria-hidden className="w-4 h-4" />}
          </span>
        )}
        <span className="flex items-center flex-1 gap-2 font-normal truncate group-selected:font-semibold">
          {children}
        </span>
        {hasSubmenu && (
          <ChevronRight aria-hidden className="absolute w-4 h-4 right-2" />
        )}
      </>)}
    </AriaMenuItem>
  );
}

export function MenuSeparator(props: SeparatorProps) {
  return <Separator {...props} className="mx-3 my-1 border-b border-gray-300 dark:border-zinc-700" />
}

export interface MenuSectionProps<T> extends AriaMenuSectionProps<T> {
  title?: string
  items?: any
}

export function MenuSection<T extends object>(props: MenuSectionProps<T>) {
  return (
    <AriaMenuSection {...props} className="first:-mt-[5px] after:content-[''] after:block after:h-[5px]">
      {props.title && <Header className="text-sm font-semibold text-gray-500 dark:text-zinc-300 px-4 py-1 truncate sticky -top-[5px] -mt-px -mx-1 z-10 bg-gray-100/60 dark:bg-zinc-700/60 backdrop-blur-md supports-[-moz-appearance:none]:bg-gray-100 border-y border-y-gray-200 dark:border-y-zinc-700 [&+*]:mt-1">{props.title}</Header>}
      <Collection items={props.items}>
        {props.children}
      </Collection>
    </AriaMenuSection>
  )
}

interface MenuTriggerProps extends AriaMenuTriggerProps {
  placement?: PopoverProps['placement']
}

export function MenuTrigger(props: MenuTriggerProps) {
  let [trigger, menu] = React.Children.toArray(props.children) as [React.ReactElement, React.ReactElement];
  return (
    <AriaMenuTrigger {...props}>
      {trigger}
      <Popover placement={props.placement} className="min-w-[150px]">
        {menu}
      </Popover>
    </AriaMenuTrigger>
  );
}

export function SubmenuTrigger(
  props: SubmenuTriggerProps
) {
  let [trigger, menu] = React.Children.toArray(props.children) as [React.ReactElement, React.ReactElement];
  return (
    <AriaSubmenuTrigger {...props}>
      {trigger}
      <Popover offset={-2} crossOffset={-4}>
        {menu}
      </Popover>
    </AriaSubmenuTrigger>
  );
}
