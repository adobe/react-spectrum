import {
  DateField as AriaDateField,
  DateFieldProps as AriaDateFieldProps,
  DateInput,
  DateSegment,
  DateValue,
  FieldError,
  Label,
  Text
} from 'react-aria-components';
import {HelpTextProps} from '@react-types/shared';
import {ReactNode} from 'react';


export interface DateFieldProps<T extends DateValue>
  extends AriaDateFieldProps<T>, HelpTextProps {
  label?: ReactNode
}

export function DateField<T extends DateValue>(
  {label, description, errorMessage, ...props}: DateFieldProps<T>
) {
  return (
    <AriaDateField {...props}>
      <Label>{label}</Label>
      <DateInput>
        {(segment) => <DateSegment segment={segment} />}
      </DateInput>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
    </AriaDateField>
  );
}
