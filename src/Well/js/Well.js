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

importSpectrumCSS('well');

export default function Well({
  children,
  className,
  ...otherProps
}) {
  return (
    <div
      className={
        classNames(
          'spectrum-Well',
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      {children}
    </div>
  );
}

Well.displayName = 'Well';

Well.propTypes = {
  /** Custom CSS class to add to the Well component */
  className: PropTypes.string,
  /** Limited WAI-ARIA landmark roles for Well component */
  role: PropTypes.oneOf(['form', 'group', 'navigation', 'region', 'search'])
};
