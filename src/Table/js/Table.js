import classNames from 'classnames';
import React from 'react';
import '../style/index.styl';

export default function Table({
  hover = false,
  bordered = false,
  className,
  children,
  ...otherProps
}) {
  return (
    <table
      className={
        classNames(
          'coral-Table',
          {
            'coral-Table--hover': hover,
            'coral-Table--bordered': bordered
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
