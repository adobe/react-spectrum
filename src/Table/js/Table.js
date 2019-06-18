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

importSpectrumCSS('table');

/**
 * A table
 */
export default function Table({
  quiet,
  className,
  children,
  ...otherProps
}) {
  return (
    <table
      className={
        classNames(
          'spectrum-Table',
          {
            'spectrum-Table--quiet': quiet
          },
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      {children}
    </table>
  );
}

Table.displayName = 'Table';
Table.propTypes = {
  /** Items to display in the Table. Use Tbody, TD, TH, THead, TR, or other elements permitted in a table. */
  children: PropTypes.node,

  /** Whether or not the table should be rendered using a quiet variant. */
  quiet: PropTypes.bool
};
