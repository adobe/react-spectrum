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
          'coral-Table-head',
          className
        )
      }
      {...otherProps}
    >
      {children}
    </thead>
  );
}

THead.displayName = 'THead';
