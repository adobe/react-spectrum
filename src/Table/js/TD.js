import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import React from 'react';

export default function TD({
  className,
  children,
  ...otherProps
}) {
  return (
    <td
      className={
        classNames(
          'spectrum-Table-cell',
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      {children}
    </td>
  );
}

TD.displayName = 'TD';
