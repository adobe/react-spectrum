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
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('label');

const variants = [
  'grey', 'green', 'blue', 'red', 'orange', 'and', 'or', 'active', 'inactive'
];

export default function Label({size, children, className, variant = variants[0], ...otherProps}) {
  const sizeClassPart = {L: 'large'}[size];

  return (
    <span
      className={
        classNames(
          'spectrum-Label',
          `spectrum-Label--${variant}`,
          {[`spectrum-Label--${sizeClassPart}`]: !!sizeClassPart},
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      {children}
    </span>
  );
}

Label.displayName = 'Label';

Label.propTypes = {
  /**
   * Size of the label
   */
  size: PropTypes.string,

  /**
   * Variant of the label to display
   */
  variant: PropTypes.oneOf(variants)
};
