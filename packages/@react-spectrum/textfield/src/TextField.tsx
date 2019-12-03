import React, {forwardRef, RefObject} from 'react';
import {SpectrumTextFieldProps} from './types';
import {useStyleProps} from '@react-spectrum/view';
import {TextFieldBase} from './TextFieldBase';

export const TextField = forwardRef((props: SpectrumTextFieldProps, ref: RefObject<HTMLInputElement & HTMLTextAreaElement>) => {  
  let {styleProps} = useStyleProps(props);
  
  return (
    <TextFieldBase
      {...props}
      ref={ref}
      wrapperClassName={styleProps.className} />
  );
});
