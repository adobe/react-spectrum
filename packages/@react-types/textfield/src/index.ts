import {DOMProps, InputBase, TextInputBase, ValueBase} from '@react-types/shared';

export interface TextFieldProps extends DOMProps, InputBase, TextInputBase, ValueBase<string | string[]> {}
