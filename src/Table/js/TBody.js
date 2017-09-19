import classNames from 'classnames';
import React from 'react';

export default function TBody({
  className,
  children,
  ...otherProps
}) {
  return (
    <tbody
      className={
        classNames(
          'coral-Table-body',
          className
        )
      }
      {...otherProps}>
      {children}
    </tbody>
  );
}

TBody.displayName = 'TBody';
