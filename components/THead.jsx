import React from 'react';
import classNames from 'classnames';

export default ({
  className,
  children,
  ...otherProps
}) => (
  <thead
    className={
      classNames(
        'coral-Table-head',
        className
      )
    }
    {...otherProps}
  >
    {children}
  </thead>
);
