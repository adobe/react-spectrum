import classNames from 'classnames';
import {mergeProps} from '@react-aria/utils';
import React, {ReactElement, useState} from 'react';
import {useFocus, useFocusVisible, useFocusWithin} from '@react-aria/interactions';

interface FocusRingProps {
  children?: ReactElement,
  focusClass?: string,
  focusRingClass?: string,
  within?: boolean,
  isTextInput?: boolean,
  autoFocus?: boolean
}

export function FocusRing(props: FocusRingProps) {
  let {children, focusClass, focusRingClass, within} = props;
  let [isFocused, setFocused] = useState(false);
  let [isFocusWithin, setFocusWithin] = useState(false);
  let {isFocusVisible} = useFocusVisible(props);
  let {focusProps} = useFocus({
    isDisabled: within,
    onFocusChange: setFocused,
    onFocus: e => e.continuePropagation(),
    onBlur: e => e.continuePropagation()
  });
  let {focusWithinProps} = useFocusWithin({
    isDisabled: !within,
    onFocusWithinChange: setFocusWithin,
    onFocusWithin: e => e.continuePropagation(),
    onBlurWithin: e => e.continuePropagation()
  });
  let child = React.Children.only(children);

  return React.cloneElement(child, mergeProps(child.props, {
    ...(within ? focusWithinProps : focusProps),
    className: classNames({
      [focusClass || '']: (within ? isFocusWithin : isFocused),
      [focusRingClass || '']: (within ? isFocusWithin : isFocused) && isFocusVisible
    })
  }));
}
