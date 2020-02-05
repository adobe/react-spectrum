import React, {forwardRef, RefObject} from 'react';
import {SpectrumTextFieldProps, TextFieldRef} from '@react-types/textfield';
import {TextFieldBase} from './TextFieldBase';

function TextField(props: SpectrumTextFieldProps, ref: RefObject<TextFieldRef>) {
  return (
    <TextFieldBase
      {...props}
      ref={ref} />
  );
}

/**
 * Text fields are text boxes that allow users to input custom text entries
 * with a keyboard. Various decorations can be displayed around the field to 
 * communicate the entry requirements.
 */
const _TextField = forwardRef(TextField);
export {_TextField as TextField};
