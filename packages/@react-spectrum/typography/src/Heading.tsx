import {DOMProps, StyleProps} from '@react-types/shared';
import {filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {ReactElement, RefObject} from 'react';

export interface HeadingProps extends DOMProps, StyleProps {
  children: ReactElement | string
}

export const Heading = React.forwardRef((props: HeadingProps, ref: RefObject<HTMLElement>) => {
  let defaults = {slot: 'heading'};
  props = {...defaults, ...props};
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  // h level hardcoded for the moment and no specific className at the moment, this is barebones
  return (
    <h1 {...filterDOMProps(otherProps)} {...styleProps} ref={ref}>
      {children}
    </h1>
  );
});
