import React, {forwardRef, RefObject} from 'react';
import {SpectrumTextFieldProps, TextFieldRef} from './types';
import {TextFieldBase} from './TextFieldBase';

export const TextField = forwardRef((props: SpectrumTextFieldProps, ref: RefObject<TextFieldRef>) =>
  (
    <TextFieldBase
      {...props}
      ref={ref} />
  )
);
