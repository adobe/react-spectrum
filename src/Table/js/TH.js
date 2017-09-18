import classNames from 'classnames';
import React from 'react';

export default function TH({
  className,
  children,
  ...otherProps
}) {
  return (
    <th
      className={
        classNames(
          'spectrum-Table-headCell',
          className
        )
      }
      {...otherProps}>
      {children}
    </th>
  );
}

TH.displayName = 'TH';
