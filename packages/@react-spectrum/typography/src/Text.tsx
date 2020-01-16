import {filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {RefObject} from 'react';
import {TextProps} from '@react-types/typography';


export const Text = React.forwardRef((props: TextProps, ref: RefObject<HTMLElement>) => {
  let defaults = {slot: 'text'}; // still unsure about name
  props = {...defaults, ...props};
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  return (
    <span {...filterDOMProps(otherProps)} {...styleProps} ref={ref}>
      {children}
    </span>
  );
});
