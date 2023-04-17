import {Button as AriaButton} from 'react-aria-components';
import './Button.css';
import React from 'react';

function Button({children, ...props}) {
  return (
    <AriaButton {...props}>
      {children}
    </AriaButton>
  );
}

/**
 * A button allows a user to perform an action, with mouse, touch and keyboard interactions.
 */
let _Button = React.forwardRef(Button);
export {_Button as Button};
