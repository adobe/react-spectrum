import classNames from 'classnames';
import Icon from '../../Icon';
import React from 'react';
import '../style/ShellHeader.styl';

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
          'coral3-Shell-header',
          'coral--dark',
          className
        )
      }
      {...otherProps}>
      <div className="coral3-Shell-header-home" aria-level="2">
        <a className="coral3-Shell-homeAnchor" href={homeURL} role="heading" aria-level="2">
          <Icon icon={homeIcon} />
          <div className="coral3-Shell-homeAnchor-label">{homeTitle}</div>
        </a>
      </div>
      {children}
    </div>
  );
}

ShellHeader.displayName = 'ShellHeader';
