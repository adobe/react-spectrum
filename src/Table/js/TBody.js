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
import React from 'react';

/**
 * A table body
 */
export default function TBody({
  className,
  children,
  ...otherProps
}) {
  return (
    <tbody
      className={
        classNames(
          'spectrum-Table-body',
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      {children}
    </tbody>
  );
}

TBody.displayName = 'TBody';
