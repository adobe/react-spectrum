'use client';
import {
  Button,
  Menu,
  MenuItem as AriaMenuItem,
  MenuItemProps,
  MenuProps,
  MenuTrigger,
  MenuTriggerProps,
  Popover
} from 'react-aria-components';
import {ChevronRight} from 'lucide-react';

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
      <Popover>
        <Menu {...props}>
          {children}
        </Menu>
      </Popover>
    </MenuTrigger>
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
        {({ hasSubmenu }) => (
          <>
            {props.children}
            {hasSubmenu && (
              <ChevronRight size={18} />
            )}
          </>
        )}
      </AriaMenuItem>
    )
  );
}
