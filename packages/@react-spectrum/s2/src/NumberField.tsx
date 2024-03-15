import {
  Button,
  FieldError,
  Group,
  Input,
  Label,
  NumberField as AriaNumberField,
  NumberFieldProps as AriaNumberFieldProps,
  Text
} from 'react-aria-components';
import {HelpTextProps} from '@react-types/shared';
import {ReactNode} from 'react';


export interface NumberFieldProps extends AriaNumberFieldProps, HelpTextProps {
  label?: ReactNode
}

export function NumberField(
  {label, description, errorMessage, ...props}: NumberFieldProps
) {
  return (
    <AriaNumberField {...props}>
      <Label>{label}</Label>
      <Group>
        <Button slot="decrement">-</Button>
        <Input />
        <Button slot="increment">+</Button>
      </Group>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
    </AriaNumberField>
  );
}
