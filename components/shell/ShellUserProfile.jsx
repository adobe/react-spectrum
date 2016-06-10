import React, { Component } from 'react';
import classNames from 'classnames';
import ShellMenu from './ShellMenu';

import Button from '../Button';
import Icon from '../Icon';

export default class ShellUserProfile extends Component {
  static defaultProps = {
    avatarUrl: '#',
    profileUrl: '#',
    onSignOut: () => {}
  };

  render() {
    const {
      name,
      heading,
      subheading,
      avatarUrl,
      profileUrl,
      onSignOut,
      children,
      className,
      ...otherProps
    } = this.props;

    return (
      <ShellMenu
        placement="right"
        animateFrom="top"
        target={ <Button variant="minimal" className="coral-Shell-menu-button" icon="userCircleColor" square /> }
        { ...otherProps }
      >
        <div className='coral-Shell-user'>
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
}
