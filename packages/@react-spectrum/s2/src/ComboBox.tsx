import {
  Button,
  ComboBox as AriaComboBox,
  ComboBoxProps as AriaComboBoxProps,
  FieldError,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  ListBoxItemProps,
  Popover,
  Text
} from 'react-aria-components';
import {HelpTextProps} from '@react-types/shared';
import React, {ReactNode} from 'react';

export interface ComboBoxProps<T extends object>
  extends Omit<AriaComboBoxProps<T>, 'children'>, HelpTextProps {
  label?: ReactNode,
  children: React.ReactNode | ((item: T) => React.ReactNode)
}

export function ComboBox<T extends object>(
  {label, description, errorMessage, children, ...props}: ComboBoxProps<T>
) {
  return (
    <AriaComboBox {...props}>
      <Label>{label}</Label>
      <div className="my-combobox-container">
        <Input />
        <Button>▼</Button>
      </div>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
      <Popover>
        <ListBox>
          {children}
        </ListBox>
      </Popover>
    </AriaComboBox>
  );
}

export function ComboBoxItem(props: ListBoxItemProps) {
  return <ListBoxItem {...props} />;
}
