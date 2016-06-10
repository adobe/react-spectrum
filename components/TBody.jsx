import React from 'react';
import classNames from 'classnames';

export default ({
  className,
  children,
  ...otherProps
}) => (
  <tbody
    className={
      classNames(
        'coral-Table-body',
        className
      )
    }
    {...otherProps}
  >
    {children}
  </tbody>
);
