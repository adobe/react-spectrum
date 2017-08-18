import classNames from 'classnames';
import React from 'react';

export default function ListGroup({label, className, children, ...otherProps}) {
  return (
    <ul
      className={classNames('coral-BasicList-group', className)}
      label={label}
      role="group"
      aria-label={label}>
      {React.Children.map(children, child => React.cloneElement(child, otherProps))}
    </ul>
  );
}
