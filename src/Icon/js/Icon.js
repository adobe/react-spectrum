import classNames from 'classnames';
import React from 'react';
import '../style/index.styl';

const SIZES = {
  XXS: 18,
  XS: 24,
  S: 18,
  M: 24,
  L: 18,
  XL: 24,
  XXL: 24
};

export default function Icon({
  icon, // add, bell, heart, star
  size = 'M', // XS, S, M, L
  className,
  children,
  ...otherProps
}) {
  const sizeKey = SIZES[size];
  let svg = (icon && icon[sizeKey]) || icon || children;
  if (typeof svg === 'string') {
    throw new Error('String icon names are deprecated. Please import icons from react-spectrum/Icon/IconName and render as <IconName />.');
  }

  return React.cloneElement(svg, {
    focusable: 'false',
    'aria-hidden': 'true',
    role: 'img',
    className: classNames('spectrum-Icon', `spectrum-Icon--size${size}`, className)
  });
}

Icon.displayName = 'Icon';
