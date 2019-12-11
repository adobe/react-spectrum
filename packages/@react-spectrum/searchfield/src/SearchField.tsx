import {classNames, createDOMRef} from '@react-spectrum/utils';
import {ClearButton} from '@react-spectrum/button';
import Magnifier from '@spectrum-icons/ui/Magnifier';
import React, {forwardRef, RefObject, useImperativeHandle, useRef} from 'react';
import {SearchFieldProps} from '@react-types/searchfield';
import {SpectrumTextFieldProps, TextField, TextFieldRef} from '@react-spectrum/textfield';
import styles from '@adobe/spectrum-css-temp/components/search/vars.css';
import {useProviderProps} from '@react-spectrum/provider';
import {useSearchField} from '@react-aria/searchfield';
import {useSearchFieldState} from '@react-stately/searchfield';
import {useStyleProps} from '@react-spectrum/view';

interface SpectrumSearchFieldProps extends SearchFieldProps, SpectrumTextFieldProps {}

function SearchField(props: SpectrumSearchFieldProps, ref: RefObject<TextFieldRef>) {
  props = useProviderProps(props);
  let {
    icon = <Magnifier data-testid="searchicon" />,
    isDisabled,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  let state = useSearchFieldState(props);
  let textfieldRef = useRef<TextFieldRef>();
  let domRef = useRef<HTMLDivElement>();
  let {searchFieldProps, clearButtonProps} = useSearchField(props, state, unwrapInputRef(textfieldRef));

  // Expose imperative interface for ref
  // TODO: combine this with TextField once we remove the extra wrapping div
  useImperativeHandle(ref, () => ({
    ...createDOMRef(domRef),
    focus() {
      if (textfieldRef.current) {
        textfieldRef.current.focus();
      }
    },
    select() {
      if (textfieldRef.current) {
        textfieldRef.current.select();
      }
    },
    getInputElement() {
      return textfieldRef.current && textfieldRef.current.getInputElement();
    }
  }));

  // SearchField is essentially a controlled TextField so we filter out prop.value and prop.defaultValue in favor of state.value
  return (
    <div
      {...styleProps}
      ref={domRef}
      className={
        classNames(
          styles,
          'spectrum-Search',
          {
            'is-disabled': isDisabled,
            'is-quiet': props.isQuiet
          },
          styleProps.className
        )
      }>
      <TextField
        {...otherProps}
        {...searchFieldProps as any}
        UNSAFE_className={
          classNames(
            styles,
            'spectrum-Search-input'
          )
        }
        ref={textfieldRef}
        isDisabled={isDisabled}
        icon={icon}
        onChange={state.setValue}
        value={state.value} />
      {
        state.value !== '' &&
          <ClearButton
            {...clearButtonProps}
            UNSAFE_className={
              classNames(
                styles,
                'spectrum-ClearButton'
              )
            }
            isDisabled={isDisabled} />
      }
    </div>
  );
}

let _SearchField = forwardRef(SearchField);
export {_SearchField as SearchField};

function unwrapInputRef(ref: RefObject<TextFieldRef>) {
  return {
    get current() {
      return ref.current && ref.current.getInputElement();
    }
  };
}
