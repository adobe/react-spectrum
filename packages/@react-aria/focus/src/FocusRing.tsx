import classNames from 'classnames';
import React, {ReactElement, useState} from 'react';
import {useFocus, useFocusVisible, useFocusWithin} from '@react-aria/interactions';

interface FocusRingProps {
  children?: ReactElement,
  focusClass?: string,
  focusRingClass?: string,
  within?: boolean,
  isTextInput?: boolean
}

export function FocusRing(props: FocusRingProps) {
  let {children, focusClass, focusRingClass, within} = props;
  let [isFocused, setFocused] = useState(false);
  let [isFocusWithin, setFocusWithin] = useState(false);
  let {isFocusVisible} = useFocusVisible(props);
  let {focusProps} = useFocus({isDisabled: within, onFocusChange: setFocused});
  let {focusWithinProps} = useFocusWithin({isDisabled: !within, onFocusWithinChange: setFocusWithin});

  return React.cloneElement(React.Children.only(children), {
    ...(within ? focusWithinProps : focusProps),
    className: classNames(children.props.className, {
      [focusClass || '']: (within ? isFocusWithin : isFocused),
      [focusRingClass || '']: (within ? isFocusWithin : isFocused) && isFocusVisible
    })
  });
}
