import React, {JSXElementConstructor, ReactElement, ReactNode} from 'react';

export function getWrappedElement(children: string | ReactElement | ReactNode, elementType?: string | JSXElementConstructor<any>): ReactElement {
  let element;
  let ElementType = elementType || 'span';
  if (typeof children === 'string') {
    element = <ElementType>{children}</ElementType>;
  } else {
    element = React.Children.only(children);
  }
  return element;
}
