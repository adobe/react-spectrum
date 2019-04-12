import classNames from 'classnames';
import React from 'react';

export function cloneIcon(icon, opts = {}) {
  if (!icon) {
    return null;
  }

  if (typeof icon === 'string') {
    throw new Error('String icon names are deprecated. Pass icons by importing them from react-spectrum/Icon/IconName and render as <IconName />.');
  }

  const {
    className,
    size,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    alt = ariaLabel || icon.props['aria-label'] || icon.props.alt
  } = opts;

  return React.cloneElement(icon, {
    className: classNames(className, icon.props.className),
    size: icon.props.size || size,
    'aria-label': ariaLabel || alt,
    alt,
    'aria-hidden': ariaHidden || (alt ? icon.props['aria-hidden'] : true)
  });
}
