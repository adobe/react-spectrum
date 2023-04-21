import {Button as AriaButton, ButtonProps as AriaButtonProps} from 'react-aria-components';
import './Button.css';
import React from 'react';

export interface ButtonProps extends AriaButtonProps {}

function Button(props: ButtonProps, ref: React.ForwardedRef<HTMLButtonElement>) {
  let {children} = props;
  return (
    <AriaButton ref={ref} {...props}>
      {children}
    </AriaButton>
  );
}

/**
 * A button allows a user to perform an action, with mouse, touch and keyboard interactions.
 */
let _Button = React.forwardRef(Button);
export {_Button as Button};
