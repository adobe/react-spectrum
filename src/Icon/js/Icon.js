import classNames from 'classnames';
import React from 'react';
importSpectrumCSS('icon');

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
  alt,
  ...otherProps
}) {
  const sizeKey = SIZES[size];
  let svg = (icon && icon[sizeKey]) || icon || children;
  if (typeof svg === 'string') {
    throw new Error('String icon names are deprecated. Please import icons from react-spectrum/Icon/IconName and render as <IconName />.');
  }

  return React.cloneElement(svg, {
    focusable: 'false',
    'aria-label': alt,
    'aria-hidden': (alt ? null : 'true'),
    role: 'img',
    className: classNames(svg.props.className, 'spectrum-Icon', {[`spectrum-Icon--size${size}`]: size}, className),
    ...otherProps
  });
}

Icon.displayName = 'Icon';
