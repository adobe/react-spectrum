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

import Button from '../../Button';
import classNames from 'classnames';
import React from 'react';
import ShellMenu from './ShellMenu';
import '../style/ShellUserProfile.styl';

export default function ShellUserProfile({
  name,
  heading,
  subheading,
  avatarUrl = '#',
  profileUrl = '#',
  onSignOut = function () {},
  children,
  className,
  ...otherProps
}) {
  return (
    <ShellMenu
      placement="right"
      animateFrom="top"
      target={
        <Button
          className="coral3-Shell-menu-button"
          variant="minimal">
          <img src={avatarUrl} alt="" aria-hidden="true" />
        </Button>
      }
      {...otherProps}>
      <div
        className={
          classNames(
            'coral3-Shell-user',
            className
          )
        }>
        <div className="coral3-Shell-user-container">
          <div className="coral3-Shell-user-image">
            <img src={avatarUrl} alt="" aria-hidden="true" className="coral3-Shell-user-avatar" />
          </div>
          <div className="coral3-Shell-user-name">{name}</div>
          <div className="coral3-Shell-user-heading">
            {heading && heading !== 'null' ? heading : ''}
          </div>
          <div className="coral3-Shell-user-subheading">
            {subheading && subheading !== 'null' ? subheading : ''}
          </div>
        </div>
        <div className="coral3-Shell-user-content">
          {children}
        </div>
        <div className="coral3-Shell-user-footer">
          <Button element="a" variant="minimal" href={profileUrl}>Edit Profile</Button>
          <Button element="a" variant="minimal" onClick={onSignOut}>Sign Out</Button>
        </div>
      </div>
    </ShellMenu>
  );
}

ShellUserProfile.displayName = 'ShellUserProfile';
