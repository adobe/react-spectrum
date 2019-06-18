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

/**
 * A table cell
 */
export default function TD({
  className,
  children,
  divider,
  ...otherProps
}) {
  return (
    <td
      className={
        classNames(
          'spectrum-Table-cell',
          {
            'spectrum-Table-cell--divider': divider
          },
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      {children}
    </td>
  );
}

TD.displayName = 'TD';
TD.propTypes = {
  /** Whether or not to display a vertical dividing line to the right of the cell. */
  isDivider: PropTypes.bool
};
