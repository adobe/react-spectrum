import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {ClearButton} from '@react-spectrum/button';
import Magnifier from '@spectrum-icons/ui/Magnifier';
import {mergeProps} from '@react-aria/utils';
import React, {forwardRef, HTMLAttributes, RefObject, useRef} from 'react';
import {SearchFieldProps} from '@react-types/searchfield';
import {SpectrumTextFieldProps, TextField} from '@react-spectrum/textfield';
import styles from '@adobe/spectrum-css-temp/components/search/vars.css';
import {useProviderProps} from '@react-spectrum/provider';
import {useSearchField} from '@react-aria/searchfield';
import {useSearchFieldState} from '@react-stately/searchfield';

interface SpectrumSearchFieldProps extends SearchFieldProps, SpectrumTextFieldProps {
  childElementProps?: {
    textField: HTMLAttributes<HTMLElement>,
    input: HTMLAttributes<HTMLInputElement>,
    clearButton: HTMLAttributes<HTMLElement>
  }
}

export const SearchField = forwardRef((props: SpectrumSearchFieldProps, ref: RefObject<HTMLInputElement & HTMLTextAreaElement>) => {
  props = useProviderProps(props);
  let {
    icon = <Magnifier data-testid="searchicon" />,
    isDisabled,
    className,
    placeholder,
    isRequired,
    isReadOnly,
    autoFocus,
    isQuiet,
    validationState,
    name,
    pattern,
    minLength,
    maxLength,
    autoComplete,
    childElementProps: {
      textField: textFieldProps = {},
      input: inputChildProps = {},
      clearButton: clearChildProps = {}
    } = {},
    ...otherProps
  } = props;

  let state = useSearchFieldState(props);
  let searchFieldRef = useRef<HTMLInputElement & HTMLTextAreaElement>();
  let {inputProps, clearButtonProps} = useSearchField(props, state, searchFieldRef);

  // SearchField is essentially a controlled TextField so we filter out prop.value and prop.defaultValue in favor of state.value
  return (
    <div
      {...filterDOMProps(otherProps, {
        value: false,
        defaultValue: false,
        onChange: false
      })}
      ref={ref}
      className={
        classNames(
          styles,
          'spectrum-Search',
          {
            'is-disabled': isDisabled,
            'is-quiet': props.isQuiet
          },
          className
        )
      }>
      <TextField
        {...filterDOMProps(textFieldProps)}
        childElementProps={{
          input: {
            ...mergeProps(inputChildProps, inputProps),
            className: classNames(
              styles,
              'spectrum-Search-input',
              inputChildProps.className
            )
          }
        }}
        ref={searchFieldRef}
        isDisabled={isDisabled}
        isReadOnly={isReadOnly}
        isRequired={isRequired}
        isQuiet={isQuiet}
        placeholder={placeholder}
        autoFocus={autoFocus}
        validationState={validationState}
        name={name}
        pattern={pattern}
        minLength={minLength}
        maxLength={maxLength}
        autoComplete={autoComplete}
        icon={icon}
        onChange={state.setValue}
        value={state.value} />
      {
        state.value !== '' &&
          <ClearButton
            {...mergeProps(clearButtonProps, filterDOMProps(clearChildProps))}
            className={
              classNames(
                styles,
                'spectrum-ClearButton',
                clearChildProps.className
              )
            }
            isDisabled={isDisabled} />
      }
    </div>
  );
});
