import {classNames} from '@react-spectrum/utils';
import {ClearButton} from '@react-spectrum/button';
import Magnifier from '@spectrum-icons/ui/Magnifier';
import React, {forwardRef, RefObject, useRef} from 'react';
import {SpectrumSearchFieldProps} from '@react-types/searchfield';
import styles from '@adobe/spectrum-css-temp/components/search/vars.css';
import {TextFieldBase} from '@react-spectrum/textfield';
import {TextFieldRef} from '@react-types/textfield';
import {useProviderProps} from '@react-spectrum/provider';
import {useSearchField} from '@react-aria/searchfield';
import {useSearchFieldState} from '@react-stately/searchfield';

function SearchField(props: SpectrumSearchFieldProps, ref: RefObject<TextFieldRef>) {
  props = useProviderProps(props);
  let {
    icon = <Magnifier data-testid="searchicon" />,
    isDisabled,
    UNSAFE_className,
    ...otherProps
  } = props;

  let state = useSearchFieldState(props);
  let textfieldRef = useRef<TextFieldRef>();
  textfieldRef = ref || textfieldRef;
  let {searchFieldProps, clearButtonProps} = useSearchField(props, state, unwrapInputRef(textfieldRef));

  let clearButton = (
    <ClearButton
      {...clearButtonProps}
      UNSAFE_className={
        classNames(
          styles,
          'spectrum-ClearButton'
        )
      }
      isDisabled={isDisabled} />
  );

  // SearchField is essentially a controlled TextField so we filter out prop.value and prop.defaultValue in favor of state.value
  return (
    <TextFieldBase
      {...otherProps}
      {...searchFieldProps as any}
      UNSAFE_className={
        classNames(
          styles,
          'spectrum-Search',
          {
            'is-disabled': isDisabled,
            'is-quiet': props.isQuiet
          },
          UNSAFE_className
        )
      }
      inputClassName={
        classNames(
          styles,
          'spectrum-Search-input'
        )
      }
      ref={textfieldRef}
      isDisabled={isDisabled}
      icon={icon}
      onChange={state.setValue}
      value={state.value}
      wrapperChildren={state.value !== '' && clearButton} />
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
