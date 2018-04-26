import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import React from 'react';

export default function TR({
  className,
  children,
  ...otherProps
}) {
  return (
    <tr
      className={
        classNames(
          'spectrum-Table-row',
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      {children}
    </tr>
  );
}

TR.displayName = 'TR';
