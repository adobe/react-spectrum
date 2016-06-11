import React from 'react';
import classNames from 'classnames';

export default ({
  hover = false,
  bordered = false,
  className,
  children,
  ...otherProps
}) => (
  <table
    className={
      classNames(
        'coral-Table',
        {
          'coral-Table--hover': hover,
          'coral-Table--bordered': bordered
        },
        className
      )
    }
    {...otherProps}
  >
    { children }
  </table>
);
