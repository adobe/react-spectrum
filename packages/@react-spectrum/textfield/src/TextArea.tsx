import {chain} from '@react-aria/utils';
import React, {RefObject, useRef} from 'react';
import {SpectrumTextFieldProps, TextFieldRef} from './types';
import {TextField} from './TextField';
import {useProviderProps} from '@react-spectrum/provider';

function TextArea(props: SpectrumTextFieldProps, ref: RefObject<TextFieldRef>) {
  props = useProviderProps(props);
  let {
    isDisabled = false,
    isQuiet = false,
    isReadOnly = false,
    isRequired = false,
    onChange,
    ...otherProps
  } = props;

  let textfieldRef = useRef<TextFieldRef>(null);
  textfieldRef = ref || textfieldRef;

  let onHeightChange = () => {
    if (isQuiet) {
      let input = textfieldRef.current.getInputElement();
      input.style.height = 'auto';
      input.style.height = `${input.scrollHeight}px`;
    }
  };

  return (
    <TextField
      {...otherProps}
      ref={textfieldRef}
      multiLine
      isDisabled={isDisabled}
      isQuiet={isQuiet}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
      onChange={chain(onChange, onHeightChange)} />
  );
}

let _TextArea = React.forwardRef(TextArea);
export {_TextArea as TextArea};
