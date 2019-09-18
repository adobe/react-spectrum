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
import '../../utils/style/index.styl';

export default function VisuallyHidden({
  children,
  className,
  element: Element = 'span',
  focusable,
  ...otherProps
}) {
  return (<Element className={classNames('u-react-spectrum-screenReaderOnly', {'is-focusable': focusable}, className)} {...filterDOMProps(otherProps)}>{children}</Element>);
}

VisuallyHidden.displayName = 'VisuallyHidden';

VisuallyHidden.propTypes = {
  /**
   * The css class for the visually hidden element, it's applied to the top level element.
   */
  className: PropTypes.string,

  /**
   * The DOM element to use to render the visually hidden element
   */
  element: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

  /**
   * Whether the visually hidden element can become visible on keyboard focus.
   */
  focusable: PropTypes.bool
};

VisuallyHidden.defaultProps = {
  element: 'span',
  focusable: false
};
