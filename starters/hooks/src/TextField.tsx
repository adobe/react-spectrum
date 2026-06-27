'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useFocus} from 'react-aria/useFocus';
import {useTextField, type AriaTextFieldProps} from 'react-aria/useTextField';
import {useRef, useState} from 'react';
import './TextField.css';
import './Form.css';

export function TextField(props: AriaTextFieldProps & {label?: React.ReactNode}) {
  let ref = useRef<HTMLInputElement>(null);
  let {labelProps, inputProps} = useTextField(props, ref);
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
