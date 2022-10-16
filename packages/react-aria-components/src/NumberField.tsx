import {AriaNumberFieldProps, useLocale, useNumberField} from 'react-aria';
import {ButtonContext} from './Button';
import {GroupContext} from './Group';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import {NumberFieldState, useNumberFieldState} from 'react-stately';
import {Provider, RenderProps, useContextProps, useRenderProps, useSlot, WithRef} from './utils';
import React, {createContext, ForwardedRef, forwardRef, useRef} from 'react';
import {TextContext} from './Text';

export interface NumberFieldProps extends Omit<AriaNumberFieldProps, 'label' | 'placeholder' | 'description' | 'errorMessage'>, RenderProps<NumberFieldState> {}

export const NumberFieldContext = createContext<WithRef<NumberFieldProps, HTMLDivElement>>(null);

function NumberField(props: NumberFieldProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, NumberFieldContext);
  let {locale} = useLocale();
  let state = useNumberFieldState({...props, locale});
  let inputRef = useRef();
  let [labelRef, label] = useSlot();
  let {
    labelProps,
    groupProps,
    inputProps,
    incrementButtonProps,
    decrementButtonProps,
    descriptionProps,
    errorMessageProps
  } = useNumberField({...props, label}, state, inputRef);

  let renderProps = useRenderProps({
    ...props,
    values: state,
    defaultClassName: 'react-aria-NumberField'
  });

  return (
    <Provider
      values={[
        [GroupContext, groupProps],
        [InputContext, {...inputProps, ref: inputRef}],
        [LabelContext, {...labelProps, ref: labelRef}],
        [ButtonContext, {
          slots: {
            increment: incrementButtonProps,
            decrement: decrementButtonProps
          }
        }],
        [TextContext, {
          slots: {
            description: descriptionProps,
            errorMessage: errorMessageProps
          }
        }]
      ]}>
      <div {...renderProps} ref={ref}>
        {props.children}
      </div>
    </Provider>
  );
}

/**
 * A number field allows a user to enter a number, and increment or decrement the value using stepper buttons.
 */
const _NumberField = forwardRef(NumberField);
export {_NumberField as NumberField};
