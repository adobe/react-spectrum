'use client';
import {
  Button,
  ComboBox as AriaComboBox,
  ComboBoxProps as AriaComboBoxProps,
  FieldError,
  Input,
  Label,
  ListBoxItemProps,
  Popover,
  Text,
  ValidationResult
} from 'react-aria-components';
import {ListBox, ListBoxItem} from './ListBox';
import {ChevronDown} from 'lucide-react';

import './ComboBox.css';

export interface ComboBoxProps<T extends object>
  extends Omit<AriaComboBoxProps<T>, 'children'> {
  label?: string;
  description?: string | null;
  errorMessage?: string | ((validation: ValidationResult) => string);
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function ComboBox<T extends object>(
  { label, description, errorMessage, children, ...props }: ComboBoxProps<T>
) {
  return (
    (
      <AriaComboBox {...props}>
        <Label>{label}</Label>
        <div className="my-combobox-container">
          <Input />
          <Button><ChevronDown size={16} /></Button>
        </div>
        {description && <Text slot="description">{description}</Text>}
        <FieldError>{errorMessage}</FieldError>
        <Popover>
          <ListBox>
            {children}
          </ListBox>
        </Popover>
      </AriaComboBox>
    )
  );
}

export function ComboBoxItem(props: ListBoxItemProps) {
  return <ListBoxItem {...props} />;
}
