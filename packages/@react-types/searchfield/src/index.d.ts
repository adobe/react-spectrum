import {TextFieldProps} from '@react-types/textfield';

export interface SearchFieldProps extends TextFieldProps {
  isDisabled?: boolean,
  onSubmit?: (value: string, e?: Event) => void,
  onClear?: (e: Event) => void,
  onKeyDown?: (e: Event) => void 
}
