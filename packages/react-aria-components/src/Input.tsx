import React, {createContext, ForwardedRef, forwardRef, InputHTMLAttributes} from 'react';
import {useContextProps, WithRef} from './utils';

export const InputContext = createContext<WithRef<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>>({});

function Input(props: InputHTMLAttributes<HTMLInputElement>, ref: ForwardedRef<HTMLInputElement>) {
  [props, ref] = useContextProps(props, ref, InputContext);
  return <input {...props} ref={ref} />;
}

const _Input = forwardRef(Input);
export {_Input as Input};
