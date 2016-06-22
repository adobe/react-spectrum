import React from 'react';
import classNames from 'classnames';

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
      { ...otherProps }
    >
      { children }
    </tbody>
  );
}
