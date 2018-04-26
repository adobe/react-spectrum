import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
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
      {...filterDOMProps(otherProps)}>
      {children}
    </th>
  );
}

TH.displayName = 'TH';
