import {chain} from '@react-aria/utils';
import React, {forwardRef, RefObject} from 'react';
import {SpectrumTextFieldProps} from './types';
import {TextFieldBase} from './TextFieldBase';
import {useProviderProps} from '@react-spectrum/provider';
import {useStyleProps} from '@react-spectrum/view';

export const TextArea = forwardRef((props: SpectrumTextFieldProps, ref: RefObject<HTMLInputElement & HTMLTextAreaElement>) => {
  props = useProviderProps(props);
  let {
    isDisabled = false,
    isQuiet = false,
    isReadOnly = false,
    isRequired = false,
    onChange,
    ...otherProps
  } = props;

  let {styleProps} = useStyleProps(props);

  let onHeightChange = (value, e) => {
    if (isQuiet) {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  return (
    <TextFieldBase
      {...otherProps}
      wrapperClassName={styleProps.className}
      ref={ref}
      multiLine
      isDisabled={isDisabled}
      isQuiet={isQuiet}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
      onChange={chain(onChange, onHeightChange)} />
  );  
});
