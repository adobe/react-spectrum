import React from 'react';
import classNames from 'classnames';
import ShellMenu from './internal/ShellMenu';

import Button from '../Button';
import Icon from '../Icon';

export default function ShellUserProfile({
  name,
  heading,
  subheading,
  avatarUrl = '#',
  profileUrl = '#',
  onSignOut = () => {},
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
          className="coral-Shell-menu-button"
          variant="minimal"
          icon="userCircleColor"
          square
        />
      }
      { ...otherProps }
    >
      <div
        className={
          classNames(
            'coral-Shell-user',
            className
          )
        }
      >
        <div className="coral-Shell-user-container">
          <div className="coral-Shell-user-image">
            <Icon icon={ avatarUrl } size="L" className="coral-Shell-user-avatar is-image" />
          </div>
          <div className="coral-Shell-user-name">{ name }</div>
          <div className="coral-Shell-user-heading">{ heading }</div>
          <div className="coral-Shell-user-subheading">{ subheading }</div>
        </div>
        <div className="coral-Shell-user-content">
          { children }
        </div>
        <div className="coral-Shell-user-footer">
          <Button element="a" variant="minimal" onClick={ onSignOut }>Sign Out</Button>
          <Button element="a" variant="minimal" href={ profileUrl }>Profile</Button>
        </div>
      </div>
    </ShellMenu>
  );
}

ShellUserProfile.displayName = 'ShellUserProfile';
