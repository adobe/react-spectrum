import React, {useState, ReactElement} from 'react';
import classNames from 'classnames';
import {Focus} from './Focus';

interface FocusRingProps {
  children?: ReactElement,
  focusClass?: string,
  focusRingClass?: string,
  within?: boolean
}

export function FocusRing({children, focusClass, focusRingClass, within}: FocusRingProps) {
  let [isFocused, setFocused] = useState(false);
  let [isFocusVisible, setFocusVisible] = useState(false);
  let props = within 
    ? {onFocusWithinChange: setFocused, onFocusVisibleWithinChange: setFocusVisible}
    : {onFocusChange: setFocused, onFocusVisibleChange: setFocusVisible};

  return (
    <Focus {...props}>
      {React.cloneElement(React.Children.only(children), {
        className: classNames(children.props.className, {
          [focusClass || '']: isFocused,
          [focusRingClass || '']: isFocusVisible
        })
      })}
    </Focus>
  );
}
