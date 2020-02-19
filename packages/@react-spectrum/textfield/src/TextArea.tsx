import {chain} from '@react-aria/utils';
import React, {RefObject, useRef} from 'react';
import {SpectrumTextFieldProps, TextFieldRef} from '@react-types/textfield';
import {TextFieldBase} from './TextFieldBase';
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
    <TextFieldBase
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

/**
 * Text areas are multiline text inputs, useful for cases where users have 
 * a sizable amount of text to enter. They allow for all customizations that
 * are available to text fields.
 */
let _TextArea = React.forwardRef(TextArea);
export {_TextArea as TextArea};
