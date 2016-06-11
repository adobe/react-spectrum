import React from 'react';
import classNames from 'classnames';

export default ({
  className,
  children,
  ...otherProps
}) => (
  <tr
    className={
      classNames(
        'coral-Table-row',
        className
      )
    }
    {...otherProps}
  >
    { children }
  </tr>
);
