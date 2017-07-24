import classNames from 'classnames';
import React from 'react';
import '../style/index.styl';

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
          'spectrum-Wait',
          {
            'spectrum-Wait--large': size === 'L',
            'spectrum-Wait--medium': size === 'M',
            'spectrum-Wait--centered': centered,
            'spectrum-Wait--dots': variant === 'dots'
          },
          className
        )
      }
      {...otherProps}
    />
  );
}

Wait.displayName = 'Wait';
