/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import classNames from 'classnames';
import PropTypes from 'prop-types';
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
  'aria-label': ariaLabel,
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
    'aria-label': ariaLabel || alt,
    'aria-hidden': (ariaLabel || alt ? null : true),
    role: 'img',
    className: classNames(svg.props.className, 'spectrum-Icon', {[`spectrum-Icon--size${size}`]: size}, className),
    ...otherProps
  });
}

Icon.displayName = 'Icon';

Icon.propTypes = {
  /**
   * Size of icon, XXS to XXL
   */
  size: PropTypes.string
};
