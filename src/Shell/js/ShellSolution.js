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
import {cloneIcon} from '../../utils/icon';
import React from 'react';

export default function ShellSolution({
  href,
  label,
  icon,
  entitled,
  className,
  children,
  ...otherProps
}) {
  return (
    <a
      className={
        classNames(
          'coral3-Shell-solution',
          {'coral3-Shell-solution--linked': entitled},
          className
        )
      }
      href={href}
      {...otherProps}>
      {cloneIcon(icon, {className: 'coral3-Shell-solution-icon', size: 'L'})}
      <div className="coral3-Shell-solution-label">{label}{children}</div>
    </a>
  );
}

ShellSolution.displayName = 'ShellSolution';
