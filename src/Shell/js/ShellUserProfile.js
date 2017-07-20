import Button from '../../Button';
import classNames from 'classnames';
import Icon from '../../Icon';
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
          variant="minimal"
          icon={avatarUrl}
          iconSize="M"
          square
        />
      }
      {...otherProps}
    >
      <div
        className={
          classNames(
            'coral3-Shell-user',
            className
          )
        }
      >
        <div className="coral3-Shell-user-container">
          <div className="coral3-Shell-user-image">
            <Icon icon={avatarUrl} size="L" className="coral3-Shell-user-avatar is-image" />
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
