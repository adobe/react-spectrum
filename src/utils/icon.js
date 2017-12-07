import classNames from 'classnames';
import React from 'react';

export function cloneIcon(icon, opts = {}) {
  if (!icon) {
    return null;
  }

  if (typeof icon === 'string') {
    throw new Error('String icon names are deprecated. Pass icons by importing them from react-spectrum/Icon/IconName and render as <IconName />.');
  }

  return React.cloneElement(icon, {
    className: classNames(opts.className, icon.props.className),
    size: icon.props.size || opts.size
  });
}
