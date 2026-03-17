'use client';
import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  ListBoxSection as AriaListBoxSection,
  composeRenderProps,
  ListBoxItemProps,
  ListBoxLoadMoreItem as AriaListBoxLoadMoreItem,
  ListBoxLoadMoreItemProps,
  ListBoxProps,
  ListBoxSectionProps
} from 'react-aria-components';
import {Check} from 'lucide-react';
import {Text} from './Content';
import {ProgressCircle} from './ProgressCircle';
import './ListBox.css';

export function ListBox<T extends object>(
  { children, ...props }: ListBoxProps<T>
) {
  return (
    (
      <AriaListBox {...props}>
        {children}
      </AriaListBox>
    )
  );
}

export function ListBoxItem(props: ListBoxItemProps) {
  let textValue = props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  return (
    <AriaListBoxItem {...props} textValue={textValue}>
      {composeRenderProps(props.children, (children) => (
        typeof children === 'string' ? <Text slot="label">{children}</Text> : children
      ))}
    </AriaListBoxItem>
  );
}

export function ListBoxSection<T extends object>(props: ListBoxSectionProps<T>) {
  return <AriaListBoxSection {...props} />;
}


export function ListBoxLoadMoreItem(props: ListBoxLoadMoreItemProps) {
  return (
    <AriaListBoxLoadMoreItem {...props}>
      <ProgressCircle isIndeterminate aria-label="Loading more..." />
    </AriaListBoxLoadMoreItem>
  );
}

export function DropdownListBox<T extends object>(props: ListBoxProps<T>) {
  return <AriaListBox {...props} className="dropdown-listbox" />
}

export function DropdownItem(props: ListBoxItemProps) {
  let textValue = props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  return (
    <ListBoxItem {...props} textValue={textValue} className="dropdown-item">
      {composeRenderProps(props.children, (children, {isSelected}) => (<>
        {isSelected && <Check />}
        {typeof children === 'string' ? <Text slot="label">{children}</Text> : children}
      </>))}
    </ListBoxItem>
  );
}
