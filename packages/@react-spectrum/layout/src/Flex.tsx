import {filterDOMProps, flexStyleProps, useStyleProps} from '@react-spectrum/utils';
import {FlexProps} from '@react-types/layout';
import {HTMLElement} from 'react-dom';
import React, {RefObject} from 'react';

export const Flex = React.forwardRef((props: FlexProps, ref: RefObject<HTMLElement>) => {
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps, flexStyleProps);
  styleProps.style.display = 'flex'; // inline-flex?

  return (
    <div {...filterDOMProps(otherProps)} {...styleProps} ref={ref}>
      {children}
    </div>
  );
});
