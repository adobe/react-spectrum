import {useRef, createContext, useContext} from 'react';
import {useNumberFieldState} from 'react-stately';
import {useNumberField, useLocale, mergeProps} from 'react-aria';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import {Button} from './Button';
import {GroupContext} from './Group';
import {Provider} from './utils';

const NumberFieldContext = createContext();

export function NumberField(props) {
  let {locale} = useLocale();
  let state = useNumberFieldState({...props, locale});
  let inputRef = useRef();
  let {
    labelProps,
    groupProps,
    inputProps,
    incrementButtonProps,
    decrementButtonProps
  } = useNumberField({...props, label: 's'}, state, inputRef);
  
  return (
    <Provider
      values={[
        [NumberFieldContext, {state, incrementButtonProps, decrementButtonProps}],
        [GroupContext, groupProps],
        [InputContext, {...inputProps, inputRef}],
        [LabelContext, labelProps]
      ]}>
      {props.children}
    </Provider>
  );
}

export function IncrementButton(props) {
  let {incrementButtonProps} = useContext(NumberFieldContext);
  return <Button {...mergeProps(props, incrementButtonProps)} />
}

export function DecrementButton(props) {
  let {decrementButtonProps} = useContext(NumberFieldContext);
  return <Button {...mergeProps(props, decrementButtonProps)} />
}
