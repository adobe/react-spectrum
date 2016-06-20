import React from 'react';
import classNames from 'classnames';

export default function Icon({
  icon, // add, bell, heart, star
  size = 'M', // XS, S, M, L
  className,
  ...otherProps
}) {
  let isColorIcon = false;

  if (icon.indexOf('Color') >= 0) {
    isColorIcon = true;
  }

  return (
    <i
      className={
        classNames(
          'coral-Icon',
          `coral-Icon--size${ size }`,
          `coral-Icon--${ icon }`,
          {
            'coral-ColorIcon': isColorIcon
          },
          className
        )
      }
      role="img"
      { ...otherProps }
    />
  );
}
