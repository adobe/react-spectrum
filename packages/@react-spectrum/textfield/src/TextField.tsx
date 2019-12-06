import React, {forwardRef, RefObject} from 'react';
import {SpectrumTextFieldProps, TextFieldRef} from './types';
import {TextFieldBase} from './TextFieldBase';

export const TextField = forwardRef((props: SpectrumTextFieldProps, ref: RefObject<TextFieldRef>) => {
  let {
    UNSAFE_className,
    ...otherProps
  } = props;
  
  return (
    <TextFieldBase
      {...otherProps}
      ref={ref}
      wrapperClassName={UNSAFE_className} />
  );
});
