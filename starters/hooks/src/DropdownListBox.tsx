'use client';
import {
  ListBox,
  ListBoxItem,
  type ListBoxItemProps,
  type ListBoxProps
} from 'react-aria-components/ListBox';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {Text} from 'react-aria-components/Text';
import {Check} from 'lucide-react';

export function DropdownListBox<T>(props: ListBoxProps<T>) {
  return <ListBox {...props} className="dropdown-listbox" />;
}

export function DropdownItem(props: ListBoxItemProps) {
  let textValue =
    props.textValue || (typeof props.children === 'string' ? props.children : undefined);

  return (
    <ListBoxItem {...props} textValue={textValue} className="dropdown-item">
      {composeRenderProps(props.children, (children, {isSelected}) => (
        <>
          {isSelected && <Check />}
          {typeof children === 'string' ? <Text slot="label">{children}</Text> : children}
        </>
      ))}
    </ListBoxItem>
  );
}
