import {filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {HeaderProps} from '@react-spectrum/layout';
import {HTMLElement} from 'react-dom';
import React, {RefObject} from 'react';


export const Header = React.forwardRef((props: HeaderProps, ref: RefObject<HTMLElement>) => {
  let defaults = {slot: 'header'};
  props = {...defaults, ...props};
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  return (
    <header {...filterDOMProps(otherProps)} {...styleProps} ref={ref}>
      {children}
    </header>
  );
});
