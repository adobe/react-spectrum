'use client';
import {Search, X} from 'lucide-react';
import {mergeProps} from 'react-aria/mergeProps';
import {useButton, type AriaButtonProps} from 'react-aria/useButton';
import {useFocus} from 'react-aria/useFocus';
import {useSearchField, type AriaSearchFieldProps} from 'react-aria/useSearchField';
import {useSearchFieldState} from 'react-stately/useSearchFieldState';
import {useRef, useState} from 'react';
import './SearchField.css';
import './Form.css';

export interface SearchFieldProps extends AriaSearchFieldProps {
  label?: React.ReactNode;
}

export function SearchField(props: SearchFieldProps) {
  let state = useSearchFieldState(props);
  let ref = useRef<HTMLInputElement>(null);
  /*- begin highlight -*/
  let {labelProps, inputProps, clearButtonProps} = useSearchField(props, state, ref);
  /*- end highlight -*/
  let [isFocused, setFocused] = useState(false);
  let {focusProps} = useFocus({onFocusChange: setFocused});

  return (
    <div className="react-aria-SearchField" data-empty={state.value === '' || undefined}>
      {props.label && (
        <label className="react-aria-Label" {...labelProps}>
          {props.label}
        </label>
      )}
      <Search size={18} aria-hidden="true" />
      <input
        {...mergeProps(inputProps, focusProps)}
        ref={ref}
        className="react-aria-Input inset"
        data-focused={isFocused || undefined}
      />
      <ClearButton {...clearButtonProps}>
        <X size={14} />
      </ClearButton>
    </div>
  );
}

function ClearButton(props: AriaButtonProps) {
  let ref = useRef<HTMLButtonElement>(null);
  // useButton turns the AriaButtonProps from useSearchField into DOM props for the clear button.
  let {buttonProps, isPressed} = useButton(props, ref);

  return (
    <button
      {...buttonProps}
      ref={ref}
      className="clear-button"
      data-pressed={isPressed || undefined}
      data-disabled={props.isDisabled || undefined}>
      {props.children}
    </button>
  );
}
