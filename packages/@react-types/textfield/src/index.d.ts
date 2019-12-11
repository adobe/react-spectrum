import {InputBase, TextInputBase, ValueBase} from '@react-types/shared';

export interface TextFieldProps extends InputBase, TextInputBase, ValueBase<string | number | string[]> {}
