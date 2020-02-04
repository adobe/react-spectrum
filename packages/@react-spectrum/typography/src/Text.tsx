import {filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {RefObject} from 'react';
import {TextProps} from '@react-types/typography';


export const Text = React.forwardRef((props: TextProps, ref: RefObject<HTMLElement>) => {
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps({slot: 'text', ...otherProps});

  return (
    <p {...filterDOMProps(otherProps)} {...styleProps} ref={ref}>
      {children}
    </p>
  );
});
