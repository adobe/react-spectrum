import React from 'react';
import classNames from 'classnames';

export default function Wait({
  size = 'S',
  centered = false,
  className,
  variant,
  ...otherProps
}) {
  return (
    <div
      className={
        classNames(
          'coral-Wait',
          {
            'coral-Wait--large': size === 'L',
            'coral-Wait--medium': size === 'M',
            'coral-Wait--centered': centered,
            'coral-Wait--dots': variant === 'dots'
          },
          className
        )
      }
      { ...otherProps }
    />
  );
}

Wait.displayName = 'Wait';
