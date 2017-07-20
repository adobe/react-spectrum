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
          'coral-Table-headerCell',
          className
        )
      }
      {...otherProps}
    >
      {children}
    </th>
  );
}

TH.displayName = 'TH';
