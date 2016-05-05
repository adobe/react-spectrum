import React from 'react';
import classNames from 'classnames';

export default ({
  icon, // add, bell, heart, star
  size, // XS, S, M, L
  className,
  ...rest
}) => {
  let isColorIcon = false;

  if (icon.indexOf('Color') >= 0) {
    isColorIcon = true;
  }

  return (
    <i
      className={
        classNames(
          'coral-Icon',
          `coral-Icon--size${ size || 'M' }`,
          `coral-Icon--${ icon }`,
          {
            'coral-ColorIcon': isColorIcon
          },
          className
        )
      }
      { ...rest }
    />
  );
}
