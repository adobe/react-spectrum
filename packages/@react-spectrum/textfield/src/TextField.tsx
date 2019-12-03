import React, {forwardRef, RefObject} from 'react';
import {SpectrumTextFieldProps} from './types';
import {TextFieldBase} from './TextFieldBase';

export const TextField = forwardRef((props: SpectrumTextFieldProps, ref: RefObject<HTMLInputElement & HTMLTextAreaElement>) => {
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
