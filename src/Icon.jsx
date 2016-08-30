import React from 'react';
import classNames from 'classnames';

import { isUrl } from './utils/string';

export default function Icon({
  icon, // add, bell, heart, star
  size = 'M', // XS, S, M, L
  className,
  ...otherProps
}) {
  const isImage = isUrl(icon);
  const isColorIcon = !isImage && icon && icon.indexOf('Color') >= 0;

  return (
    <span
      className={
        classNames(
          'coral-Icon',
          `coral-Icon--size${ size }`,
          {
            [`coral-Icon--${ icon }`]: !isImage,
            'coral-ColorIcon': isColorIcon,
            'is-image': isImage
          },
          className
        )
      }
      role="img"
      { ...otherProps }
    >
      {
        isImage &&
        <img className="coral-Icon-image" src={ icon } role="presentation" />
      }
    </span>
  );
}

Icon.displayName = 'Icon';
