'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useColorField, type AriaColorFieldProps} from 'react-aria/useColorField';
import {useColorFieldState} from 'react-stately/useColorFieldState';
import {useFocus} from 'react-aria/useFocus';
import {useRef, useState} from 'react';
import './ColorField.css';
import './Form.css';

export function ColorField(props: AriaColorFieldProps & {label?: React.ReactNode}) {
  // useColorFieldState parses the text into a Color and formats it back.
  let state = useColorFieldState(props);
  let inputRef = useRef<HTMLInputElement>(null);
  let {labelProps, inputProps} = useColorField(props, state, inputRef);
  // The vanilla field CSS draws its focus ring from [data-focused]; useFocus tracks it.
  let [isFocused, setFocused] = useState(false);
  let {focusProps} = useFocus({onFocusChange: setFocused});

  return (
    <div className="react-aria-ColorField">
      {props.label && (
        <label className="react-aria-Label" {...labelProps}>
          {props.label}
        </label>
      )}
      <input
        {...mergeProps(inputProps, focusProps)}
        ref={inputRef}
        className="react-aria-Input inset"
        data-focused={isFocused || undefined}
      />
    </div>
  );
}
