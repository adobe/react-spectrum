'use client';
import {
  ListBoxItemProps,
  Select as AriaSelect,
  SelectProps as AriaSelectProps,
  SelectValue,
  ValidationResult,
  ListBoxProps
} from 'react-aria-components';
import {Button} from './Button';
import {DropdownItem, DropdownListBox} from './ListBox';
import {ChevronDown} from 'lucide-react';
import {Popover} from './Popover';
import {Label, FieldError, Description} from './Form';
import './Select.css';

export interface SelectProps<T extends object>
  extends Omit<AriaSelectProps<T>, 'children'> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function Select<T extends object>(
  { label, description, errorMessage, children, items, ...props }: SelectProps<
    T
  >
) {
  return (
    (
      <AriaSelect {...props}>
        {label && <Label>{label}</Label>}
        <Button>
          <SelectValue />
          <ChevronDown />
        </Button>
        {description && <Description>{description}</Description>}
        <FieldError>{errorMessage}</FieldError>
        <Popover hideArrow className="select-popover">
          <SelectListBox items={items}>
            {children}
          </SelectListBox>
        </Popover>
      </AriaSelect>
    )
  );
}

export function SelectListBox<T extends object>(props: ListBoxProps<T>) {
  return <DropdownListBox {...props} />;
}

export function SelectItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />;
}
