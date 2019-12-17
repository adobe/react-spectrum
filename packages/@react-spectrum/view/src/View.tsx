import {filterDOMProps, useStyleProps, viewStyleProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {HTMLAttributes, JSXElementConstructor, ReactNode, RefObject} from 'react';
import {ViewStyleProps} from '@react-types/shared';

export interface ViewProps extends ViewStyleProps, Omit<HTMLAttributes<HTMLElement>, 'className' | 'style'> {
  elementType?: string | JSXElementConstructor<any>,
  children?: ReactNode
}

export const View = React.forwardRef((props: ViewProps, ref: RefObject<HTMLElement>) => {
  let {
    elementType: ElementType = 'div',
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(props, viewStyleProps);

  return (
    <ElementType
      {...filterDOMProps(otherProps)}
      {...styleProps}
      ref={ref}>
      {children}
    </ElementType>
  );
});
