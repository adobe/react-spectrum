import classNames from 'classnames';
import {Focus} from './Focus';
import React, {ReactElement, useState} from 'react';

interface FocusRingProps {
  children?: ReactElement,
  focusClass?: string,
  focusRingClass?: string,
  within?: boolean
}

export function FocusRing(props: FocusRingProps) {
  let {children, focusClass, focusRingClass, within} = props;
  let [isFocused, setFocused] = useState(false);
  let [isFocusVisible, setFocusVisible] = useState(false);
  let focusProps = within
    ? {onFocusWithinChange: setFocused, onFocusVisibleWithinChange: setFocusVisible}
    : {onFocusChange: setFocused, onFocusVisibleChange: setFocusVisible};

  return (
    <Focus {...focusProps}>
      {React.cloneElement(React.Children.only(children), {
        className: classNames(children.props.className, {
          [focusClass || '']: isFocused,
          [focusRingClass || '']: isFocusVisible
        })
      })}
    </Focus>
  );
}
