import {AriaTextFieldProps, useTextField} from 'react-aria';
import {DOMProps, Provider, useSlot} from './utils';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import React, {ForwardedRef, forwardRef} from 'react';
import {TextContext} from './Text';
import {useObjectRef} from '@react-aria/utils';

interface TextFieldProps extends Omit<AriaTextFieldProps, 'label' | 'placeholder' | 'description' | 'errorMessage'>, DOMProps {}

function TextField(props: TextFieldProps, ref: ForwardedRef<HTMLInputElement>) {
  let domRef = useObjectRef(ref);
  let [labelRef, label] = useSlot();
  let {labelProps, inputProps, descriptionProps, errorMessageProps} = useTextField({
    ...props,
    label
  }, domRef);

  return (
    <div className={props.className ?? 'react-aria-TextField'} style={props.style}>
      <Provider
        values={[
          [LabelContext, {...labelProps, ref: labelRef}],
          [InputContext, inputProps],
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

const _TextField = forwardRef(TextField);
export {_TextField as TextField};
