import {DOMProps, StyleProps} from '@react-types/shared';
import {filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {ReactElement, RefObject} from 'react';

export interface FooterProps extends DOMProps, StyleProps {
  children: ReactElement | ReactElement[]
}

export const Footer = React.forwardRef((props: FooterProps, ref: RefObject<HTMLElement>) => {
  let defaults = {slot: 'footer'};
  props = {...defaults, ...props};
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  return (
    <footer {...filterDOMProps(otherProps)} {...styleProps} ref={ref}>
      {children}
    </footer>
  );
});
