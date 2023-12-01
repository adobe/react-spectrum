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
import { DropdownItem } from './ListBox';

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
      <Button className="flex text-start gap-4 w-full cursor-default border border-gray-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] rounded-lg pl-3 pr-2 py-2 min-w-[150px] transition bg-gray-50 hover:bg-gray-100 pressed:bg-gray-200 group-invalid:border-red-600 disabled:text-gray-200 outline-none focus-visible:outline-blue-600 outline-offset-2">
        <SelectValue className="flex-1 text-sm text-gray-800 placeholder-shown:italic" />
        <ChevronDown className="w-4 h-4 text-gray-600" />
      </Button>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="min-w-[--trigger-width]">
        <ListBox items={items} className="outline-none p-1">
          {children}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}

export function SelectItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />;
}
