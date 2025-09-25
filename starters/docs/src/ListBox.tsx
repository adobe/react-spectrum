'use client';
import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  ListBoxSection as AriaListBoxSection,
  ListBoxItemProps,
  ListBoxProps,
  ListBoxSectionProps
} from 'react-aria-components';

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
  return <AriaListBoxItem {...props} />;
}

export function ListBoxSection<T extends object>(props: ListBoxSectionProps<T>) {
  return <AriaListBoxSection {...props} />;
}
