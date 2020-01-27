import {DOMProps, StyleProps} from '@react-types/shared';
import {filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {ReactNode, RefObject} from 'react';

export interface HeadingProps extends DOMProps, StyleProps {
  children: ReactNode | string
}

export const Heading = React.forwardRef((props: HeadingProps, ref: RefObject<HTMLElement>) => {
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps({slot: 'heading', ...otherProps});

  // h level hardcoded for the moment and no specific className at the moment, this is barebones
  return (
    <h1 {...filterDOMProps(otherProps, {'aria-level': 1})} {...styleProps} ref={ref}>
      {children}
    </h1>
  );
});
