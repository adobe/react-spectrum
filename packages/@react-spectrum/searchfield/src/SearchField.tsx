import {classNames} from '@react-spectrum/utils';
import {ClearButton} from '@react-spectrum/button';
import Magnifier from '@spectrum-icons/ui/Magnifier';
import React, {forwardRef, RefObject, useRef} from 'react';
import {SearchFieldProps} from '@react-types/searchfield';
import {SpectrumTextFieldProps, TextField} from '@react-spectrum/textfield';
import styles from '@spectrum-css/search/dist/index-vars.css';
import {useProviderProps} from '@react-spectrum/provider';
import {useSearchField} from '@react-aria/searchfield';
import {useTextFieldState} from '@react-stately/textfield';

interface SpectrumSearchFieldProps extends SearchFieldProps, SpectrumTextFieldProps {}

export const SearchField = forwardRef((props: SpectrumSearchFieldProps, ref: RefObject<HTMLInputElement & HTMLTextAreaElement>) => {
  props = useProviderProps(props);
  let {
    icon = <Magnifier data-testid="searchicon" />,
    isDisabled,
    className,
    ...otherProps
  } = props;

  let state = useTextFieldState(props);
  let searchFieldRef = ref || useRef<HTMLInputElement & HTMLTextAreaElement>();
  let {searchDivProps, searchFieldProps, clearButtonProps} = useSearchField(props, state, searchFieldRef);

  return (
    <div
      {...searchDivProps}
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
        {...otherProps}
        {...searchFieldProps}
        className={
          classNames(
            styles,
            'spectrum-Search-input'
          )
        }
        ref={searchFieldRef}
        isDisabled={isDisabled}
        icon={icon}
        onChange={state.setValue}
        value={state.value} />
      {
        state.value !== '' &&
          <ClearButton
            {...clearButtonProps}
            className={
              classNames(
                styles,
                'spectrum-ClearButton',
                className
              )
            }
            isDisabled={isDisabled} />
      }
    </div>
  );
});
