import {classNames} from '@react-spectrum/utils';
import {ClearButton} from '@react-spectrum/button';
import Magnifier from '@spectrum-icons/ui/Magnifier';
import React, {forwardRef, RefObject, useRef} from 'react';
import {SearchFieldProps} from '@react-types/searchfield';
import {SpectrumTextFieldProps, TextFieldBase} from '@react-spectrum/textfield';
import styles from '@adobe/spectrum-css-temp/components/search/vars.css';
import {useProviderProps} from '@react-spectrum/provider';
import {useSearchField} from '@react-aria/searchfield';
import {useSearchFieldState} from '@react-stately/searchfield';
import {useStyleProps} from '@react-spectrum/view';

interface SpectrumSearchFieldProps extends SearchFieldProps, SpectrumTextFieldProps {}

export const SearchField = forwardRef((props: SpectrumSearchFieldProps, ref: RefObject<HTMLInputElement & HTMLTextAreaElement>) => {
  props = useProviderProps(props);
  let {
    icon = <Magnifier data-testid="searchicon" />,
    isDisabled,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  let state = useSearchFieldState(props);
  let searchFieldRef = ref || useRef<HTMLInputElement & HTMLTextAreaElement>();
  let {searchFieldProps, clearButtonProps} = useSearchField(props, state, searchFieldRef);

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
      {...searchFieldProps}
      wrapperClassName={
        classNames(
          styles,
          'spectrum-Search',
          {
            'is-disabled': isDisabled,
            'is-quiet': props.isQuiet
          },
          styleProps.className
        )
      }
      inputClassName={
        classNames(
          styles,
          'spectrum-Search-input'
        )
      }
      ref={searchFieldRef}
      isDisabled={isDisabled}
      icon={icon}
      onChange={state.setValue}
      value={state.value}
      wrapperChildren={state.value !== '' && clearButton} />
  );
});
