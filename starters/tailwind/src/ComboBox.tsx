import {
  ComboBox as AriaComboBox,
  ComboBoxProps as AriaComboBoxProps,
  ListBox,
  ListBoxItemProps,
  ValidationResult
} from 'react-aria-components';
import { Description, FieldError, FieldGroup, Label, Input } from './Field';
import { Button } from './Button';
import { Popover } from './Popover';
import { ChevronDown } from 'lucide-react';
import { DropdownItem } from './ListBox';
import React from 'react';

export interface ComboBoxProps<T extends object> extends Omit<AriaComboBoxProps<T>, 'children'> {
  label?: string;
  description?: string | null;
  errorMessage?: string | ((validation: ValidationResult) => string);
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function ComboBox<T extends object>(
  { label, description, errorMessage, children, items, ...props }: ComboBoxProps<T>
) {
  return (
    <AriaComboBox {...props} className="group flex flex-col gap-1">
      <Label>{label}</Label>
      <FieldGroup>
        <Input />
        <Button variant="icon" className="w-6 mr-1 rounded outline-offset-0 ">
          <ChevronDown aria-hidden className="w-4 h-4" />
        </Button>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="w-[--trigger-width]">
        <ListBox items={items} className="outline-0 p-1 max-h-[inherit] overflow-auto">
          {children}
        </ListBox>
      </Popover>
    </AriaComboBox>
  );
}

export function ComboBoxItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />;
}
