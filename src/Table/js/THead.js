import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import React from 'react';

export default function THead({
  className,
  children,
  ...otherProps
}) {
  return (
    <thead
      className={
        classNames(
          'spectrum-Table-head',
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      <tr>{children}</tr>
    </thead>
  );
}

THead.displayName = 'THead';
