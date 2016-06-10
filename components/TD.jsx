import React from 'react';
import classNames from 'classnames';

export default ({
  className,
  children,
  ...otherProps
}) => (
  <td
    className={
      classNames(
        'coral-Table-cell',
        className
      )
    }
    {...otherProps}
  >
    {children}
  </td>
);
