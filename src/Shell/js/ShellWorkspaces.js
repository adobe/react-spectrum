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

export default function ShellWorkspaces({
  className,
  children,
  ...otherProps
}) {
  return (
    <div className={classNames('coral3-Shell-header-content', className)} {...otherProps}>
      <div className="coral3-Shell-workspaces">
        {children}
      </div>
    </div>
  );
}

ShellWorkspaces.displayName = 'ShellWorkspaces';
