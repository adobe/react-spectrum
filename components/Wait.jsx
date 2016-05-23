import React from 'react';
import classNames from 'classnames';

export default ({
  large = false,
  centered = false,
  className,
  ...otherProps
}) => {
  return (
    <div
      className={
        classNames(
          'coral-Wait',
          {
            'coral-Wait--large': large,
            'coral-Wait--centered': centered
          },
          className
        )
      }
      { ...otherProps }
    />
  );
}
