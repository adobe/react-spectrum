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


export interface MenuButtonProps<T>
  extends MenuProps<T>, Omit<MenuTriggerProps, 'children'> {
  label?: string
}

export function MenuButton<T extends object>(
  {label, children, ...props}: MenuButtonProps<T>
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

export function MenuItem(props: MenuItemProps) {
  return <AriaMenuItem {...props} />;
}
