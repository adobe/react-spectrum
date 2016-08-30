import React from 'react';
import classNames from 'classnames';

import Icon from '../Icon';

import './ShellHeader.styl';

export default function ShellHeader({
  homeURL = '#',
  homeIcon = 'adobeExperienceManagerColor',
  homeTitle = 'Adobe Experience Manager',
  className,
  children,
  ...otherProps
}) {
  return (
    <div
      className={
        classNames(
          'coral-Shell-header',
          'coral--dark',
          className
        )
      }
      { ...otherProps }
    >
      <div className="coral-Shell-header-home" aria-level="2">
        <a className="coral-Shell-homeAnchor" href={ homeURL } role="heading" aria-level="2">
          <Icon icon={ homeIcon } />
          <div className="coral-Shell-homeAnchor-label">{ homeTitle }</div>
        </a>
      </div>
      { children }
    </div>
  );
}

ShellHeader.displayName = 'ShellHeader';
