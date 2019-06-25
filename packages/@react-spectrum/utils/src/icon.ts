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
import React from 'react';

interface CloneIconOptions {
  className?: string,
  size?: string,
  'aria-label'?: string,
  'aria-hidden'?: boolean,
  alt?: string
}

export function cloneIcon(icon, opts:CloneIconOptions = {}) {
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
