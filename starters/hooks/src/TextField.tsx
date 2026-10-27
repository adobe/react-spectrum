'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useFocus} from 'react-aria/useFocus';
import {useTextField, type AriaTextFieldProps} from 'react-aria/useTextField';
import {useRef, useState} from 'react';
import './TextField.css';
import './Form.css';

export interface TextFieldProps extends AriaTextFieldProps {
  label?: React.ReactNode;
}

export function TextField(props: TextFieldProps) {
  let ref = useRef<HTMLInputElement>(null);
  /*- begin highlight -*/
  let {labelProps, inputProps} = useTextField(props, ref);
  /*- end highlight -*/
  let [isFocused, setFocused] = useState(false);
  let {focusProps} = useFocus({onFocusChange: setFocused});

  return (
    <div className="react-aria-TextField">
      <label className="react-aria-Label" {...labelProps}>
        {props.label}
      </label>
      <input
        {...mergeProps(inputProps, focusProps)}
        ref={ref}
        className="react-aria-Input inset"
        data-focused={isFocused || undefined}
      />
    </div>
  );
}
