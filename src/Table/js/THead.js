import classNames from 'classnames';
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
      {...otherProps}>
      <tr>{children}</tr>
    </thead>
  );
}

THead.displayName = 'THead';
