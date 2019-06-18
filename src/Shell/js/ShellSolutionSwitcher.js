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

import AppsIcon from '../../Icon/Apps';
import Button from '../../Button';
import classNames from 'classnames';
import React from 'react';
import ShellMenu from './ShellMenu';
import '../style/ShellSolutionSwitcher.styl';

export default function ShellSolutionSwitcher({
  className,
  children,
  ...otherProps
}) {
  return (
    <ShellMenu
      placement="top"
      animateFrom="top"
      full
      dark
      top
      target={
        <Button
          className="coral3-Shell-menu-button"
          variant="minimal"
          icon={<AppsIcon />} />
      }
      {...otherProps}>
      <div
        className={
          classNames(
            'coral3-Shell-solutionSwitcher',
            className
          )
        }>
        <div className="coral3-Shell-solutionSwitcher-content">
          {children}
        </div>
      </div>
    </ShellMenu>
  );
}

ShellSolutionSwitcher.displayName = 'ShellSolutionSwitcher';
