'use client';
import {
  ComboBox as AriaComboBox,
  ComboBoxProps as AriaComboBoxProps,
  ComboBoxValue,
  Input,
  ListBoxItemProps,
  ListBoxProps,
  ValidationResult
} from 'react-aria-components';
import {Label, FieldError, FieldButton, Description} from './Form';
import {DropdownItem, DropdownListBox} from './ListBox';
import {Popover} from './Popover';
import {ChevronDown} from 'lucide-react';

import './ComboBox.css';

export interface ComboBoxProps<T extends object, M extends 'single' | 'multiple'>
  extends Omit<AriaComboBoxProps<T, M>, 'children'> {
  label?: string;
  description?: string | null;
  errorMessage?: string | ((validation: ValidationResult) => string);
  children: React.ReactNode | ((item: T) => React.ReactNode);
  placeholder?: string;
}

export function ComboBox<T extends object, M extends 'single' | 'multiple' = 'single'>(
  { label, description, errorMessage, children, placeholder, ...props }: ComboBoxProps<T, M>
) {
  return (
    <AriaComboBox {...props}>
      <Label>{label}</Label>
      <div className="combobox-field">
        <Input className="react-aria-Input inset" placeholder={placeholder} />
        <FieldButton><ChevronDown /></FieldButton>
      </div>
      {props.selectionMode === 'multiple' && <ComboBoxValue placeholder="No items selected" />}
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover hideArrow className="combobox-popover">
        <ComboBoxListBox>
          {children}
        </ComboBoxListBox>
      </Popover>
    </AriaComboBox>
  );
}

export function ComboBoxListBox<T extends object>(props: ListBoxProps<T>) {
  return <DropdownListBox {...props} />;
}

export function ComboBoxItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />;
}
