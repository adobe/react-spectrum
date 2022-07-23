import {AriaButtonProps} from '@react-types/button';
import React, {createContext, ForwardedRef, forwardRef} from 'react';
import {useButton} from 'react-aria';
import {useContextProps, WithRef} from './utils';

export const ButtonContext = createContext<WithRef<AriaButtonProps, HTMLButtonElement>>({});

function Button(props: AriaButtonProps, ref: ForwardedRef<HTMLButtonElement>) {
  [props, ref] = useContextProps(props, ref, ButtonContext);
  let {buttonProps} = useButton(props, ref);
  return (
    <button {...buttonProps} ref={ref}>
      {props.children}
    </button>
  );
}

const _Button = forwardRef(Button);
export {_Button as Button};
