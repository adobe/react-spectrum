'use client';
import {
  ComboBox as AriaComboBox,
  ComboBoxProps as AriaComboBoxProps,
  Input,
  ListBoxItemProps,
  ValidationResult
} from 'react-aria-components';
import {Label, FieldError, FieldButton, Description} from './Form';
import {DropdownItem, ListBox} from './ListBox';
import {Popover} from './Popover';
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
    <AriaComboBox {...props}>
      <Label>{label}</Label>
      <div className="combobox-field">
        <Input className="react-aria-Input inset" />
        <FieldButton><ChevronDown size={16} /></FieldButton>
      </div>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover hideArrow>
        <ListBox>
          {children}
        </ListBox>
      </Popover>
    </AriaComboBox>
  );
}

export function ComboBoxItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />;
}
