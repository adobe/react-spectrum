import {
  ComboBox as AriaComboBox,
  ComboBoxProps as AriaComboBoxProps,
  Input,
  ListBox,
  ListBoxItemProps,
  ValidationResult
} from 'react-aria-components';
import { Description, FieldError, FieldGroup, Label } from './Field';
import { Button } from './Button';
import { Popover } from './Popover';
import { ChevronDown } from 'lucide-react';
import { DropdownItem } from './ListBox';

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
        <Input className="px-2 py-1.5 flex-1 min-w-0 outline-none bg-transparent text-sm text-gray-800 disabled:text-gray-200" />
        <Button variant="icon" className="w-6 mr-1 rounded outline-offset-0"><ChevronDown className="w-4 h-4" /></Button>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="w-[--trigger-width]">
        <ListBox items={items} className="outline-none p-1 max-h-[inherit] overflow-auto">
          {children}
        </ListBox>
      </Popover>
    </AriaComboBox>
  );
}

export function ComboBoxItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />;
}
