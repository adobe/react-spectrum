import {
  Button,
  ListBox,
  ListBoxItemProps,
  Select as AriaSelect,
  SelectProps as AriaSelectProps,
  SelectValue,
  ValidationResult
} from 'react-aria-components';
import { Description, FieldError, Label } from './Field';
import { Popover } from './Popover';
import { ChevronDown } from 'lucide-react';
import { DropdownItem, ListBoxSection, ListBoxSectionProps } from './ListBox';
import React from 'react';
import {tv} from 'tailwind-variants';
import {focusRing} from './utils';

const styles = tv({
  extend: focusRing,
  base: 'flex items-center text-start gap-4 w-full cursor-default border border-black/10 dark:border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] dark:shadow-none rounded-lg pl-3 pr-2 py-2 min-w-[150px] transition bg-gray-50 dark:bg-zinc-700',
  variants: {
    isDisabled: {
      false: 'text-gray-800 dark:text-zinc-300 hover:bg-gray-100 pressed:bg-gray-200 dark:hover:bg-zinc-600 dark:pressed:bg-zinc-500 group-invalid:border-red-600 forced-colors:group-invalid:border-[Mark]',
      true: 'text-gray-200 dark:text-zinc-600 forced-colors:!text-[GrayText]'
    }
  }
});

export interface SelectProps<T extends object> extends Omit<AriaSelectProps<T>, 'children'> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function Select<T extends object>(
  { label, description, errorMessage, children, items, ...props }: SelectProps<T>
) {
  return (
    <AriaSelect {...props} className="group flex flex-col gap-1">
      {label && <Label>{label}</Label>}
      <Button className={styles}>
        <SelectValue className="flex-1 text-sm placeholder-shown:italic" />
        <ChevronDown aria-hidden className="w-4 h-4 text-gray-600 dark:text-zinc-400 forced-colors:!text-[ButtonText]" />
      </Button>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="min-w-[--trigger-width]">
        <ListBox items={items} className="outline-none p-1 max-h-[inherit] overflow-auto [clip-path:inset(0_0_0_0_round_.75rem)]">
          {children}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}

export function SelectItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />;
}

export function SelectSection<T extends object>(props: ListBoxSectionProps<T>) {
  return <ListBoxSection {...props} />;
}
