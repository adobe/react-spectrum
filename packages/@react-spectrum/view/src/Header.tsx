import {DOMProps, ViewStyleProps} from '@react-types/shared';
import {filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {ReactElement, RefObject} from 'react';

export interface HeaderProps extends DOMProps, ViewStyleProps {
  children: ReactElement | ReactElement[]
}


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
