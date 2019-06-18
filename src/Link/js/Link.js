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

import {chain} from '../../utils/events';
import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('link');

function preventDefault(e) {
  if (!e.defaultPrevented) {
    e.preventDefault();
  }
}

export default function Link({
  subtle, // deprecated, use variant instead
  variant,
  children,
  className,
  href,
  onClick,
  ...otherProps
}) {
  if (subtle) {
    console.warn('The "subtle" prop of Link is deprecated. Please use variant="quiet" instead.');
    variant = 'quiet';
  }

  if (variant === 'subtle') {
    console.warn('The "subtle" variant of Link is deprecated. Please use variant="quiet" instead.');
    variant = 'quiet';
  }

  if (!href && typeof onClick === 'function') {
    href = '#';
    onClick = chain(onClick, preventDefault);
  }

  return (
    <a
      className={
        classNames(
          'spectrum-Link',
          {[`spectrum-Link--${variant}`]: variant},
          className
        )
      }
      href={href}
      onClick={onClick}
      {...filterDOMProps(otherProps)}>
      {children}
    </a>
  );
}

Link.propTypes = {
  /** Class to add to the Link */
  className: PropTypes.string,

  /** Link variant */
  variant: PropTypes.oneOf(['quiet', 'subtle', 'overBackground'])
};

Link.displayName = 'Link';
