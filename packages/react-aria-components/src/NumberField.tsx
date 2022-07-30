import {AriaNumberFieldProps, useLocale, useNumberField} from 'react-aria';
import {ButtonContext} from './Button';
import {GroupContext} from './Group';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import {Provider} from './utils';
import React, {ReactNode, useRef} from 'react';
import {useNumberFieldState} from 'react-stately';

interface NumberFieldProps extends AriaNumberFieldProps {
  children: ReactNode
}

export function NumberField(props: NumberFieldProps) {
  let {locale} = useLocale();
  let state = useNumberFieldState({...props, locale});
  let inputRef = useRef();
  let {
    labelProps,
    groupProps,
    inputProps,
    incrementButtonProps,
    decrementButtonProps
  } = useNumberField({...props, label: <span />}, state, inputRef);

  return (
    <Provider
      values={[
        [GroupContext, groupProps],
        [InputContext, {...inputProps, ref: inputRef}],
        [LabelContext, labelProps],
        [ButtonContext, {
          slots: {
            increment: incrementButtonProps,
            decrement: decrementButtonProps
          }
        }]
      ]}>
      {props.children}
    </Provider>
  );
}
