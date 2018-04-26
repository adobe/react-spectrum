import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import React from 'react';

importSpectrumCSS('table');

export default function Table({
  quiet,
  className,
  children,
  ...otherProps
}) {
  return (
    <table
      className={
        classNames(
          'spectrum-Table',
          {
            'spectrum-Table--quiet': quiet
          },
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      {children}
    </table>
  );
}

Table.displayName = 'Table';
