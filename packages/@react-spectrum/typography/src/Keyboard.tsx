import {filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import {KeyboardProps} from '@react-types/typography';
import React, {RefObject} from 'react';


export const Keyboard = React.forwardRef((props: KeyboardProps, ref: RefObject<HTMLElement>) => {
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps({slot: 'keyboard', ...otherProps});

  return (
    <kbd {...filterDOMProps(otherProps)} {...styleProps} ref={ref}>
      {children}
    </kbd>
  );
});
