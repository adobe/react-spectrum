import {AriaTextFieldProps, useSearchField} from 'react-aria';
import {ButtonContext} from './Button';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import {Provider, RenderProps, useRenderProps, useSlot} from './utils';
import React, {ForwardedRef, forwardRef} from 'react';
import {SearchFieldState, useSearchFieldState} from 'react-stately';
import {TextContext} from './Text';
import {useObjectRef} from '@react-aria/utils';

interface SearchFieldProps extends Omit<AriaTextFieldProps, 'label' | 'placeholder' | 'description' | 'errorMessage'>, RenderProps<SearchFieldState> {}

export interface SearchFieldRenderProps {
  /**
   * Whether the search field is empty.
   * @selector [data-empty]
   */
  isEmpty: boolean
}

function SearchField(props: SearchFieldProps, ref: ForwardedRef<HTMLInputElement>) {
  let domRef = useObjectRef(ref);
  let [labelRef, label] = useSlot();
  let state = useSearchFieldState(props);
  let {labelProps, inputProps, clearButtonProps, descriptionProps, errorMessageProps} = useSearchField({
    ...props,
    label
  }, state, domRef);

  let renderProps = useRenderProps({
    ...props,
    values: state,
    defaultClassName: 'react-aria-SearchField'
  });

  return (
    <div 
      {...renderProps}
      data-empty={state.value === '' || undefined}>
      <Provider
        values={[
          [LabelContext, {...labelProps, ref: labelRef}],
          [InputContext, {...inputProps, ref: domRef}],
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

const _SearchField = forwardRef(SearchField);
export {_SearchField as SearchField};
