import React from 'react';
import classNames from 'classnames';

export default ({
  className,
  children,
  ...otherProps
}) => (
  <th
    className={
      classNames(
        'coral-Table-headerCell',
        className
      )
    }
    {...otherProps}
  >
    { children }
  </th>
);
