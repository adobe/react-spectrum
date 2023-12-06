
import {DOMRef} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import {KeyboardProps} from '@react-types/text';
import React, {forwardRef} from 'react';
import {useDOMRef, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {Keyboard as RACKeyboard} from 'react-aria-components';

function Keyboard(props: KeyboardProps, ref: DOMRef) {
  props = useSlotProps(props, 'keyboard');
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let domRef = useDOMRef(ref);

  return (
    <RACKeyboard {...filterDOMProps(otherProps)} {...styleProps} ref={domRef}>
      {children}
    </RACKeyboard>
  );
}

/**
 * Keyboard represents text that specifies a keyboard command.
 */
const _Keyboard = forwardRef(Keyboard);
export {_Keyboard as Keyboard};
