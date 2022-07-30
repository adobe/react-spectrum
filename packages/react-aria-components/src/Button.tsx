import {AriaButtonProps, useButton} from 'react-aria';
import React, {createContext, ForwardedRef, forwardRef} from 'react';
import {SlotProps, useContextProps, WithRef} from './utils';

interface ButtonProps extends AriaButtonProps, SlotProps {}

export const ButtonContext = createContext<WithRef<AriaButtonProps, HTMLButtonElement>>({});

function Button(props: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) {
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
