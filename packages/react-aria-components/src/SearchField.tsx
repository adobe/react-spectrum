import {AriaTextFieldProps, useSearchField} from 'react-aria';
import {ButtonContext} from './Button';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import {Provider, RenderProps, useRenderProps, useSlot} from './utils';
import React, {ForwardedRef, forwardRef, useRef} from 'react';
import {SearchFieldState, useSearchFieldState} from 'react-stately';
import {TextContext} from './Text';

export interface SearchFieldProps extends Omit<AriaTextFieldProps, 'label' | 'placeholder' | 'description' | 'errorMessage'>, RenderProps<SearchFieldState> {}

export interface SearchFieldRenderProps {
  /**
   * Whether the search field is empty.
   * @selector [data-empty]
   */
  isEmpty: boolean
}

function SearchField(props: SearchFieldProps, ref: ForwardedRef<HTMLDivElement>) {
  let inputRef = useRef(null);
  let [labelRef, label] = useSlot();
  let state = useSearchFieldState(props);
  let {labelProps, inputProps, clearButtonProps, descriptionProps, errorMessageProps} = useSearchField({
    ...props,
    label
  }, state, inputRef);

  let renderProps = useRenderProps({
    ...props,
    values: state,
    defaultClassName: 'react-aria-SearchField'
  });

  return (
    <div 
      {...renderProps}
      ref={ref}
      data-empty={state.value === '' || undefined}>
      <Provider
        values={[
          [LabelContext, {...labelProps, ref: labelRef}],
          [InputContext, {...inputProps, ref: inputRef}],
          [ButtonContext, clearButtonProps],
          [TextContext, {
            slots: {
              description: descriptionProps,
              errorMessage: errorMessageProps
            }
          }]
        ]}>
        {renderProps.children}
      </Provider>
    </div>
  );
}

/**
 * A search field allows a user to enter and clear a search query.
 */
const _SearchField = forwardRef(SearchField);
export {_SearchField as SearchField};
