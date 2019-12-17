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

const _TextField = forwardRef(TextField);
export {_TextField as TextField};
