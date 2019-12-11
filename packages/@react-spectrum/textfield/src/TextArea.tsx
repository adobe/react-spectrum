import {chain} from '@react-aria/utils';
import React, {forwardRef, RefObject} from 'react';
import {SpectrumTextFieldProps, TextFieldRef} from './types';
import {TextFieldBase} from './TextFieldBase';
import {useProviderProps} from '@react-spectrum/provider';

export const TextArea = forwardRef((props: SpectrumTextFieldProps, ref: RefObject<TextFieldRef>) => {
  props = useProviderProps(props);
  let {
    isDisabled = false,
    isQuiet = false,
    isReadOnly = false,
    isRequired = false,
    onChange,
    ...otherProps
  } = props;

  let onHeightChange = (value, e) => {
    if (isQuiet) {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  return (
    <TextFieldBase
      {...otherProps}
      ref={ref}
      multiLine
      isDisabled={isDisabled}
      isQuiet={isQuiet}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
      onChange={chain(onChange, onHeightChange)} />
  );  
});
