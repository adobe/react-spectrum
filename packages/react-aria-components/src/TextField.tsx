import {AriaTextFieldProps, useTextField} from 'react-aria';
import {DOMProps, Provider, useContextProps, useSlot, WithRef} from './utils';
import {filterDOMProps} from '@react-aria/utils';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import React, {createContext, ForwardedRef, forwardRef, useRef} from 'react';
import {TextContext} from './Text';

export interface TextFieldProps extends Omit<AriaTextFieldProps, 'label' | 'placeholder' | 'description' | 'errorMessage'>, DOMProps {}

export const TextFieldContext = createContext<WithRef<TextFieldProps, HTMLDivElement>>(null);

function TextField(props: TextFieldProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, TextFieldContext);
  let inputRef = useRef(null);
  let [labelRef, label] = useSlot();
  let {labelProps, inputProps, descriptionProps, errorMessageProps} = useTextField({
    ...props,
    label
  }, inputRef);

  return (
    <div
      {...filterDOMProps(props)}
      ref={ref}
      className={props.className ?? 'react-aria-TextField'}
      style={props.style}>
      <Provider
        values={[
          [LabelContext, {...labelProps, ref: labelRef}],
          [InputContext, {...inputProps, ref: inputRef}],
          [TextContext, {
            slots: {
              description: descriptionProps,
              errorMessage: errorMessageProps
            }
          }]
        ]}>
        {props.children}
      </Provider>
    </div>
  );
}

/**
 * A text field allows a user to enter a plain text value with a keyboard.
 */
const _TextField = forwardRef(TextField);
export {_TextField as TextField};
