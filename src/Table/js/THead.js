import React from 'react';
import classNames from 'classnames';

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
