import React, { Component } from 'react';
import classNames from 'classnames';

import Icon from '../Icon';

import './ShellHeader.styl';

export default class ShellHeader extends Component {
  static defaultProps = {
    homeURL: '#',
    homeIcon: 'adobeExperienceManagerColor',
    homeTitle: 'Adobe Experience Manager'
  };

  render() {
    const {
      homeURL,
      homeIcon,
      homeTitle,
      workspaces,
      children
    } = this.props;

    return (
      <div className="coral-Shell-header coral--dark">
        <div className="coral-Shell-header-home" aria-level="2">
          <a className="coral-Shell-homeAnchor" href={ homeURL } role="heading" aria-level="2">
            <Icon icon={ homeIcon } />
            <div className="coral-Shell-homeAnchor-label">{ homeTitle }</div>
          </a>
        </div>
        { children }
      </div>
    )
  }
}
