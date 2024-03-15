import {
  DateInput,
  DateSegment,
  FieldError,
  Label,
  Text,
  TimeField as AriaTimeField,
  TimeFieldProps as AriaTimeFieldProps,
  TimeValue
} from 'react-aria-components';
import {HelpTextProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface TimeFieldProps<T extends TimeValue>
  extends AriaTimeFieldProps<T>, HelpTextProps {
  label?: ReactNode
}

export function TimeField<T extends TimeValue>(
  {label, description, errorMessage, ...props}: TimeFieldProps<T>
) {
  return (
    <AriaTimeField {...props}>
      <Label>{label}</Label>
      <DateInput>
        {(segment) => <DateSegment segment={segment} />}
      </DateInput>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
    </AriaTimeField>
  );
}
