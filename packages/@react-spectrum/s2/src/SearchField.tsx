import {
  Button,
  FieldError,
  Input,
  Label,
  SearchField as AriaSearchField,
  SearchFieldProps as AriaSearchFieldProps,
  Text,
  ValidationResult
} from 'react-aria-components';


export interface SearchFieldProps extends AriaSearchFieldProps {
  label?: string,
  description?: string,
  errorMessage?: string | ((validation: ValidationResult) => string)
}

export function SearchField(
  {label, description, errorMessage, ...props}: SearchFieldProps
) {
  return (
    <AriaSearchField {...props}>
      <Label>{label}</Label>
      <Input />
      <Button>✕</Button>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
    </AriaSearchField>
  );
}
