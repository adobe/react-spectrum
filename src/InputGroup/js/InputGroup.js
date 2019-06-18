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

importSpectrumCSS('inputgroup');

export default function InputGroup({quiet, focused, invalid, disabled, className, children, ...otherProps}) {
  return (
    <div
      aria-disabled={disabled}
      aria-invalid={invalid}
      className={
        classNames(
          'spectrum-InputGroup',
          {
            'spectrum-InputGroup--quiet': quiet,
            'is-focused': focused,
            'is-invalid': invalid,
            'is-disabled': disabled
          },
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      {children}
    </div>
  );
}
