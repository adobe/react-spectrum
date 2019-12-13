import {SpectrumTextFieldProps, TextFieldProps} from '@react-types/textfield';

export interface SearchFieldProps extends TextFieldProps {
  onSubmit?: (value: string) => void,
  onClear?: () => void
}

interface SpectrumSearchFieldProps extends SearchFieldProps, SpectrumTextFieldProps {}
