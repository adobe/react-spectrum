import classNames from 'classnames';
import React from 'react';
import '../style/index.styl';

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
      {...otherProps}>
      {children}
    </table>
  );
}

Table.displayName = 'Table';
