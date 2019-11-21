import React, {ReactElement, ReactNode} from 'react';

export function getWrappedElement(children: string | ReactElement | ReactNode): ReactElement {
  let element;
  if (typeof children === 'string') {
    element = <span>{children}</span>;
  } else {
    element = React.Children.only(children);
  }
  return element;
}
