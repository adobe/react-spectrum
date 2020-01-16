import {DOMProps, ViewStyleProps} from '@react-types/shared';
import {filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {ReactElement, RefObject} from 'react';

export interface ContentProps extends DOMProps, ViewStyleProps {
  children: ReactElement | string | ReactElement[]
}

export const Content = React.forwardRef((props: ContentProps, ref: RefObject<HTMLElement>) => {
  let defaults = {slot: 'content'};
  props = {...defaults, ...props};
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  return (
    <section {...filterDOMProps(otherProps)} {...styleProps} ref={ref}>
      {children}
    </section>
  );
});
