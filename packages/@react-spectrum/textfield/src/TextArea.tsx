import {chain} from '@react-aria/utils';
import React, {forwardRef, RefObject} from 'react';
import {SpectrumTextFieldProps, TextFieldRef} from './types';
import {TextField} from './TextField';
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
    <TextField
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
